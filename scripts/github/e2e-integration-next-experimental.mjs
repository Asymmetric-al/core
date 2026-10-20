/**
 * Next.js `experimental` overrides for CI Integration e2e production builds only.
 * Enabled when `ASYM_E2E_INTEGRATION_BUILD=1` (set by e2e-production-server.sh).
 *
 * @returns {import('next').NextConfig['experimental']}
 */
export function e2eIntegrationBuildExperimental() {
  if (process.env.ASYM_E2E_INTEGRATION_BUILD !== "1") {
    return {};
  }

  return {
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 512,
    turbopackPluginRuntimeStrategy: /** @type {const} */ ("workerThreads"),
  };
}
