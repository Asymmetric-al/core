import { createReactionRouteHandlers } from "./reaction-route-handlers";

export const { POST, DELETE } = createReactionRouteHandlers({
  apply: {
    rpc: "atomic_like_post",
    failureMessage: "Failed to register like",
    fallbackMessage: "Failed to like post",
  },
  remove: {
    rpc: "atomic_unlike_post",
    failureMessage: "Failed to remove like",
    fallbackMessage: "Failed to unlike post",
  },
});
