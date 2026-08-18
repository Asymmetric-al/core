import { createReactionRouteHandlers } from "./reaction-route-handlers";

export const { POST, DELETE } = createReactionRouteHandlers({
  apply: {
    kind: "like",
    failureMessage: "Failed to register like",
    fallbackMessage: "Failed to like post",
  },
  remove: {
    kind: "unlike",
    failureMessage: "Failed to remove like",
    fallbackMessage: "Failed to unlike post",
  },
});
