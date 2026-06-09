import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-[background,color,box-shadow,transform,border-color] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 outline-none focus-visible:border-ring focus-visible:shadow-[var(--shadow-focus)] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,#7f8cff,#4f63f2)] text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md",
        destructive:
          "bg-destructive/88 text-white shadow-xs hover:-translate-y-0.5 hover:bg-destructive focus-visible:shadow-[0_0_0_4px_rgb(223_107_121_/_22%)]",
        outline:
          "border border-white/58 bg-white/44 shadow-xs backdrop-blur-2xl hover:-translate-y-0.5 hover:border-white/80 hover:bg-white/68 hover:text-secondary-foreground dark:border-white/10 dark:bg-white/8 dark:hover:bg-white/12",
        secondary:
          "bg-white/54 text-secondary-foreground shadow-xs ring-1 ring-white/55 backdrop-blur-2xl hover:-translate-y-0.5 hover:bg-white/72 dark:bg-white/10 dark:ring-white/10 dark:hover:bg-white/14",
        ghost: "hover:-translate-y-0.5 hover:bg-white/42 hover:text-secondary-foreground dark:hover:bg-white/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-7",
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
