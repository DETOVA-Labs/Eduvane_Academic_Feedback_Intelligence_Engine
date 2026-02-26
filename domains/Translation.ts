
import {
  IntelligenceInsight,
  IntelligenceAudience,
  TranslatedIntelligence
} from "../types.ts";

/**
 * DECOMMISSIONED
 * Audience adaptation must be produced by the Python AI Engine.
 */
function decommissioned(_insight: IntelligenceInsight, audience: IntelligenceAudience): TranslatedIntelligence {
  throw new Error(
    `Translation adapter (${audience}) is decommissioned. Use Python AI Engine output from the gateway.`
  );
}

export const TranslationAdapters = {
  EDUCATOR: (insight: IntelligenceInsight) => decommissioned(insight, "EDUCATOR"),
  FAMILY: (insight: IntelligenceInsight) => decommissioned(insight, "FAMILY"),
  LEARNER: (insight: IntelligenceInsight) => decommissioned(insight, "LEARNER")
};
