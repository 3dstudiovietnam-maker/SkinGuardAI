import type { Plugin } from "vite";

/**
 * Removes every price / external-checkout string from the translations table
 * when building the native (Capacitor) app — Apple 2.3.1. See the .mjs file.
 */
export function stripPaywallStrings(options: { projectRoot: string }): Plugin;
