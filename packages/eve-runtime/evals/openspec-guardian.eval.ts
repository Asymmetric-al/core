import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Proves the read-only OpenSpec Guardian flags a Twenty CRM reintroduction attempt against ADR-0001 without writing or claiming runtime changed.",
  tags: ["openspec-guardian", "specialists"],
  async test(t) {
    await t.send("EVE_OPENSPEC_GUARDIAN_TWENTY_REINTRO");

    t.succeeded();
    t.calledSubagent("openspec-guarding", { count: 1 });
    t.noFailedActions();
    t.check(t.reply, includes("ADR-0001"));
    t.check(t.reply, includes("Twenty CRM is retired"));
    t.check(t.reply, includes("escalate"));
    t.check(t.reply, includes("runtime unchanged"));
  },
});
