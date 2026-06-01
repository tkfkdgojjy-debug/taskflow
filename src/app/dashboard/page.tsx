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
import { mockBurndownData, mockProjects, mockTasks } from "@/data/mock-data";
import type { Task } from "@/types";

const weeklyProductivity = [
  { day: "월", completed: 3, focus: 5 },
  { day: "화", completed: 5, focus: 6 },
  { day: "수", completed: 4, focus: 6 },
  { day: "목", completed: 7, focus: 7 },
  { day: "금", completed: 6, focus: 8 },
  { day: "토", completed: 2, focus: 4 },
  { day: "일", completed: 1, focus: 3 },
];

const monthlyCompletion = mockBurndownData.map((point, index) => ({
  week: `${index + 1}주`,
  completed: point.completed + index * 2,
  remaining: point.remaining,
}));

const todayTasks = mockTasks
  .filter((task) => task.status !== "done")
  .slice(0, 3)
  .map((task, index) => ({
    ...task,
    time: ["09:30", "13:00", "16:30"][index],
  }));

const upcomingTasks = [...mockTasks]
  .filter((task) => task.dueDate && task.status !== "done")
  .sort((a, b) => new Date(a.dueDate ?? "").getTime() - new Date(b.dueDate ?? "").getTime())
  .slice(0, 4);

function formatDate(value?: string) {
  if (!value) return "날짜 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getTaskProject(task: Task) {
  return mockProjects.find((project) => project.id === task.projectId);
}

function getProjectProgress(projectId: string) {
  const projectTasks = mockTasks.filter((task) => task.projectId === projectId);
  if (projectTasks.length === 0) return 0;

  const completed = projectTasks.filter((task) => task.status === "done").length;
  return Math.round((completed / projectTasks.length) * 100);
}

export default function DashboardPage() {
  const focusTask = todayTasks[0];
  const completedTasks = mockTasks.filter((task) => task.status === "done").length;
  const activeTasks = mockTasks.filter((task) => task.status !== "done").length;
  const completionRate = mockTasks.length ? Math.round((completedTasks / mockTasks.length) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="pt-2">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 border-0 bg-card/70 px-3 py-1 shadow-xs">
              데일리 워크스페이스
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              오늘 할 일이 선명하면 하루가 가벼워집니다.
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              지금 집중할 일, 곧 다가올 일정, 프로젝트의 흐름을 차분하게 확인하세요.
            </p>
          </div>
          <Button variant="outline" className="w-fit rounded-full">
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
                {focusTask?.title ?? "중요한 작업 하나를 선택하세요"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {focusTask?.description ??
                  "의미 있는 작업 하나를 정하고 나머지 하루를 단순하게 유지하세요."}
              </p>
            </div>
            <div className="grid size-24 shrink-0 place-items-center rounded-full bg-muted/50">
              <div className="grid size-16 place-items-center rounded-full bg-background shadow-xs">
                <span className="text-lg font-semibold">{completionRate}%</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {todayTasks.map((task) => {
              const project = getTaskProject(task);

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
            })}
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
            {upcomingTasks.map((task) => {
              const project = getTaskProject(task);

              return (
                <div key={task.id} className="rounded-2xl bg-background/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold">{task.title}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{project?.name}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}
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
          {mockProjects.map((project) => {
            const progress = getProjectProgress(project.id);
            const projectTasks = mockTasks.filter((task) => task.projectId === project.id);

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
          })}
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
