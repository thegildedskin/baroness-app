import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

// Unit tests for the pure domain logic (taxonomy, matcher, ledger). Node env; the
// `@/` alias mirrors tsconfig so tests import modules the same way the app does.
export default defineConfig({
  resolve: { alias: { "@": root } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
