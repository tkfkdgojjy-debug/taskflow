"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { DbSyncProvider } from "@/components/data/db-sync-provider";
import { Button } from "@/components/ui/button";
import { ToastProvider } from "@/components/ui/toast";
import { appTransition, softSpring } from "@/lib/motion";
import { useUIStore } from "@/store/ui-store";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("taskflow.theme");
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      setThemeMode(storedTheme);
    }
  }, [setThemeMode]);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = themeMode === "dark" || (themeMode === "system" && prefersDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);
    window.localStorage.setItem("taskflow.theme", themeMode);
  }, [themeMode]);

  return (
    <ToastProvider>
      <DbSyncProvider>
        <div className="min-h-screen bg-background text-foreground">
          <div className="hidden md:fixed md:inset-y-4 md:left-4 md:z-40 md:block">
            <Sidebar activePath={pathname} />
          </div>

          <AnimatePresence>
            {isMobileOpen ? (
              <motion.div
                className="fixed inset-0 z-50 md:hidden"
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={appTransition}
              >
                <button
                  type="button"
                  className="absolute inset-0 bg-background/70 backdrop-blur-sm"
                  aria-label="내비게이션 배경 닫기"
                  onClick={() => setIsMobileOpen(false)}
                />
                <motion.div
                  className="absolute inset-y-3 left-3 max-w-[85vw] shadow-xl"
                  initial={{ opacity: 0, scale: 0.98, x: -24 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98, x: -24 }}
                  transition={softSpring}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3 z-10 md:hidden"
                    aria-label="사이드바 닫기"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <X />
                  </Button>
                  <Sidebar activePath={pathname} onNavigate={() => setIsMobileOpen(false)} />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="md:pl-[312px]">
            <Header onMenuClick={() => setIsMobileOpen(true)} />
            <motion.main
              key={pathname}
              className="min-h-[calc(100vh-4.5rem)] px-4 pb-6 pt-2 md:px-8 md:pb-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={appTransition}
            >
              {children}
            </motion.main>
          </div>
        </div>
      </DbSyncProvider>
    </ToastProvider>
  );
}
