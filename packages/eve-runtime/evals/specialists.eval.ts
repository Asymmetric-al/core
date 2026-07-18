import { EVE_SPECIALIST_IDS } from "@asym/api/eve/subagent-catalog";
import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default EVE_SPECIALIST_IDS.map((specialistId) =>
  defineEval({
    description: `Proves the declared ${specialistId} specialist is discoverable, callable, isolated, and release-gated.`,
    tags: ["specialists", `eve-${specialistId}`],
    async test(t) {
      await t.send(`EVE_SPECIALIST_EVAL:${specialistId}`);

      t.succeeded();
      t.calledSubagent(specialistId, { count: 1 });
      t.noFailedActions();
      t.check(
        t.reply,
        includes(`Eve specialist verification passed: ${specialistId}`),
      );
    },
  }),
);
