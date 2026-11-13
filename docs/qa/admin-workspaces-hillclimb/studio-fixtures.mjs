// Web Studio flows read two Supabase-backed admin APIs that the local CMS
// database cannot answer. These fixtures follow the shapes the flows parse
// (`{ missionaries: [{ id, profile }] }`, `{ funds: [{ id, name }] }`).
const MISSIONARIES = [
  ["33333333-3333-3333-3333-333333333333", "Grace Okafor"],
  ["5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a01", "Daniel and Ruth Mbeki"],
  ["5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a02", "Priya Raman"],
  ["5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a03", "Mateo Alvarez"],
  ["5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a04", "Hannah Lindqvist"],
  ["5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a05", "Samuel Osei"],
  ["5b0c2a52-8f1e-4d0f-9a51-6f3e2b1c0a06", "Leah Park"],
].map(([id, name]) => ({
  id,
  profile: { full_name: name, display_name: name },
}));

const FUNDS = [
  ["44444444-4444-4444-4444-444444444444", "Clean Water Initiative"],
  ["7c1d3b63-9a2f-4e1a-8b62-7a4f3c2d1b01", "Kenya School Build"],
  ["7c1d3b63-9a2f-4e1a-8b62-7a4f3c2d1b02", "General Fund"],
  ["7c1d3b63-9a2f-4e1a-8b62-7a4f3c2d1b03", "Disaster Relief"],
  ["7c1d3b63-9a2f-4e1a-8b62-7a4f3c2d1b04", "Medical Missions"],
].map(([id, name]) => ({ id, name }));

export async function installStudioFixtures(page) {
  await page.route(/\/api\/admin\/missionaries(\?|$)/, (route) =>
    route.fulfill({ json: { missionaries: MISSIONARIES } }),
  );
  await page.route(/\/api\/admin\/funds(\?|$)/, (route) =>
    route.fulfill({ json: { funds: FUNDS } }),
  );
}

/**
 * Puts the shared local CMS back to its seeded state between Studio states.
 * Payload autosaves a draft as soon as the stock create view opens (so each
 * `studio-page-create` capture leaves an untitled page), and it stores a
 * list's sort, page size and Group by as the viewer's preference (so one
 * grouped capture would group every later pages list). Both versions run
 * against the same database, so each state starts from the same lists.
 */
export async function resetStudioState(context, base) {
  const prune = await context.request.delete(
    `${base}/api/pages?where[title][exists]=false&depth=0`,
  );
  if (!prune.ok()) {
    console.warn(`  untitled page cleanup failed: ${prune.status()}`);
  }
  // Payload answers a DELETE of a missing preference with a 500, so only
  // delete one that exists.
  const preferenceUrl = `${base}/api/payload-preferences/collection-pages`;
  const existing = await context.request.get(preferenceUrl);
  // A missing preference still answers 200, with no `value`.
  const stored = existing.ok() ? await existing.json().catch(() => null) : null;
  if (!stored?.value) return;
  const preference = await context.request.delete(preferenceUrl);
  if (!preference.ok()) {
    console.warn(
      `  pages list preference reset failed: ${preference.status()}`,
    );
  }
}
