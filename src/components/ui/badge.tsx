import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 gap-1 [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/78 text-primary-foreground shadow-xs",
        secondary: "border-transparent bg-white/50 text-secondary-foreground shadow-xs backdrop-blur-xl dark:bg-white/10",
        destructive: "border-transparent bg-destructive text-white",
        outline: "border-white/55 bg-white/34 text-foreground shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-white/8",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
