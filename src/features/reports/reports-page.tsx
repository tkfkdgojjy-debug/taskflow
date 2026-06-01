import { BarChart3, CheckCircle2, Clock3, Download, ListTodo } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Project, Task, TaskStatus } from "@/types";

interface ReportsPageProps {
  projects: Project[];
  tasks: Task[];
}

const statusLabels: Record<TaskStatus, string> = {
  backlog: "백로그",
  todo: "할 일",
  in_progress: "진행 중",
  review: "검토",
  done: "완료",
};

function countByStatus(tasks: Task[], status: TaskStatus) {
  return tasks.filter((task) => task.status === status).length;
}

export function ReportsPage({ projects, tasks }: ReportsPageProps) {
  const completed = countByStatus(tasks, "done");
  const active = tasks.filter((task) => task.status !== "done").length;
  const totalEstimate = tasks.reduce((sum, task) => sum + (task.estimateHours ?? 0), 0);
  const completionRate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const statusOrder: TaskStatus[] = ["todo", "in_progress", "review", "done"];
  const maxStatusCount = Math.max(1, ...statusOrder.map((status) => countByStatus(tasks, status)));

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 bg-background">
            리포트
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">진행 리포트</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            작업 처리 흐름, 업무 분포, 프로젝트별 실행 신호를 확인합니다.
          </p>
        </div>
        <Button variant="outline">
          <Download />
          리포트 내보내기
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ReportMetric icon={ListTodo} label="전체 작업" value={tasks.length} tone="bg-warm-beige/28" />
        <ReportMetric icon={CheckCircle2} label="완료" value={completed} tone="bg-sage/24" />
        <ReportMetric icon={Clock3} label="진행 중" value={active} tone="bg-dusty-blue/24" />
        <ReportMetric icon={BarChart3} label="완료율" value={`${completionRate}%`} tone="bg-terracotta/18" />
      </section>

      {tasks.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="mb-6">
              <h2 className="text-base font-semibold">상태별 분포</h2>
              <p className="mt-1 text-sm text-muted-foreground">현재 작업량을 단계별로 나누어 보여줍니다.</p>
            </div>
            <div className="space-y-4">
              {statusOrder.map((status) => {
                const count = countByStatus(tasks, status);
                const width = Math.round((count / maxStatusCount) * 100);

                return (
                  <div key={status} className="grid gap-2 sm:grid-cols-[130px_1fr_40px] sm:items-center">
                    <div className="text-sm font-medium">{statusLabels[status]}</div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-dusty-blue/85" style={{ width: `${width}%` }} />
                    </div>
                    <div className="text-right text-sm text-muted-foreground">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="rounded-lg border bg-card p-5 shadow-xs">
            <h2 className="text-base font-semibold">프로젝트별 업무량</h2>
            <p className="mt-1 text-sm text-muted-foreground">프로젝트별 예상 작업 시간을 보여줍니다.</p>
            <div className="mt-5 space-y-4">
              {projects.map((project) => {
                const projectTasks = tasks.filter((task) => task.projectId === project.id);
                const estimate = projectTasks.reduce((sum, task) => sum + (task.estimateHours ?? 0), 0);
                const width = totalEstimate ? Math.round((estimate / totalEstimate) * 100) : 0;

                return (
                  <div key={project.id}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ backgroundColor: project.color }} />
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <span className="text-muted-foreground">{estimate}시간</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-olive/85" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="리포트 데이터가 없습니다"
          description="작업을 만들고 흐름에 따라 이동하면 리포트가 표시됩니다."
        />
      )}
    </div>
  );
}

function ReportMetric({
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
    <article className="rounded-lg border bg-card p-4 shadow-xs">
      <div className={`grid size-9 place-items-center rounded-md border border-border/45 ${tone} text-muted-foreground`}>
        <Icon className="size-4" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}
