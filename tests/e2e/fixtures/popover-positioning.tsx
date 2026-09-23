import { Button } from "@asym/ui/components/shadcn/button";
import { Calendar } from "@asym/ui/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function Fixture() {
  const [shift, setShift] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 0, 1));
  return (
    <main>
      <Button onClick={() => setShift(true)}>Use viewport shift</Button>
      <output data-testid="selected-day">{date?.getDate()}</output>
      <div style={{ position: "fixed", top: 270, left: 32 }}>
        <Popover key={String(shift)}>
          <PopoverTrigger render={<Button>Open calendar</Button>} />
          <PopoverContent
            align="start"
            className="w-auto"
            collisionAvoidance={
              shift
                ? { side: "shift", align: "shift", fallbackAxisSide: "none" }
                : undefined
            }
          >
            <PopoverTitle className="sr-only">Choose date</PopoverTitle>
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={date}
              selected={date}
              onSelect={setDate}
            />
          </PopoverContent>
        </Popover>
      </div>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
