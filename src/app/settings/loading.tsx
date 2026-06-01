import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-72 w-full" />
      <Skeleton className="h-52 w-full" />
    </div>
  );
}
