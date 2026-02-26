
import { EduvaneMode, ValidationStatus } from "../types.ts";

/**
 * DECOMMISSIONED
 * Validation context decisions now belong to Python AI Engine policy output.
 */
export const ContextService = {
  getInitialStatus: (_mode: EduvaneMode, _confidence: number): ValidationStatus => {
    throw new Error(
      "ContextService is decommissioned. Use validation state from Python AI Engine responses."
    );
  },

  shouldShowReleaseGate: (_mode: EduvaneMode): boolean => {
    throw new Error(
      "ContextService is decommissioned. Release-gate policy must come from backend and AI engine."
    );
  }
};
