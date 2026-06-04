"use client";

import { useState, type FormEvent } from "react";
import { Bell, Database, Moon, Plus, Repeat2, ShieldCheck, Sun, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { defaultClientName } from "@/constants/project-categories";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/task-store";
import { useUIStore } from "@/store/ui-store";
import type { TaskPriority } from "@/types";

const priorityLabels: Record<TaskPriority, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  urgent: "긴급",
};

export function SettingsPageClient() {
  const { toast } = useToast();
  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);
  const clearTasks = useTaskStore((state) => state.clearTasks);
  const createRecurringTemplate = useTaskStore((state) => state.createRecurringTemplate);
  const deleteRecurringTemplate = useTaskStore((state) => state.deleteRecurringTemplate);
  const generateRecurringTasksForMonth = useTaskStore((state) => state.generateRecurringTasksForMonth);
  const recurringTemplates = useTaskStore((state) => state.recurringTemplates);
  const tasks = useTaskStore((state) => state.tasks);
  const updateRecurringTemplate = useTaskStore((state) => state.updateRecurringTemplate);
  const [isClearTasksConfirmOpen, setIsClearTasksConfirmOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [newTemplateClientName, setNewTemplateClientName] = useState(defaultClientName);
  const [newTemplateDay, setNewTemplateDay] = useState("1");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [newTemplatePriority, setNewTemplatePriority] = useState<TaskPriority>("medium");
  const [newTemplateTitle, setNewTemplateTitle] = useState("");

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

  function createTemplate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTemplateTitle.trim()) return;

    createRecurringTemplate({
      clientName: newTemplateClientName.trim() || defaultClientName,
      title: newTemplateTitle.trim(),
      description: newTemplateDescription.trim() || undefined,
      dayOfMonth: Number(newTemplateDay) || 1,
      priority: newTemplatePriority,
    });

    setNewTemplateTitle("");
    setNewTemplateDescription("");
    setNewTemplateDay("1");
    setNewTemplatePriority("medium");

    toast({
      title: "고정 템플릿이 추가되었습니다",
      description: "앱을 열 때 이번 달 작업이 자동으로 생성됩니다.",
      variant: "success",
    });
  }

  function generateCurrentMonthTasks() {
    const generatedTasks = generateRecurringTasksForMonth();

    toast({
      title: generatedTasks.length > 0 ? "고정 업무가 생성되었습니다" : "생성할 고정 업무가 없습니다",
      description:
        generatedTasks.length > 0
          ? `이번 달 작업 ${generatedTasks.length}개를 추가했습니다.`
          : "이미 이번 달 고정 업무가 생성되어 있습니다.",
      variant: generatedTasks.length > 0 ? "success" : "default",
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

          <section className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
                  <Repeat2 className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">고정 템플릿</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    매달 같은 날짜에 생성할 고정 업무를 관리합니다.
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={generateCurrentMonthTasks}>
                이번 달 생성
              </Button>
            </div>

            <form className="mt-5 rounded-2xl bg-background/70 p-4" onSubmit={createTemplate}>
              <div className="grid gap-3 lg:grid-cols-[1fr_140px_100px_120px_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">업무 제목</span>
                  <input
                    value={newTemplateTitle}
                    onChange={(event) => setNewTemplateTitle(event.target.value)}
                    placeholder="예: 월간 리포트 발송"
                    className="h-10 w-full rounded-full bg-card px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">고객사</span>
                  <input
                    value={newTemplateClientName}
                    onChange={(event) => setNewTemplateClientName(event.target.value)}
                    placeholder="고객사명"
                    className="h-10 w-full rounded-full bg-card px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">매월</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={newTemplateDay}
                    onChange={(event) => setNewTemplateDay(event.target.value)}
                    className="h-10 w-full rounded-full bg-card px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-muted-foreground">우선순위</span>
                  <select
                    value={newTemplatePriority}
                    onChange={(event) => setNewTemplatePriority(event.target.value as TaskPriority)}
                    className="h-10 w-full rounded-full bg-card px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                    <option value="urgent">긴급</option>
                  </select>
                </label>
                <Button type="submit" className="rounded-full" disabled={!newTemplateTitle.trim()}>
                  <Plus />
                  추가
                </Button>
              </div>
              <textarea
                value={newTemplateDescription}
                onChange={(event) => setNewTemplateDescription(event.target.value)}
                placeholder="설명"
                className="mt-3 min-h-16 w-full resize-none rounded-2xl bg-card px-4 py-3 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              />
            </form>

            <div className="mt-5 space-y-2">
              {recurringTemplates.length > 0 ? (
                recurringTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex flex-col gap-3 rounded-2xl bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium tracking-tight">{template.title}</p>
                        <Badge variant="outline" className="rounded-full border-0 bg-muted/70">
                          매월 {template.dayOfMonth}일
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {priorityLabels[template.priority]}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {template.clientName} · 고정업무
                        {template.description ? ` · ${template.description}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-pressed={template.enabled}
                        className="relative h-6 w-11 rounded-full border bg-muted transition-colors aria-pressed:bg-primary"
                        onClick={() => updateRecurringTemplate(template.id, { enabled: !template.enabled })}
                      >
                        <span
                          className={cn(
                            "absolute left-0.5 top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform",
                            template.enabled && "translate-x-5",
                          )}
                        />
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 text-destructive hover:bg-destructive/10"
                        aria-label={`${template.title} 템플릿 삭제`}
                        onClick={() => deleteRecurringTemplate(template.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid min-h-28 place-items-center rounded-2xl bg-background/70 p-5 text-center text-sm text-muted-foreground">
                  아직 등록된 고정 템플릿이 없습니다.
                </div>
              )}
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
