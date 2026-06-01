import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-tight transition-[background,color,box-shadow,transform,border-color] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 outline-none focus-visible:border-ring focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-primary/86 text-primary-foreground shadow-xs hover:bg-primary",
        destructive:
          "bg-destructive/90 text-white shadow-xs hover:bg-destructive focus-visible:shadow-[0_0_0_4px_rgb(201_138_138_/_20%)]",
        outline:
          "border border-border/70 bg-card/72 shadow-xs backdrop-blur hover:border-border hover:bg-secondary/88 hover:text-secondary-foreground",
        secondary: "bg-secondary/90 text-secondary-foreground shadow-xs hover:bg-secondary",
        ghost: "hover:bg-secondary/78 hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-7",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
