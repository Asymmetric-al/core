import { createEveDynamicWorkflowRuntimeState } from "@asym/api/eve/dynamic-workflow";
import { defineState } from "eve/context";

import type { EveDynamicWorkflowRuntimeState } from "@asym/api/eve/dynamic-workflow";

export const eveDynamicWorkflowState =
  defineState<EveDynamicWorkflowRuntimeState>(
    "asym.eve.dynamic-workflow.v1",
    createEveDynamicWorkflowRuntimeState,
  );
