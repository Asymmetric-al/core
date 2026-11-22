import query from "@tanstack/eslint-plugin-query";
import parser from "@typescript-eslint/parser";

export default [
  {
    // Workspace build outputs and generated Next.js, Payload and Boneyard files.
    ignores: [
      ".next/**",
      ".eve/**",
      ".vercel/output/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "payload-types.ts",
      "bones/registry.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser,
      parserOptions: { projectService: true, tsconfigRootDir: process.cwd() },
    },
    plugins: { "@tanstack/query": query },
    rules: {
      "@tanstack/query/no-rest-destructuring": "error",
      "@tanstack/query/no-void-query-fn": "error",
    },
  },
];
