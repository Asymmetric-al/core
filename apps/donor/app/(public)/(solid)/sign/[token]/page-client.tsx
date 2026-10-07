"use client";

import { motion } from "@asym/lib/motion";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";
import { CheckCircle2, PenTool, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React, { useState, useSyncExternalStore } from "react";

function useHydrationSafeDate() {
  const subscribe = () => () => {};
  const getSnapshot = () => new Date().toLocaleDateString();
  const getServerSnapshot = () => "";
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function SignStudioPublicSigningPage() {
  const [step, setStep] = useState<"review" | "signing" | "completed">(
    "review",
  );
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const currentDate = useHydrationSafeDate();

  const handleSign = () => {
    setSignature("John Doe"); // Mock signature
    setIsSignatureModalOpen(false);
    setStep("completed");
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col font-sans pt-16">
      {/* Top Bar (Duplicate of legacy header but inside the page) */}
      <header className="bg-card border-b border-border h-16 flex items-center justify-between px-4 md:px-8 sticky top-16 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-invert text-invert-foreground rounded-lg flex items-center justify-center font-semibold text-sm">
            GH
          </div>
          <div className="hidden md:block w-px h-6 bg-muted mx-1" />
          <h1 className="font-semibold text-foreground truncate max-w-50 md:max-w-md">
            Employment Agreement - John Doe
          </h1>
        </div>

        {step !== "completed" && (
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block">
              1 field remaining
            </div>
            <Button onClick={() => setIsSignatureModalOpen(true)}>
              Sign Now <PenTool className="ml-2 size-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Main Area */}
      <div className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        {step === "completed" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center mt-20"
          >
            <div className="size-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="size-12 text-success" />
            </div>
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              You&apos;re all set!
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
              The document has been signed successfully. A copy has been emailed
              to you and the sender.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Download className="mr-2 size-4" /> Download Signed Copy
              </Button>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "bg-card",
                )}
              >
                Return Home
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" /> Securely signed with GiveHope
              Sign Studio
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl w-full bg-card shadow-sm  rounded-xl border border-border min-h-200 relative p-8 md:p-16 flex flex-col gap-8">
            {/* Fake Document Content */}
            <div className="h-8 w-1/3 bg-muted mb-8" />

            <div className="space-y-4 text-muted-foreground">
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-2/3 bg-current rounded" />
            </div>

            <div className="space-y-4 text-muted-foreground pt-8">
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-1/2 bg-current rounded" />
            </div>

            {/* Signature Field */}
            <div className="mt-12 border-t border-border pt-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8">
              <div className="relative">
                <Button
                  variant="outline"
                  size="lg"
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="w-full sm:w-64 min-h-16"
                >
                  {signature ? (
                    <span className="text-2xl text-foreground transform -rotate-2 italic font-serif">
                      {signature}
                    </span>
                  ) : (
                    <span className="text-sm font-medium flex items-center gap-2">
                      Click to Sign <PenTool className="size-3" />
                    </span>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 font-medium ">
                  Signature
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-foreground border-b border-border pb-1 mb-2 px-2">
                  {currentDate || "\u00A0"}
                </div>
                <p className="text-xs text-muted-foreground font-medium ">
                  Date
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <Dialog
        open={isSignatureModalOpen}
        onOpenChange={setIsSignatureModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your signature</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="border rounded-xl bg-background p-8 text-center cursor-text hover:bg-card transition-colors">
              <span className="text-4xl text-foreground italic font-serif">
                John Doe
              </span>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-4 max-w-xs mx-auto">
              By clicking <strong>Adopt & Sign</strong>, you agree to the
              electronic signature disclosure and to do business electronically.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsSignatureModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSign}>Adopt & Sign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
