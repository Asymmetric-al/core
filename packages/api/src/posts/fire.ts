import { createReactionRouteHandlers } from "./reaction-route-handlers";

export const { POST, DELETE } = createReactionRouteHandlers({
  apply: {
    kind: "fire",
    failureMessage: "Failed to register fire reaction",
    fallbackMessage: "Failed to fire post",
  },
  remove: {
    kind: "unfire",
    failureMessage: "Failed to remove fire reaction",
    fallbackMessage: "Failed to remove fire reaction",
  },
});
