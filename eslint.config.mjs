import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * Flat ESLint config (ESLint v9). Next.js 16 removed the built-in `next lint`
 * command, so linting now runs through the ESLint CLI (`eslint .`).
 *
 * The legacy `.eslintrc.json` ruleset is preserved verbatim via `FlatCompat`:
 * `next/core-web-vitals` + `@typescript-eslint/recommended-type-checked`
 * (type-aware) plus the project's custom rules. Type-aware rules are scoped to
 * TypeScript sources so config/JS files are never parsed against the TS project.
 */
const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "*.config.mjs",
      "*.config.js",
      "*.config.ts",
    ],
  },
  ...compat.config({
    extends: [
      "next/core-web-vitals",
      "plugin:@typescript-eslint/recommended-type-checked",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: true,
      tsconfigRootDir: __dirname,
    },
    plugins: ["@typescript-eslint"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  }),
];

export default eslintConfig;
