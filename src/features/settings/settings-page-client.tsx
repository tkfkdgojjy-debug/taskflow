"use client";

import { useState } from "react";
import { Bell, Database, Moon, ShieldCheck, Sun, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/task-store";
import { useUIStore } from "@/store/ui-store";

export function SettingsPageClient() {
  const { toast } = useToast();
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);
  const clearTasks = useTaskStore((state) => state.clearTasks);
  const tasks = useTaskStore((state) => state.tasks);
  const [isClearTasksConfirmOpen, setIsClearTasksConfirmOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  function saveSettings() {
    toast({
      title: "설정이 저장되었습니다",
      description: "워크스페이스 환경설정이 업데이트되었습니다.",
      variant: "success",
    });
  }

  function clearLocalData() {
    window.localStorage.removeItem("task-management-store-ko");
    setIsConfirmOpen(false);
    toast({
      title: "로컬 데이터가 삭제되었습니다",
      description: "앱을 새로고침하면 기본 목 워크스페이스가 복원됩니다.",
      variant: "success",
    });
  }

  function clearSampleTasks() {
    clearTasks();
    setIsClearTasksConfirmOpen(false);
    toast({
      title: "샘플 작업을 비웠습니다",
      description: "작업 목록의 샘플 데이터가 삭제되었습니다.",
      variant: "success",
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 bg-background">
            설정
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">워크스페이스 설정</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            워크스페이스 환경, 테마, 알림, 로컬 목 데이터를 관리합니다.
          </p>
        </div>
        <Button onClick={saveSettings}>변경사항 저장</Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
                <UserRound className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">프로필</h2>
                <p className="mt-1 text-sm text-muted-foreground">목 워크스페이스에서 사용하는 기본 프로필입니다.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">표시 이름</span>
                <input
                  defaultValue="워크스페이스 관리자"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">이메일</span>
                <input
                  defaultValue="owner@example.com"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/20"
                />
              </label>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
                {themeMode === "dark" ? <Moon className="size-5" /> : <Sun className="size-5" />}
              </div>
              <div>
                <h2 className="text-base font-semibold">화면 모드</h2>
                <p className="mt-1 text-sm text-muted-foreground">앱 전체에 적용되는 테마를 선택합니다.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {(["system", "light", "dark"] as const).map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  variant={themeMode === mode ? "default" : "outline"}
                  onClick={() => setThemeMode(mode)}
                >
                  {mode === "system" ? "시스템" : mode === "light" ? "라이트" : "다크"}
                </Button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
                <Bell className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">알림</h2>
                <p className="mt-1 text-sm text-muted-foreground">목 알림 환경설정을 조정합니다.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <ToggleRow
                checked={emailNotifications}
                description="중요한 프로젝트와 작업 업데이트를 받습니다."
                label="이메일 알림"
                onChange={setEmailNotifications}
              />
              <ToggleRow
                checked={weeklyDigest}
                description="완료한 작업의 주간 요약을 받습니다."
                label="주간 요약"
                onChange={setWeeklyDigest}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">워크스페이스 상태</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              목 워크스페이스가 로컬에서 실행 중이며 작업 보드 상태가 저장됩니다.
            </p>
            <div className="mt-4 rounded-lg border bg-muted/25 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">저장된 작업</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
              <Database className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">로컬 데이터</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              기본 목 데이터로 돌아가고 싶다면 저장된 로컬 상태를 삭제하세요.
            </p>
            <Button type="button" variant="destructive" className="mt-4 w-full" onClick={() => setIsConfirmOpen(true)}>
              로컬 데이터 삭제
            </Button>
          </section>

          <section className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="grid size-10 place-items-center rounded-lg border bg-terracotta/15 text-muted-foreground">
              <Trash2 className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">샘플 작업 비우기</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              처음 제공된 샘플 작업들을 모두 삭제하고 빈 작업 목록으로 시작합니다.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full text-destructive hover:bg-destructive/10"
              onClick={() => setIsClearTasksConfirmOpen(true)}
            >
              샘플 작업 전체 삭제
            </Button>
          </section>

          <EmptyState
            icon={Database}
            title="연동된 서비스가 없습니다"
            description="목 워크스페이스에는 외부 연동이 연결되어 있지 않습니다."
          />
        </aside>
      </section>

      <ConfirmDialog
        confirmLabel="전체 삭제"
        description="현재 작업 목록의 모든 샘플 작업이 삭제됩니다. 삭제 후에는 빈 작업 목록으로 시작합니다."
        isOpen={isClearTasksConfirmOpen}
        onClose={() => setIsClearTasksConfirmOpen(false)}
        onConfirm={clearSampleTasks}
        title="샘플 작업을 모두 삭제할까요?"
      />

      <ConfirmDialog
        confirmLabel="데이터 삭제"
      description="저장된 로컬 상태가 삭제됩니다. 새로고침 후 기본 목 데이터가 복원됩니다."
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={clearLocalData}
        title="로컬 데이터를 삭제할까요?"
      />
    </div>
  );
}

function ToggleRow({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        aria-pressed={checked}
        className="relative h-6 w-11 rounded-full border bg-muted transition-colors aria-pressed:bg-primary"
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
