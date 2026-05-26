import { z } from "zod";

const issueTypeSchema = z.enum([
  "receipt_failed",
  "statement_failed",
  "donor_notification_failed",
  "crm_post_failed",
  "provider_failed",
  "failed_refund",
  "pending_refund",
  "correction_review",
  "batch_completed_with_issues",
  "missing_donor",
  "missing_designation",
  "staged_gift_review",
  "recurring_gift_issue",
]);

const triggerSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("contribution_issue_created") }),
  z.object({ kind: z.literal("contribution_action_completed") }),
]);

const conditionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("always") }),
  z.object({ kind: z.literal("issue_type_is"), issueType: issueTypeSchema }),
]);

const actionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("create_task"), issueType: issueTypeSchema }),
  z.object({
    kind: z.literal("send_donor_notification"),
    actionType: z.enum([
      "refund",
      "amount_correction",
      "designation_correction",
      "fund_correction",
      "payment_state_correction",
      "donor_relink",
      "receipt_correction",
      "statement_correction",
    ]),
  }),
]);

export const automationRuleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  mode: z.enum(["simple", "advanced"]),
  trigger: triggerSchema,
  conditions: z.array(conditionSchema),
  actions: z.array(actionSchema).min(1),
  runMode: z.enum(["automatic", "review_first"]),
  enabled: z.boolean(),
});

export function compileSimpleAutomation(input: {
  name: string;
  when: "receipt_failed" | "donor_notification_failed" | "crm_post_failed";
  then: "create_task";
}) {
  return automationRuleSchema.parse({
    name: input.name,
    mode: "simple",
    trigger: { kind: "contribution_issue_created" },
    conditions: [{ kind: "issue_type_is", issueType: input.when }],
    actions: [{ kind: input.then, issueType: input.when }],
    runMode: "automatic",
    enabled: false,
  });
}
