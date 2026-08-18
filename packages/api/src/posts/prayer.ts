import { createReactionRouteHandlers } from "./reaction-route-handlers";

export const { POST, DELETE } = createReactionRouteHandlers({
  apply: {
    kind: "pray",
    failureMessage: "Failed to register prayer",
    fallbackMessage: "Failed to pray for post",
  },
  remove: {
    kind: "unpray",
    failureMessage: "Failed to remove prayer",
    fallbackMessage: "Failed to remove prayer",
  },
});
