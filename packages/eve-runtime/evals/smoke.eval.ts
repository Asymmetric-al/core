import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description:
    "Proves the isolated, no-authority Eve runtime can boot and answer through a zero-cost fixture model.",
  tags: ["foundation", "offline"],
  async test(t) {
    await t.send("foundation smoke");

    t.succeeded();
    t.usedNoTools();
    t.check(t.reply, includes("Eve runtime verification passed"));
  },
});
