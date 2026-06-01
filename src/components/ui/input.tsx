import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-lg bg-card/70 px-4 py-2 text-sm shadow-xs outline-none transition-[background,box-shadow,border-color] placeholder:text-muted-foreground/72 focus-visible:shadow-[var(--shadow-focus)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "border border-input/60 focus-visible:border-ring",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
