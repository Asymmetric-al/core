export let savedLabel: unknown;
export function useSaveSupportLabel() {
  return {
    isPending: false,
    mutateAsync: async (value: unknown) => {
      savedLabel = value;
      return value;
    },
  };
}
