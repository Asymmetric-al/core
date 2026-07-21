import { createReactionRouteHandlers } from "./reaction-route-handlers";

export const { POST, DELETE } = createReactionRouteHandlers({
  apply: {
    rpc: "atomic_fire_post",
    failureMessage: "Failed to register fire reaction",
    fallbackMessage: "Failed to fire post",
  },
  remove: {
    rpc: "atomic_unfire_post",
    failureMessage: "Failed to remove fire reaction",
    fallbackMessage: "Failed to remove fire reaction",
  },
});
