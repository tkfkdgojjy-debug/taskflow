"use client";

import { Bell, Menu, Moon, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);

  const isDark = themeMode === "dark";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 bg-transparent px-4 backdrop-blur-xl md:px-8">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10 md:hidden"
        aria-label="사이드바 열기"
        onClick={onMenuClick}
      >
        <Menu />
      </Button>

      <div className="hidden min-w-0 flex-1 items-center md:flex">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="search"
            placeholder="작업, 프로젝트, 사람 검색"
            className="h-11 w-full rounded-full bg-white/58 pl-11 pr-5 text-sm shadow-xs outline-none ring-1 ring-white/58 backdrop-blur-2xl transition-[background,box-shadow,transform] placeholder:text-muted-foreground/70 focus:bg-white/78 focus:shadow-[var(--shadow-focus)] dark:bg-white/8 dark:ring-white/10 dark:focus:bg-white/12"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-1.5 md:flex-none">
        <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="알림">
          <Bell />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label="다크 모드 전환"
          onClick={() => setThemeMode(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
        <div className="ml-2 flex h-10 items-center gap-2 rounded-full bg-white/58 px-2 pr-3 text-sm shadow-xs ring-1 ring-white/58 backdrop-blur-2xl dark:bg-white/8 dark:ring-white/10">
          <div className="grid size-7 place-items-center rounded-full bg-[linear-gradient(135deg,#7f8cff,#4f63f2)] text-[10px] font-semibold text-white">
            JJ
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground sm:block">워크스페이스</span>
        </div>
      </div>
    </header>
  );
}
