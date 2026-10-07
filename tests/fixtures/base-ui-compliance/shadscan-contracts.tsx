import React, { useState } from "react";
import { toast } from "../../../packages/ui/node_modules/sonner/dist/index.mjs";
import { Archive } from "../../../packages/ui/node_modules/lucide-react";

import {
  QueryClient,
  QueryClientProvider,
} from "../../../packages/ui/node_modules/@tanstack/react-query/build/modern/index.js";
import { WhereWeWorkMap } from "../../../apps/donor/app/(public)/(solid)/where-we-work/map-wrapper";
import { FormField } from "../../../apps/missionary/app/profile/profile-primitives";
import { DemoOnlyLoginCard } from "../../../packages/ui/components/auth/DemoOnlyLoginCard";
import { FilterBar } from "../../../packages/ui/components/primitives/filter-bar";
import { ChartCard } from "../../../packages/ui/components/primitives/chart-wrappers";
import { ImageCropper } from "../../../packages/ui/components/primitives/image-cropper";
import { NavbarClient } from "../../../packages/ui/components/public/navbar-client";
import { CommentsDialog } from "../../../packages/ui/components/ministry-update/comments-dialog";
import type { EngagementTransport } from "../../../packages/ui/components/ministry-update/engagement-transport";
import { Button } from "../../../packages/ui/components/shadcn/button";
import { Input } from "../../../packages/ui/components/shadcn/input";
import { Toaster } from "../../../packages/ui/components/shadcn/sonner";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../packages/ui/components/shadcn/dialog";
import { DataTableFloatingBar } from "../../../packages/ui/components/shadcn/data-table/data-table-floating-bar";
import {
  dataTableFeatures,
  useTable,
} from "../../../packages/ui/components/shadcn/data-table/tanstack";

const people = [{ id: "one", name: "Conrad" }];
const columns = [{ accessorKey: "name", meta: { label: "Name" } }];
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='gray'/%3E%3C/svg%3E";
const transport: EngagementTransport = {
  listComments: async () => [],
  setReaction: async () => ({ applied: true }),
  addComment: () =>
    new Promise((resolve) =>
      document.addEventListener(
        "fixture-comment-accept",
        () => resolve({ persisted: false }),
        { once: true },
      ),
    ),
};

export function ShadscanContracts() {
  const [mode, setMode] = useState<"feedback" | "navigation" | "map">(
    "feedback",
  );
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [chartError, setChartError] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [archives, setArchives] = useState(0);
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
  );
  const table = useTable({
    features: dataTableFeatures,
    data: people,
    columns,
    initialState: { rowSelection: { "0": true } },
  });

  return (
    <section
      aria-label="Shadscan accessibility contracts"
      className="my-8 grid gap-4 rounded-xl border p-4"
    >
      <h2>Shadscan accessibility contracts</h2>
      <Toaster />
      <Dialog>
        <DialogTrigger render={<Button />}>Open modal toast</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fixture toast layer</DialogTitle>
            <DialogDescription>
              Save without dismissing the active modal.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => toast.success("Saved in modal")}>
            Save in modal
          </Button>
        </DialogContent>
      </Dialog>
      <div className="flex gap-2">
        <Button onClick={() => setMode("navigation")}>
          Show public navigation
        </Button>
        <Button onClick={() => setMode("map")}>Show map</Button>
      </div>
      {mode === "navigation" ? (
        <NavbarClient
          variant="solid"
          siteName="GiveHope"
          shortName="GH"
          navLinks={[{ label: "Workers", href: "#main-content" }]}
          ctaLabel="Give"
          ctaHref="#main-content"
        />
      ) : mode === "map" ? (
        <WhereWeWorkMap />
      ) : (
        <>
          <FilterBar search={{ value: search, onChange: setSearch }} />
          <FormField
            label="Fixture first name"
            helperText="Shown to supporters"
            error={name === "invalid" ? "Choose a valid first name" : undefined}
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </FormField>
          <DemoOnlyLoginCard
            title="Fixture demo access"
            onDemoLogin={() => setLoginError("Demo access unavailable")}
            error={loginError}
          />
          <Button onClick={() => setChartError(true)}>
            Fail fixture chart
          </Button>
          <ChartCard
            title="Fixture giving"
            isError={chartError}
            errorMessage="Giving data unavailable"
          >
            <span>Giving is current</span>
          </ChartCard>
          <Button onClick={() => setCommentsOpen(true)}>
            Open fixture comments
          </Button>
          <QueryClientProvider client={client}>
            <CommentsDialog
              updateId="fixture"
              transport={transport}
              open={commentsOpen}
              onOpenChange={setCommentsOpen}
            />
          </QueryClientProvider>
          <Button onClick={() => setCropOpen(true)}>
            Open labeled cropper
          </Button>
          <ImageCropper
            open={cropOpen}
            image={image}
            onCancel={() => setCropOpen(false)}
            onCropComplete={() => setCropOpen(false)}
          />
          <DataTableFloatingBar
            table={table}
            actions={[
              {
                label: "Archive selected",
                icon: Archive,
                onClick: () => setArchives((count) => count + 1),
              },
            ]}
          />
          <output aria-label="Archived rows">{archives}</output>
        </>
      )}
    </section>
  );
}
