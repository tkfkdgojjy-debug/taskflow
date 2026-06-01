"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { softSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success";

interface ToastInput {
  description?: string;
  title: string;
  variant?: ToastVariant;
}

interface ToastItem extends ToastInput {
  id: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = crypto.randomUUID();
      const nextToast: ToastItem = {
        ...input,
        id,
        variant: input.variant ?? "default",
      };

      setItems((current) => [...current.slice(-2), nextToast]);
      window.setTimeout(() => removeToast(id), 3600);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const Icon = item.variant === "success" ? CheckCircle2 : Info;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={softSpring}
                className={cn(
                  "flex items-start gap-3 rounded-2xl bg-card/95 p-4 shadow-lg ring-1 ring-border/45 backdrop-blur-xl",
                  item.variant === "success" && "ring-success/55 dark:ring-success/35",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 size-4 shrink-0 text-muted-foreground",
                    item.variant === "success" && "text-[#6f896b] dark:text-[#c9d7c5]",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium tracking-tight">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-mr-2 -mt-2 size-7"
                  aria-label="토스트 닫기"
                  onClick={() => removeToast(item.id)}
                >
                  <X className="size-3.5" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
