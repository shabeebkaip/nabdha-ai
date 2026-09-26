// Nabda AI Intelligence Engine — provider selection point.
//
// Prefers the live Claude engine when a real ANTHROPIC_API_KEY is present;
// otherwise (or if a live call fails at runtime — see live.ts) falls back to
// the deterministic engine. No route handler ever needs to change.
import type { AiEngine } from "./types";
import { fallbackAiEngine } from "./fallback";
import { claudeAiEngine, hasLiveAnthropicKey } from "./live";

export function getAiEngine(): AiEngine {
  return hasLiveAnthropicKey() ? claudeAiEngine : fallbackAiEngine;
}

export * from "./types";
