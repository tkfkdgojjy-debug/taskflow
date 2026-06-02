"use client";

import { useMemo, useState, type ComponentType, type FormEvent } from "react";
import { Flag, Goal as GoalIcon, Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { defaultClientName, getProjectCategoryLabel } from "@/constants/project-categories";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/task-store";
import type { GoalItem, Project, Task } from "@/types";

function getProjectDisplay(project?: Project) {
  if (!project) return "프로젝트 없음";

  return `${project.clientName ?? defaultClientName} · ${getProjectCategoryLabel(project.category)}`;
}

function getGoalStats(goal: GoalItem, tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectId === goal.projectId);
  const completed = projectTasks.filter((task) => task.status === "done").length;
  const active = projectTasks.filter((task) => task.status !== "done").length;
  const progress = Math.min(100, Math.round((completed / goal.target) * 100));

  return {
    active,
    completed,
    progress,
    total: projectTasks.length,
  };
}

export function GoalsPage() {
  const goals = useTaskStore((state) => state.goals);
  const projects = useTaskStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const createGoal = useTaskStore((state) => state.createGoal);
  const deleteGoal = useTaskStore((state) => state.deleteGoal);
  const [deleteGoalId, setDeleteGoalId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalProjectId, setNewGoalProjectId] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("5");
  const goalToDelete = goals.find((goal) => goal.id === deleteGoalId);
  const createProjectId = newGoalProjectId || projects[0]?.id || "";

  const visibleGoals = useMemo(() => {
    const projectIds = new Set(projects.map((project) => project.id));
    return goals.filter((goal) => projectIds.has(goal.projectId));
  }, [goals, projects]);

  const activeGoals = visibleGoals.filter((goal) => getGoalStats(goal, tasks).progress < 100);
  const completedGoals = visibleGoals.length - activeGoals.length;
  const averageProgress = visibleGoals.length
    ? Math.round(visibleGoals.reduce((sum, goal) => sum + getGoalStats(goal, tasks).progress, 0) / visibleGoals.length)
    : 0;

  function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newGoalTitle.trim() || !createProjectId) return;

    createGoal({
      projectId: createProjectId,
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim() || "목표 설명을 추가하세요.",
      target: Number(newGoalTarget) || 1,
    });

    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalProjectId(createProjectId);
    setNewGoalTarget("5");
    setIsCreateOpen(false);
  }

  function confirmDeleteGoal() {
    if (!deleteGoalId) return;

    deleteGoal(deleteGoalId);
    setDeleteGoalId(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-4 border-0 bg-card/70 px-3 py-1 shadow-xs">
            목표
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">목표 추적</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            프로젝트와 작업 완료 상태를 연결해 매일의 실행이 목표 진행률로 이어지게 합니다.
          </p>
        </div>
        <Button
          type="button"
          className="w-fit rounded-full bg-olive/82 text-[#303629] hover:bg-olive dark:text-[#151813]"
          disabled={projects.length === 0}
          onClick={() => setIsCreateOpen((current) => !current)}
        >
          <Plus />
          새 목표
        </Button>
      </section>

      {isCreateOpen ? (
        <form className="rounded-2xl bg-card/86 p-6 shadow-xs backdrop-blur" onSubmit={handleCreateGoal}>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_120px_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">목표 이름</span>
              <input
                value={newGoalTitle}
                onChange={(event) => setNewGoalTitle(event.target.value)}
                placeholder="예: 이번 달 정산 업무 완료"
                className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">연결 프로젝트</span>
              <select
                value={createProjectId}
                onChange={(event) => setNewGoalProjectId(event.target.value)}
                className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {getProjectDisplay(project)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">목표 작업 수</span>
              <input
                type="number"
                min={1}
                value={newGoalTarget}
                onChange={(event) => setNewGoalTarget(event.target.value)}
                className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              />
            </label>
            <Button type="submit" className="rounded-full" disabled={!newGoalTitle.trim() || !createProjectId}>
              추가
            </Button>
          </div>
          <textarea
            value={newGoalDescription}
            onChange={(event) => setNewGoalDescription(event.target.value)}
            placeholder="목표 설명"
            className="mt-3 min-h-20 w-full resize-none rounded-2xl bg-background/70 px-4 py-3 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            연결된 프로젝트의 완료 작업 수가 목표 진행률에 자동 반영됩니다.
          </p>
        </form>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <GoalMetric icon={Target} label="진행 중인 목표" value={activeGoals.length} tone="bg-sage/22" />
        <GoalMetric icon={TrendingUp} label="평균 진행률" value={`${averageProgress}%`} tone="bg-dusty-blue/24" />
        <GoalMetric icon={Flag} label="완료한 목표" value={completedGoals} tone="bg-terracotta/20" />
      </section>

      {visibleGoals.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {visibleGoals.map((goal) => {
            const stats = getGoalStats(goal, tasks);
            const project = projects.find((item) => item.id === goal.projectId);

            return (
              <article
                key={goal.id}
                className="rounded-2xl bg-card/86 p-7 shadow-xs backdrop-blur transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-card hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="grid size-12 place-items-center rounded-2xl bg-warm-beige/28 text-muted-foreground">
                    <GoalIcon className="size-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={stats.progress >= 100 ? "secondary" : "outline"}
                      className="rounded-full border-0 bg-muted/70"
                    >
                      {stats.progress >= 100 ? "완료" : "진행 중"}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 text-destructive hover:bg-destructive/10"
                      aria-label={`${goal.title} 삭제`}
                      onClick={() => setDeleteGoalId(goal.id)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <div className="mt-7">
                  <h2 className="text-xl font-semibold tracking-tight">{goal.title}</h2>
                  <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{goal.description}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ backgroundColor: project?.color }} />
                    <span>{getProjectDisplay(project)}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      완료 {stats.completed}개 / 목표 {goal.target}개
                    </span>
                    <span className="font-medium">{stats.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        stats.progress >= 100 ? "bg-sage/90" : "bg-primary/82",
                      )}
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>프로젝트 작업 {stats.total}개</span>
                    <span>진행 중 {stats.active}개</span>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          icon={GoalIcon}
          title={projects.length > 0 ? "아직 목표가 없습니다" : "먼저 프로젝트를 만들어주세요"}
          description={
            projects.length > 0
              ? "프로젝트 작업을 측정 가능한 결과와 연결할 목표를 만들어보세요."
              : "목표는 프로젝트와 연결되어 진행률을 계산합니다."
          }
          actionLabel={projects.length > 0 ? "목표 만들기" : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      <ConfirmDialog
        confirmLabel="삭제"
        description={`${goalToDelete?.title ?? "선택한 목표"}를 삭제합니다. 연결된 작업과 프로젝트는 유지됩니다.`}
        isOpen={Boolean(deleteGoalId)}
        onClose={() => setDeleteGoalId(null)}
        onConfirm={confirmDeleteGoal}
        title="목표를 삭제할까요?"
      />
    </div>
  );
}

function GoalMetric({
  icon: Icon,
  label,
  value,
  tone = "bg-muted/40",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  tone?: string;
  value: number | string;
}) {
  return (
    <article className="rounded-2xl bg-card/82 p-5 shadow-xs backdrop-blur">
      <div className={cn("grid size-10 place-items-center rounded-2xl text-muted-foreground", tone)}>
        <Icon className="size-4" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}
