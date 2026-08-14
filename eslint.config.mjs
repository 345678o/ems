// eslint.config.mjs
// ESLint 9 flat config for Next.js 15 + TypeScript + Prettier
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  // ── 1. Base JS recommended rules ──────────────────────────────────────────
  js.configs.recommended,

  // ── 2. TypeScript recommended rules ───────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── 3. Global settings for browser + Node environments ────────────────────
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
      },
    },
  },

  // ── 4. React + React Hooks ─────────────────────────────────────────────────
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in Next.js (React 17+)
      "react/prop-types": "off", // TypeScript handles this
      "react/display-name": "warn",
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // ── 5. Next.js specific rules ─────────────────────────────────────────────
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // ── 6. Project-specific rule overrides ────────────────────────────────────
  {
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "warn",

      // React hooks
      "react-hooks/exhaustive-deps": "warn",

      // Prettier formatting violations as warnings
      "prettier/prettier": "warn",
    },
  },

  // ── 7. Prettier (must come after all rule configs to disable conflicts) ────
  prettierConfig,

  {
    plugins: { prettier: prettierPlugin },
    rules: { "prettier/prettier": "warn" },
  },

  // ── 8. Files and ignores ──────────────────────────────────────────────────
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs}"],
  },

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "public/**",
      "out/**",
      "dist/**",
      "coverage/**",
      "*.config.js",
      "postcss.config.mjs",
      "tailwind.config.js",
    ],
  }
);
