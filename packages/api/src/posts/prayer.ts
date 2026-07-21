import { createReactionRouteHandlers } from "./reaction-route-handlers";

export const { POST, DELETE } = createReactionRouteHandlers({
  apply: {
    rpc: "atomic_pray_for_post",
    failureMessage: "Failed to register prayer",
    fallbackMessage: "Failed to pray for post",
  },
  remove: {
    rpc: "atomic_unpray_for_post",
    failureMessage: "Failed to remove prayer",
    fallbackMessage: "Failed to remove prayer",
  },
});
