import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const normalizeText = (value: unknown) => String(value ?? "").trim();

const validateLength = (value: string, min: number, max: number, fieldName: string) => {
  if (value.length < min || value.length > max) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return value;
};

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hashFingerprint = async (raw: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return toHex(digest);
};

const getClientIp = (req: Request) => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
};

const enforceRateLimit = async (fingerprint: string, action: "review" | "fanfic") => {
  const limitWindowMs = action === "review" ? 30_000 : 45_000;
  const { data, error } = await supabase
    .from("submission_rate_limits")
    .select("last_attempt_at")
    .eq("fingerprint", fingerprint)
    .eq("action", action)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const now = Date.now();
  const lastAttemptAt = data?.last_attempt_at ? Date.parse(data.last_attempt_at) : 0;
  if (lastAttemptAt && now - lastAttemptAt < limitWindowMs) {
    throw new Error("Too many requests");
  }

  const timestamp = new Date(now).toISOString();
  const { error: upsertError } = await supabase
    .from("submission_rate_limits")
    .upsert(
      {
        fingerprint,
        action,
        last_attempt_at: timestamp,
        updated_at: timestamp,
      },
      { onConflict: "fingerprint,action" },
    );

  if (upsertError) {
    throw upsertError;
  }
};

const validateAntiBot = (payload: Record<string, unknown>) => {
  const website = normalizeText(payload.website);
  if (website) {
    throw new Error("Spam detected");
  }

  const formStartedAt = Number(payload.formStartedAt || 0);
  if (formStartedAt && Date.now() - formStartedAt < 1500) {
    throw new Error("Submission too fast");
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: "Missing Supabase function secrets" });
  }

  try {
    const body = await req.json();
    const action = body?.action;
    const payload = body?.payload;

    if (!payload || (action !== "review" && action !== "fanfic")) {
      return json(400, { error: "Invalid action" });
    }

    validateAntiBot(payload);

    const ip = getClientIp(req);
    const fingerprint = await hashFingerprint(`${action}:${ip}`);
    await enforceRateLimit(fingerprint, action);

    if (action === "review") {
      const name = validateLength(normalizeText(payload.name), 2, 60, "name");
      const text = validateLength(normalizeText(payload.text), 5, 500, "text");
      const { error } = await supabase
        .from("reviews")
        .insert({ name, text, status: "pending" });

      if (error) {
        throw error;
      }

      return json(200, { ok: true, action });
    }

    const name = validateLength(normalizeText(payload.name), 2, 60, "name");
    const title = validateLength(normalizeText(payload.title), 2, 100, "title");
    const genre = validateLength(normalizeText(payload.character), 1, 80, "character");
    const story = validateLength(normalizeText(payload.story), 50, 2000, "story");
    const { error } = await supabase
      .from("fanfics")
      .insert({ name, title, genre, story, status: "pending" });

    if (error) {
      throw error;
    }

    return json(200, { ok: true, action });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    const status = message === "Too many requests" ? 429 : 400;
    return json(status, { error: message });
  }
});
