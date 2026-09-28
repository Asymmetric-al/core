import { nextjsConfig } from "@asym/eslint-config/nextjs.mjs";

export default [
  ...nextjsConfig,
  {
    // withEve emits deployment bundles here, not authored app/runtime source.
    ignores: [".eve/vercel-services/**", ".vercel/output/**"],
  },
];
