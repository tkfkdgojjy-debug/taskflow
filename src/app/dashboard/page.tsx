"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  CircleDotDashed,
  Clock3,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/features/dashboard/dashboard-charts";
import { useTaskStore } from "@/store/task-store";
import type { Project, Task } from "@/types";

const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];

function formatDate(value?: string) {
  if (!value) return "날짜 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getTaskDate(task: Task) {
  return new Date(task.completedAt ?? task.dueDate ?? task.updatedAt ?? task.createdAt);
}

function getTaskProject(task: Task, projects: Project[]) {
  return projects.find((project) => project.id === task.projectId);
}

function getProjectProgress(projectId: string, tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  if (projectTasks.length === 0) return 0;

  const completed = projectTasks.filter((task) => task.status === "done").length;
  return Math.round((completed / projectTasks.length) * 100);
}

export default function DashboardPage() {
  const router = useRouter();
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useTaskStore((state) => state.projects);

  const {
    activeTasks,
    completedTasks,
    completionRate,
    focusTask,
    monthlyCompletion,
    todayTasks,
    upcomingTasks,
    weeklyProductivity,
  } = useMemo(() => {
    const incompleteTasks = tasks.filter((task) => task.status !== "done");
    const doneTasks = tasks.filter((task) => task.status === "done");
    const sortedIncompleteTasks = [...incompleteTasks].sort((a, b) => {
      const left = new Date(a.dueDate ?? a.updatedAt).getTime();
      const right = new Date(b.dueDate ?? b.updatedAt).getTime();
      return left - right;
    });

    const weekStart = getStartOfWeek(new Date());
    const weekDays = dayLabels.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return { day, date };
    });

    const weekly = weekDays.map(({ day, date }) => {
      const dayKey = date.toDateString();
      const completed = doneTasks.filter((task) => getTaskDate(task).toDateString() === dayKey).length;
      const planned = tasks.filter((task) => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate).toDateString() === dayKey;
      }).length;

      return {
        day,
        completed,
        focus: Math.max(planned, completed),
      };
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const monthly = Array.from({ length: 5 }, (_, index) => {
      const weekTasks = tasks.filter((task) => {
        const taskDate = getTaskDate(task);
        if (taskDate.getFullYear() !== currentYear || taskDate.getMonth() !== currentMonth) return false;
        return Math.floor((taskDate.getDate() - 1) / 7) === index;
      });

      return {
        week: `${index + 1}주`,
        completed: weekTasks.filter((task) => task.status === "done").length,
        remaining: weekTasks.filter((task) => task.status !== "done").length,
      };
    });

    return {
      activeTasks: incompleteTasks.length,
      completedTasks: doneTasks.length,
      completionRate: tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0,
      focusTask: sortedIncompleteTasks[0],
      monthlyCompletion: monthly,
      todayTasks: sortedIncompleteTasks.slice(0, 3).map((task, index) => ({
        ...task,
        time: ["09:30", "13:00", "16:30"][index] ?? "오늘",
      })),
      upcomingTasks: sortedIncompleteTasks
        .filter((task) => task.dueDate)
        .slice(0, 4),
      weeklyProductivity: weekly,
    };
  }, [tasks]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="pt-2">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-0 bg-card/70 px-3 py-1 shadow-xs">
              데일리 워크스페이스
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              오늘의 일이 선명해지면 하루가 가벼워집니다.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              작업, 프로젝트, 일정의 최신 상태를 한 곳에서 차분하게 확인하세요.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-fit rounded-full"
            onClick={() => router.push("/tasks?create=today")}
          >
            <Sparkles />
            오늘 계획하기
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-2xl bg-card/82 p-7 shadow-xs backdrop-blur md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">오늘의 집중</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight md:text-3xl">
                {focusTask?.title ?? "오늘 집중할 작업을 추가해보세요"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {focusTask?.description ??
                  "Tasks에서 작업을 추가하면 대시보드와 캘린더에 자동으로 반영됩니다."}
              </p>
            </div>
            <div className="grid size-24 shrink-0 place-items-center rounded-full bg-muted/50">
              <div className="grid size-16 place-items-center rounded-full bg-background shadow-xs">
                <span className="text-lg font-semibold">{completionRate}%</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => {
                const project = getTaskProject(task, projects);

                return (
                  <div key={task.id} className="rounded-2xl bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {task.time}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm font-semibold">{task.title}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-2 rounded-full" style={{ backgroundColor: project?.color }} />
                      {project?.name ?? "프로젝트 없음"}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-background/70 p-5 text-sm text-muted-foreground md:col-span-3">
                아직 진행 중인 작업이 없습니다.
              </div>
            )}
          </div>
        </article>

        <aside className="rounded-2xl bg-card/82 p-6 shadow-xs backdrop-blur md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">다가오는 작업</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">다음 순서</h2>
            </div>
            <Badge variant="secondary" className="rounded-full">
              {activeTasks}개 열림
            </Badge>
          </div>

          <div className="mt-6 space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => {
                const project = getTaskProject(task, projects);

                return (
                  <div key={task.id} className="rounded-2xl bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-semibold">{task.title}</p>
                        <p className="mt-2 text-xs text-muted-foreground">{project?.name ?? "프로젝트 없음"}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl bg-background/70 p-5 text-sm text-muted-foreground">
                예정된 마감 작업이 없습니다.
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-2xl bg-card/82 p-7 shadow-xs backdrop-blur md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">진행 중인 프로젝트</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">조용하지만 분명한 진행 상황</h2>
          </div>
          <FolderKanban className="size-5 text-muted-foreground" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {projects.length > 0 ? (
            projects.map((project) => {
              const progress = getProjectProgress(project.id, tasks);
              const projectTasks = tasks.filter((task) => task.projectId === project.id);

              return (
                <article key={project.id} className="rounded-2xl bg-background/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                        <h3 className="font-semibold">{project.name}</h3>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-0 bg-muted/70 capitalize">
                      {project.status === "active" ? "진행 중" : "계획 중"}
                    </Badge>
                  </div>
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">작업 {projectTasks.length}개</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-olive/85" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarClock className="size-3.5" />
                      마감 {formatDate(project.dueDate)}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl bg-background/70 p-6 text-sm text-muted-foreground md:col-span-2">
              아직 프로젝트가 없습니다. Projects에서 새 프로젝트를 만들면 여기에 표시됩니다.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-card/82 p-7 shadow-xs backdrop-blur md:p-8">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">생산성 요약</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">이번 주의 단순한 리듬</h2>
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CircleDotDashed className="size-4" />
              {activeTasks}개 진행
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              {completedTasks}개 완료
            </span>
          </div>
        </div>
        <DashboardCharts monthlyCompletion={monthlyCompletion} weeklyProductivity={weeklyProductivity} />
      </section>
    </div>
  );
}
