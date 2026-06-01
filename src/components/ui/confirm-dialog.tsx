"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appTransition, scaleIn } from "@/lib/motion";

interface ConfirmDialogProps {
  confirmLabel?: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmDialog({
  confirmLabel = "확인",
  description,
  isOpen,
  onClose,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[65] grid place-items-center bg-background/70 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={appTransition}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-md rounded-2xl bg-card/95 p-6 shadow-2xl ring-1 ring-border/45 backdrop-blur-xl"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={appTransition}
          >
            <div className="flex gap-4">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-muted/65 text-muted-foreground">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h2 id="confirm-dialog-title" className="text-base font-semibold tracking-tight">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="button" variant="destructive" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
