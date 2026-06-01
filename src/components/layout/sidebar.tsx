import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  CheckSquare2,
  FolderKanban,
  Gauge,
  Goal,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "대시보드", href: "/", icon: Gauge },
  { label: "작업", href: "/tasks", icon: CheckSquare2 },
  { label: "프로젝트", href: "/projects", icon: FolderKanban },
  { label: "캘린더", href: "/calendar", icon: CalendarDays },
  { label: "목표", href: "/goals", icon: Goal },
  { label: "리포트", href: "/reports", icon: BarChart3 },
  { label: "설정", href: "/settings", icon: Settings },
];

interface SidebarProps {
  activePath?: string;
  onNavigate?: () => void;
}

export function Sidebar({ activePath = "/", onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-[280px] flex-col rounded-2xl bg-sidebar/88 text-sidebar-foreground shadow-sm backdrop-blur-xl">
      <div className="flex h-[72px] items-center gap-3 px-4">
        <div className="grid size-10 place-items-center rounded-xl bg-primary/82 text-sm font-bold text-primary-foreground shadow-xs">
          TM
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">TaskFlow</p>
          <p className="truncate text-xs text-sidebar-foreground/52">워크스페이스</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-3" aria-label="주요 내비게이션">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? activePath === "/" : activePath.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-full px-3 text-sm font-medium text-sidebar-foreground/62 transition-[background,color,box-shadow,transform] hover:bg-sidebar-accent/82 hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-card/82 text-sidebar-accent-foreground shadow-xs",
              )}
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full text-sidebar-foreground/54 transition-colors group-hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary/24 text-sidebar-accent-foreground shadow-xs",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="flex-1">{item.label}</span>
              {item.label === "작업" ? (
                <Badge className="h-5 border-0 bg-terracotta/18 px-1.5 text-[11px] text-sidebar-foreground/70">
                  12
                </Badge>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <div className="rounded-2xl bg-sidebar-accent/58 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-sidebar-foreground/58">플랜 사용량</p>
            <span className="text-xs font-semibold">68%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/55">
            <div className="h-full w-[68%] rounded-full bg-sidebar-primary/88" />
          </div>
        </div>
      </div>
    </aside>
  );
}
