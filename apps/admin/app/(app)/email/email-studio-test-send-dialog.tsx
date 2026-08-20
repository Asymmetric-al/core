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
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
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
        <DialogHeader>
          <DialogTitle>Send test email</DialogTitle>
          <DialogDescription>
            Sends the current editor export to a real inbox using the tenant
            Resend connection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor="test-to-email">Recipient</Label>
          <Input
            id="test-to-email"
            type="email"
            placeholder="you@example.com"
            value={toEmail}
            onChange={(event) => onToEmailChange(event.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSend}
            disabled={isSending || toEmail.trim().length === 0}
          >
            {isSending ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
