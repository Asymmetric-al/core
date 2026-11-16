/** A signed-in donor for the donor portal header fixture. */
export function useAuth() {
  return {
    user: null,
    loading: false,
    profile: {
      first_name: "Avery",
      last_name: "Lopez",
      email: "avery@example.test",
      avatar_url: null,
    },
    signOut: async () => {},
  };
}
