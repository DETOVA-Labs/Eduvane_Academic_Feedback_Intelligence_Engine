
import { IntelligenceInsight } from "../types.ts";

/**
 * DECOMMISSIONED
 * Intelligence synthesis now runs only in the Python AI Engine.
 * This legacy module is retained to fail loudly if accidentally imported.
 */
export const IntelligenceCore = {
  generateInsight: (_data: unknown): IntelligenceInsight => {
    throw new Error(
      "IntelligenceCore is decommissioned. Use the Python AI Engine via the Node gateway."
    );
  }
};
