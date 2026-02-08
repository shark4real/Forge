/**
 * ════════════════════════════════════════════════════════════════════════
 * FORGE — Tambo Client Config
 *
 * Tambo is the preferred AI engine for hackathon requirements.
 * Falls back gracefully when no API key is configured.
 * ════════════════════════════════════════════════════════════════════════
 */

export const TAMBO_API_KEY = (import.meta.env.VITE_TAMBO_API_KEY as string | undefined)?.trim();

export const hasTambo =
  !!TAMBO_API_KEY &&
  TAMBO_API_KEY !== "your_tambo_api_key_here";

if (import.meta.env.DEV) {
  console.log("[Forge] Tambo configured:", hasTambo);
}
