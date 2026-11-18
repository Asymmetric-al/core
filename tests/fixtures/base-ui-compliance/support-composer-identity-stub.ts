// Mission Control's signed-in user for the Support composer fixture. Support
// Hub's `useCurrentSupportAgentId` matches them to an agent by email, as it
// does in the app; the dev server's placeholder Supabase has no such user.
export const SUPPORT_COMPOSER_USER = {
  id: "staff-avery",
  email: "avery@example.test",
  name: "Avery Admin",
};

export function useMC() {
  return { user: SUPPORT_COMPOSER_USER };
}
