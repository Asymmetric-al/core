/** A signed-in person for the donor header and missionary sidebar fixtures. */
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
