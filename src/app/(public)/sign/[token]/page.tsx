"use client";

import React, { useState, use, useSyncExternalStore } from "react";
import { CheckCircle2, PenTool, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function useHydrationSafeDate() {
  const subscribe = () => () => {};
  const getSnapshot = () => new Date().toLocaleDateString();
  const getServerSnapshot = () => "";
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function SignStudioPublicSigningPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pt-16">
      {/* Top Bar (Duplicate of legacy header but inside the page) */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 sticky top-16 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
            GH
          </div>
          <div className="hidden md:block w-px h-6 bg-slate-200 mx-1" />
          <h1 className="font-semibold text-slate-700 truncate max-w-[200px] md:max-w-md">
            Employment Agreement - John Doe
          </h1>
        </div>

        {step !== "completed" && (
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 hidden sm:block">
              1 field remaining
            </div>
            <Button
              onClick={() => setIsSignatureModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md animate-pulse font-semibold"
            >
              Sign Now <PenTool className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Main Area */}
      <main className="flex-1 flex justify-center p-4 md:p-8 overflow-y-auto">
        {step === "completed" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center mt-20"
          >
            <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              You&apos;re all set!
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              The document has been signed successfully. A copy has been emailed
              to you and the sender.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
              >
                <Download className="mr-2 h-4 w-4" /> Download Signed Copy
              </Button>
              <Button variant="outline" size="lg" asChild className="bg-white">
                <Link href="/">Return Home</Link>
              </Button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" /> Securely signed with GiveHope
              Sign Studio
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl w-full bg-white shadow-2xl shadow-slate-200/50 rounded-xl border border-slate-200 min-h-[800px] relative p-8 md:p-16 flex flex-col gap-8">
            {/* Fake Document Content */}
            <div className="h-8 w-1/3 bg-slate-200 mb-8" />

            <div className="space-y-4 text-slate-300">
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-2/3 bg-current rounded" />
            </div>

            <div className="space-y-4 text-slate-300 pt-8">
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-full bg-current rounded" />
              <div className="h-3 w-1/2 bg-current rounded" />
            </div>

            {/* Signature Field */}
            <div className="mt-12 border-t border-slate-200 pt-12 flex justify-between items-end">
              <div className="relative">
                <div
                  onClick={() => setIsSignatureModalOpen(true)}
                  className={cn(
                    "w-64 h-16 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all relative overflow-hidden group",
                    signature
                      ? "border-emerald-500 bg-emerald-50/30"
                      : "border-blue-500 border-dashed bg-blue-50/50 hover:bg-blue-50",
                  )}
                >
                  {signature ? (
                    <span className="text-2xl text-slate-900 transform -rotate-2 italic font-serif">
                      {signature}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                      Click to Sign <PenTool className="h-3 w-3" />
                    </span>
                  )}

                  {/* Tooltip */}
                  {!signature && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded shadow-lg whitespace-nowrap animate-bounce">
                      Sign Here
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wider">
                  Signature
                </p>
              </div>

              <div className="text-right">
                <div className="text-sm font-medium text-slate-900 border-b border-slate-300 pb-1 mb-2 px-2">
                  {currentDate || "\u00A0"}
                </div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Date
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

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
            <div className="border rounded-xl bg-slate-50 p-8 text-center cursor-text hover:bg-white transition-colors">
              <span className="text-4xl text-slate-900 italic font-serif">
                John Doe
              </span>
            </div>
            <p className="text-xs text-center text-slate-400 mt-4 max-w-xs mx-auto">
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
            <Button
              onClick={handleSign}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            >
              Adopt & Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
