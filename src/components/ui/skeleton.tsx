import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/55 before:absolute before:inset-y-0 before:-left-1/2 before:w-1/2 before:animate-[skeleton-shimmer_1.6s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/60 before:to-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
