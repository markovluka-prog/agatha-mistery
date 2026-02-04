import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
const MODERATION_THRESHOLD = Number(Deno.env.get("MODERATION_THRESHOLD") || "7");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const jsonResponse = (status: number, payload: Record<string, unknown>) => {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
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
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return jsonResponse(405, { error: "Method not allowed" });
    }

    if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return jsonResponse(500, { error: "Missing server configuration" });
    }

    let payload: { name?: string; text?: string } = {};
    try {
        payload = await req.json();
    } catch (_error) {
        return jsonResponse(400, { error: "Invalid JSON" });
    }

    const name = String(payload.name || "").trim();
    const text = String(payload.text || "").trim();

    if (!name || !text) {
        return jsonResponse(400, { error: "Name and text are required" });
    }

    try {
        const moderation = await scoreReview(name, text);
        const approved = moderation.score >= MODERATION_THRESHOLD;

        if (!approved) {
            return jsonResponse(200, {
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
            const errorText = await insertResponse.text();
            return jsonResponse(500, {
                approved: false,
                score: moderation.score,
                reason: "Database insert failed",
                detail: errorText
            });
        }

        const inserted = await insertResponse.json();
        return jsonResponse(200, {
            approved: true,
            score: moderation.score,
            reason: moderation.reason,
            review: Array.isArray(inserted) ? inserted[0] : null
        });
    } catch (error) {
        return jsonResponse(500, { error: String(error) });
    }
});
