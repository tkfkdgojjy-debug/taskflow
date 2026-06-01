import { Flag, Goal, Target, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Project, Task } from "@/types";

interface GoalsPageProps {
  projects: Project[];
  tasks: Task[];
}

const goals = [
  {
    id: "goal-1",
    title: "MVP 기반 출시",
    description: "핵심 작업 흐름과 분석 화면을 완성합니다.",
    projectId: "project-1",
    target: 8,
  },
  {
    id: "goal-2",
    title: "업무 가시성 개선",
    description: "다가오는 작업과 프로젝트 리스크를 놓치지 않게 정리합니다.",
    projectId: "project-1",
    target: 5,
  },
  {
    id: "goal-3",
    title: "고객 성공 흐름 준비",
    description: "첫 지원 중심 프로젝트 구조를 준비합니다.",
    projectId: "project-2",
    target: 4,
  },
];

function getGoalProgress(goal: (typeof goals)[number], tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectId === goal.projectId);
  const completed = projectTasks.filter((task) => task.status === "done").length;
  return Math.min(100, Math.round((completed / goal.target) * 100));
}

export function GoalsPage({ projects, tasks }: GoalsPageProps) {
  const activeGoals = goals.filter((goal) => getGoalProgress(goal, tasks) < 100);
  const averageProgress = goals.length
    ? Math.round(goals.reduce((sum, goal) => sum + getGoalProgress(goal, tasks), 0) / goals.length)
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-3 bg-background">
            목표
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">목표 추적</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            프로젝트 실행을 측정 가능한 결과와 연결하고 중요한 일에 집중합니다.
          </p>
        </div>
        <Button className="bg-olive/82 text-[#303629] hover:bg-olive dark:text-[#151813]">새 목표</Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <GoalMetric icon={Target} label="진행 중인 목표" value={activeGoals.length} tone="bg-sage/22" />
        <GoalMetric icon={TrendingUp} label="평균 진행률" value={`${averageProgress}%`} tone="bg-dusty-blue/24" />
        <GoalMetric icon={Flag} label="추적 중인 결과" value={goals.length} tone="bg-terracotta/20" />
      </section>

      {goals.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal, tasks);
            const project = projects.find((item) => item.id === goal.projectId);

            return (
              <article key={goal.id} className="rounded-lg border bg-card p-5 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-10 place-items-center rounded-lg border bg-muted/40 text-muted-foreground">
                    <Goal className="size-5" />
                  </div>
                  <Badge variant={progress >= 100 ? "secondary" : "outline"}>
                    {progress >= 100 ? "완료" : "순항 중"}
                  </Badge>
                </div>
                <h2 className="mt-5 text-base font-semibold">{goal.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{goal.description}</p>
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ backgroundColor: project?.color }} />
                  {project?.name ?? "프로젝트 없음"}
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">진행률</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState
          icon={Goal}
          title="아직 목표가 없습니다"
          description="프로젝트 작업을 팀의 결과와 연결할 수 있는 목표를 만들어보세요."
          actionLabel="목표 만들기"
        />
      )}
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
    <article className="rounded-lg border bg-card p-4 shadow-xs">
      <div className={`grid size-9 place-items-center rounded-md border border-border/45 ${tone} text-muted-foreground`}>
        <Icon className="size-4" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}
