import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Vitest config for unit tests. Resolves the `@/` path alias (matching
 * tsconfig) so tests can import app modules. Defaults to the Node environment
 * (pure logic tests); a component test needing the DOM can opt in per file with
 * `// @vitest-environment jsdom` once jsdom is added to devDependencies.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
