
import { IntelligenceInsight, PresentationContent } from "../types.ts";

/**
 * DECOMMISSIONED
 * Audience-facing synthesis must come from Python AI Engine output.
 */
function decommissioned(_insight: IntelligenceInsight): PresentationContent {
  throw new Error(
    "TranslationService is decommissioned. Use Python AI Engine feedback synthesis via gateway responses."
  );
}

export const TranslationService = {
  forFamily: (insight: IntelligenceInsight) => decommissioned(insight),
  forLearner: (insight: IntelligenceInsight) => decommissioned(insight),
  forEducator: (insight: IntelligenceInsight) => decommissioned(insight)
};
