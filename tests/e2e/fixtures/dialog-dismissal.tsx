import * as React from "react";
import { createRoot } from "react-dom/client";

import { Button } from "../../../packages/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../packages/ui/components/shadcn/dialog";

function DialogDismissalFixture() {
  return (
    <main>
      <Dialog>
        <DialogTrigger render={<Button>Open dialog</Button>} />
        <DialogContent scrollable>
          <DialogHeader>
            <DialogTitle>Dialog dismissal</DialogTitle>
            <DialogDescription>
              Closing interrupted motion must still release focus and the
              portal.
            </DialogDescription>
          </DialogHeader>
          {Array.from({ length: 30 }, (_, index) => (
            <p key={index}>Scrollable content {index + 1}</p>
          ))}
        </DialogContent>
      </Dialog>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<DialogDismissalFixture />);
