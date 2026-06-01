import { CalendarClock, FolderKanban } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project, Task } from "@/types";

interface ProjectsPageProps {
  projects: Project[];
  tasks: Task[];
}

function formatDate(value?: string) {
  if (!value) return "날짜 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getProjectStats(projectId: string, tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);
  const completed = projectTasks.filter((task) => task.status === "done").length;
  const active = projectTasks.filter((task) => task.status !== "done").length;
  const progress = projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0;

  return {
    active,
    completed,
    progress,
    total: projectTasks.length,
  };
}

export function ProjectsPage({ projects, tasks }: ProjectsPageProps) {
  const totalTasks = tasks.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-4 border-0 bg-card/70 px-3 py-1 shadow-xs">
            프로젝트
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">프로젝트 라이브러리</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            진행 중인 일과 프로젝트의 목적, 다음 마일스톤을 차분하게 살펴보는 공간입니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full">내보내기</Button>
          <Button className="rounded-full bg-terracotta/76 text-[#442d25] hover:bg-terracotta dark:text-[#1d130f]">새 프로젝트</Button>
        </div>
      </section>

      <section className="rounded-2xl bg-card/82 p-7 shadow-xs backdrop-blur md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">워크스페이스 요약</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">집중해야 할 프로젝트만 가볍게 모았습니다</h2>
          </div>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span>프로젝트 {projects.length}개</span>
            <span>작업 {totalTasks}개</span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => {
          const stats = getProjectStats(project.id, tasks);

          return (
            <article
              key={project.id}
              className="rounded-2xl bg-card/86 p-7 shadow-xs backdrop-blur transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-card hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="grid size-12 place-items-center rounded-2xl bg-warm-beige/28 text-muted-foreground">
                  <FolderKanban className="size-5" />
                </div>
                <Badge variant="outline" className="rounded-full border-0 bg-muted/70 capitalize">
                  {project.status === "active" ? "진행 중" : "계획 중"}
                </Badge>
              </div>

              <div className="mt-7">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                  <h2 className="truncate text-xl font-semibold tracking-tight">{project.name}</h2>
                </div>
                <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{project.description}</p>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">진행률</span>
                  <span className="font-medium">{stats.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-sage/85" style={{ width: `${stats.progress}%` }} />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/55 px-5 py-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-4" />
                    마감 {formatDate(project.dueDate)}
                  </div>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>진행 {stats.active}개</span>
                    <span>완료 {stats.completed}개</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
