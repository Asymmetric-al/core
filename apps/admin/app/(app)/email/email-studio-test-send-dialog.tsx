"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Field, FieldLabel } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Send } from "lucide-react";

export interface EmailStudioTestSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toEmail: string;
  onToEmailChange: (value: string) => void;
  isSending: boolean;
  onSend: () => void;
}

export function EmailStudioTestSendDialog({
  open,
  onOpenChange,
  toEmail,
  onToEmailChange,
  isSending,
  onSend,
}: EmailStudioTestSendDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <DialogHeader>
            <DialogTitle>Send test email</DialogTitle>
            <DialogDescription>
              Sends the current editor export to a real inbox using the tenant
              Resend connection.
            </DialogDescription>
          </DialogHeader>
          <Field className="py-2">
            <FieldLabel htmlFor="test-to-email">Recipient</FieldLabel>
            <Input
              id="test-to-email"
              type="email"
              required
              placeholder="you@example.com"
              value={toEmail}
              onChange={(event) => onToEmailChange(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending || toEmail.trim().length === 0}
            >
              {isSending ? <Spinner /> : <Send />}
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
