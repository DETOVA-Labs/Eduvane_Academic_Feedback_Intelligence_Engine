/**
 * Overview: vite.config.ts
 * Purpose: Implements part of the Eduvane application behavior for this module.
 * Notes: Keep exports focused and update comments when behavior changes.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()]
});
