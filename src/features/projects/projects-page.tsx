"use client";

import { useState, type FormEvent } from "react";
import { CalendarClock, FolderKanban, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  defaultClientName,
  getProjectCategoryColor,
  getProjectCategoryLabel,
  projectCategoryOptions,
} from "@/constants/project-categories";
import { useTaskStore } from "@/store/task-store";
import type { ProjectCategory, Task } from "@/types";

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

const projectColors = projectCategoryOptions.map((category) => category.color);

export function ProjectsPage() {
  const projects = useTaskStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const createProject = useTaskStore((state) => state.createProject);
  const deleteProject = useTaskStore((state) => state.deleteProject);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectClientName, setNewProjectClientName] = useState(defaultClientName);
  const [newProjectCategory, setNewProjectCategory] = useState<ProjectCategory>("fixed");
  const [newProjectDueDate, setNewProjectDueDate] = useState("");
  const [newProjectColor, setNewProjectColor] = useState(getProjectCategoryColor("fixed"));
  const totalTasks = tasks.length;
  const projectToDelete = projects.find((project) => project.id === deleteProjectId);

  function confirmDeleteProject() {
    if (!deleteProjectId) return;
    deleteProject(deleteProjectId);
    setDeleteProjectId(null);
  }

  function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clientName = newProjectClientName.trim() || defaultClientName;
    const categoryLabel = getProjectCategoryLabel(newProjectCategory);
    const projectName = newProjectName.trim() || `${clientName} · ${categoryLabel}`;

    createProject({
      name: projectName,
      description: newProjectDescription.trim() || `${clientName} ${categoryLabel} 업무입니다.`,
      category: newProjectCategory,
      clientName,
      color: newProjectColor,
      dueDate: newProjectDueDate ? `${newProjectDueDate}T09:00:00.000Z` : undefined,
      status: "active",
    });

    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectClientName(defaultClientName);
    setNewProjectCategory("fixed");
    setNewProjectDueDate("");
    setNewProjectColor(getProjectCategoryColor("fixed"));
    setIsCreateOpen(false);
  }

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
          <Button
            type="button"
            className="rounded-full bg-terracotta/76 text-[#442d25] hover:bg-terracotta dark:text-[#1d130f]"
            onClick={() => setIsCreateOpen((current) => !current)}
          >
            <Plus />
            새 프로젝트
          </Button>
        </div>
      </section>

      {isCreateOpen ? (
        <form className="rounded-2xl bg-card/86 p-6 shadow-xs backdrop-blur" onSubmit={handleCreateProject}>
          <div className="grid gap-3 lg:grid-cols-[1fr_160px_170px_170px_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">프로젝트 이름</span>
              <input
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder="비우면 고객사와 분류로 자동 생성"
                className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">고객사</span>
              <input
                value={newProjectClientName}
                onChange={(event) => setNewProjectClientName(event.target.value)}
                placeholder="고객사명"
                className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">업무 분류</span>
              <select
                value={newProjectCategory}
                onChange={(event) => {
                  const category = event.target.value as ProjectCategory;
                  setNewProjectCategory(category);
                  setNewProjectColor(getProjectCategoryColor(category));
                }}
                className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              >
                {projectCategoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-medium text-muted-foreground">마감일</span>
              <input
                type="date"
                value={newProjectDueDate}
                onChange={(event) => setNewProjectDueDate(event.target.value)}
                className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
              />
            </label>
            <Button type="submit" className="rounded-full">
              프로젝트 추가
            </Button>
          </div>
          <textarea
            value={newProjectDescription}
            onChange={(event) => setNewProjectDescription(event.target.value)}
            placeholder="프로젝트 설명"
            className="mt-3 min-h-20 w-full resize-none rounded-2xl bg-background/70 px-4 py-3 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
          />
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">색상</span>
            {projectColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`size-7 rounded-full transition-transform ${
                  newProjectColor === color ? "scale-110 ring-2 ring-ring ring-offset-2 ring-offset-card" : ""
                }`}
                style={{ backgroundColor: color }}
                aria-label={`${color} 선택`}
                onClick={() => setNewProjectColor(color)}
              />
            ))}
          </div>
        </form>
      ) : null}

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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full border-0 bg-muted/70 capitalize">
                    {project.status === "active" ? "진행 중" : "계획 중"}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-0 bg-secondary/70">
                    {getProjectCategoryLabel(project.category)}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-destructive hover:bg-destructive/10"
                    aria-label={`${project.name} 삭제`}
                    onClick={() => setDeleteProjectId(project.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="mt-7">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                  <h2 className="truncate text-xl font-semibold tracking-tight">{project.name}</h2>
                </div>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  고객사 {project.clientName ?? defaultClientName}
                </p>
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

      <ConfirmDialog
        confirmLabel="삭제"
        description={`${
          projectToDelete?.name ?? "선택한 프로젝트"
        }와 연결된 작업이 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        isOpen={Boolean(deleteProjectId)}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={confirmDeleteProject}
        title="프로젝트를 삭제할까요?"
      />
    </div>
  );
}
