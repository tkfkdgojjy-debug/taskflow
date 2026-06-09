import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-full bg-white/54 px-4 py-2 text-sm shadow-xs outline-none ring-1 ring-white/58 backdrop-blur-2xl transition-[background,box-shadow,border-color] placeholder:text-muted-foreground/72 focus-visible:bg-white/76 focus-visible:shadow-[var(--shadow-focus)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/8 dark:ring-white/10 dark:focus-visible:bg-white/12",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
