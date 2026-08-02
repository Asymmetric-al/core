import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";

import { supportHubDemoModel } from "../support-hub.data";

export default function SupportMacrosPage() {
  return (
    <PageShell
      title="Support Macros"
      description="Reusable replies for donor, mobilization, and existing missionary support requests."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {supportHubDemoModel.macros.map((macro) => (
          <Card className="rounded-3xl" key={macro.id}>
            <CardHeader>
              <CardTitle>{macro.title}</CardTitle>
              <CardDescription>{macro.queueId}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {macro.preview}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
