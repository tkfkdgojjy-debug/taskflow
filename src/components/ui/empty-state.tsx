import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  actionLabel?: string;
  className?: string;
  description: string;
  icon: LucideIcon;
  onAction?: () => void;
  title: string;
}

export function EmptyState({
  actionLabel,
  className,
  description,
  icon: Icon,
  onAction,
  title,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid min-h-64 place-items-center rounded-2xl bg-card/70 p-10 text-center shadow-xs ring-1 ring-border/30 backdrop-blur-sm",
        className,
      )}
    >
      <div className="max-w-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-muted/65 text-muted-foreground">
          <Icon className="size-5" />
        </div>
        <h3 className="mt-5 text-base font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {actionLabel ? (
          <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
