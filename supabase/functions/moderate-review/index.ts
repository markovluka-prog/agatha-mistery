import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
const MODERATION_THRESHOLD = Number(Deno.env.get("MODERATION_THRESHOLD") || "7");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const REQUIRE_AUTHENTICATED_USER = (Deno.env.get("REQUIRE_AUTHENTICATED_USER") || "false").toLowerCase() === "true";
const SITE_ORIGIN = Deno.env.get("SITE_ORIGIN") || "";
const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") || SITE_ORIGIN)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const MAX_NAME_LEN = 60;
const MAX_TEXT_LEN = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

const getClientIp = (req: Request): string => {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        const firstIp = forwarded
            .split(",")
            .map((item) => item.trim())
            .find(Boolean);
        if (firstIp) return firstIp;
    }
    return req.headers.get("cf-connecting-ip") || "unknown";
};

const hasAllowedRequestContext = (req: Request, origin: string): boolean => {
    const referer = req.headers.get("referer");
    if (referer) {
        try {
            const refererUrl = new URL(referer);
            if (refererUrl.origin !== origin) return false;
        } catch (_error) {
            return false;
        }
    }

    const secFetchSite = (req.headers.get("sec-fetch-site") || "").toLowerCase();
    if (secFetchSite && !["same-origin", "same-site", "none"].includes(secFetchSite)) {
        return false;
    }

    return true;
};

const validateAuthenticatedUser = async (authorization: string | null): Promise<boolean> => {
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
        return false;
    }

    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
            method: "GET",
            headers: {
                Authorization: authorization,
                apikey: SUPABASE_SERVICE_ROLE_KEY
            }
        });
        return response.ok;
    } catch (_error) {
        return false;
    }
};

const checkRateLimit = (key: string) => {
    const now = Date.now();
    const current = rateLimitStore.get(key);
    if (!current || current.expiresAt <= now) {
        rateLimitStore.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
        return { ok: true, retryAfterSec: 0 };
    }
    if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { ok: false, retryAfterSec: Math.ceil((current.expiresAt - now) / 1000) };
    }
    current.count += 1;
    return { ok: true, retryAfterSec: 0 };
};

const corsHeadersFor = (origin: string | null) => {
    const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "";
    const headers: Record<string, string> = {
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Vary": "Origin"
    };

    if (allowOrigin) {
        headers["Access-Control-Allow-Origin"] = allowOrigin;
    }
    return headers;
};

const jsonResponse = (origin: string | null, status: number, payload: Record<string, unknown>, extraHeaders: Record<string, string> = {}) => {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            ...corsHeadersFor(origin),
            "Content-Type": "application/json",
            ...extraHeaders
        }
    });
};

const extractOutputText = (data: any) => {
    const output = Array.isArray(data?.output) ? data.output : [];
    for (const item of output) {
        const content = Array.isArray(item?.content) ? item.content : [];
        for (const part of content) {
            if (part?.type === "output_text" && typeof part.text === "string") {
                return part.text.trim();
            }
        }
    }
    return "";
};

const scoreReview = async (name: string, text: string) => {
    const instructions =
        "Ты модератор детского фан-сайта. Оцени отзыв по шкале 1-10, " +
        "где 10 — полностью безопасный, доброжелательный и уместный. " +
        "Учитывай: отсутствие мата/оскорблений/ненависти/сексуального контента, " +
        "минимум личных данных и нормальный язык. " +
        "Ответ верни строго в JSON с полями score (целое 1-10) и reason (строка).";

    const payload = {
        model: OPENAI_MODEL,
        instructions,
        input: `Имя: ${name}\nОтзыв: ${text.slice(0, 1000)}`,
        temperature: 0,
        max_output_tokens: 200,
        text: {
            format: {
                type: "json_schema",
                name: "review_score",
                strict: true,
                schema: {
                    type: "object",
                    properties: {
                        score: { type: "integer", minimum: 1, maximum: 10 },
                        reason: { type: "string" }
                    },
                    required: ["score", "reason"],
                    additionalProperties: false
                }
            }
        }
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI error: ${errorText}`);
    }

    const data = await response.json();
    const outputText = extractOutputText(data);
    if (!outputText) {
        throw new Error("OpenAI response is empty");
    }

    let parsed: { score: number; reason: string } | null = null;
    try {
        parsed = JSON.parse(outputText);
    } catch (_error) {
        throw new Error("OpenAI returned invalid JSON");
    }

    const score = Number(parsed.score);
    if (!Number.isFinite(score)) {
        throw new Error("OpenAI score is invalid");
    }

    return {
        score: Math.min(10, Math.max(1, score)),
        reason: String(parsed.reason || "")
    };
};

serve(async (req) => {
    const origin = req.headers.get("origin");

    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeadersFor(origin)
        });
    }

    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        return jsonResponse(origin, 403, { error: "Origin not allowed" });
    }

    if (!hasAllowedRequestContext(req, origin)) {
        return jsonResponse(origin, 403, { error: "Request context not allowed" });
    }

    if (req.method !== "POST") {
        return jsonResponse(origin, 405, { error: "Method not allowed" });
    }

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return jsonResponse(origin, 500, { error: "Missing server configuration" });
    }

    if (REQUIRE_AUTHENTICATED_USER) {
        const authHeader = req.headers.get("authorization");
        const isValidUser = await validateAuthenticatedUser(authHeader);
        if (!isValidUser) {
            return jsonResponse(origin, 401, { error: "Authentication required" });
        }
    }

    const rateLimit = checkRateLimit(`${origin}|${getClientIp(req)}`);
    if (!rateLimit.ok) {
        return jsonResponse(
            origin,
            429,
            { error: "Too many requests. Try again later." },
            { "Retry-After": String(rateLimit.retryAfterSec) }
        );
    }

    let payload: { name?: string; text?: string } = {};
    try {
        payload = await req.json();
    } catch (_error) {
        return jsonResponse(origin, 400, { error: "Invalid JSON" });
    }

    const name = String(payload.name || "").trim();
    const text = String(payload.text || "").trim();

    if (!name || !text) {
        return jsonResponse(origin, 400, { error: "Name and text are required" });
    }

    if (name.length > MAX_NAME_LEN || text.length > MAX_TEXT_LEN) {
        return jsonResponse(origin, 400, { error: "Input is too long" });
    }

    try {
        const moderation = await scoreReview(name, text);
        const approved = moderation.score >= MODERATION_THRESHOLD;

        if (!approved) {
            return jsonResponse(origin, 200, {
                approved,
                score: moderation.score,
                reason: moderation.reason
            });
        }

        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Prefer: "return=representation"
            },
            body: JSON.stringify({ name, text })
        });

        if (!insertResponse.ok) {
            console.error("Review insert failed", { status: insertResponse.status });
            return jsonResponse(origin, 500, {
                approved: false,
                score: moderation.score,
                reason: "Database insert failed"
            });
        }

        const inserted = await insertResponse.json();
        return jsonResponse(origin, 200, {
            approved: true,
            score: moderation.score,
            reason: moderation.reason,
            review: Array.isArray(inserted) ? inserted[0] : null
        });
    } catch (error) {
        console.error("Moderate review failed", error);
        return jsonResponse(origin, 500, { error: "Internal server error" });
    }
});
