import { defineHook } from "eve/hooks";

import {
  completeEveSpecialistModelStep,
  createEveSpecialistModelStepKey,
  eveSpecialistBudgetState,
  failEveSpecialistModelStep,
} from "./specialist-budget";

export default defineHook({
  events: {
    "step.completed": (event) => {
      const stepKey = createEveSpecialistModelStepKey(event.data);
      eveSpecialistBudgetState.update((state) =>
        completeEveSpecialistModelStep({
          state,
          stepKey,
          usage: event.data.usage,
        }),
      );
    },
    "step.failed": (event) => {
      const stepKey = createEveSpecialistModelStepKey(event.data);
      eveSpecialistBudgetState.update((state) =>
        failEveSpecialistModelStep({ state, stepKey }),
      );
    },
  },
});
