"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarDays,
  Columns3,
  ListFilter,
  Plus,
  Search,
  Table2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskDetailPanel } from "@/features/tasks/task-detail-panel";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/task-store";
import type { Activity, BoardColumn, Project, Task, TaskLabel, TaskPriority, TaskStatus, User } from "@/types";

type TaskView = "table" | "kanban";
type VisibleStatus = Extract<TaskStatus, "todo" | "in_progress" | "review" | "done">;

interface TasksPageClientProps {
  activities: Activity[];
  labels: TaskLabel[];
  users: User[];
}

const statusColumns: Array<{ label: string; value: VisibleStatus }> = [
  { label: "할 일", value: "todo" },
  { label: "진행 중", value: "in_progress" },
  { label: "검토", value: "review" },
  { label: "완료", value: "done" },
];

const priorityTone: Record<TaskPriority, string> = {
  low: "bg-sage/20 text-[#5f735b] dark:bg-sage/18 dark:text-[#c9d7c5]",
  medium: "bg-dusty-blue/24 text-[#536779] dark:bg-dusty-blue/18 dark:text-[#c5d1dc]",
  high: "bg-warning/22 text-[#7c642f] dark:bg-warning/18 dark:text-[#ead39b]",
  urgent: "bg-terracotta/22 text-[#7f5547] dark:bg-terracotta/18 dark:text-[#e0b8a8]",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
  urgent: "긴급",
};

function getTodayInputValue() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
}

function formatDate(value?: string) {
  if (!value) return "날짜 없음";

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function TasksPageClient({ activities, labels, users }: TasksPageClientProps) {
  const taskItems = useTaskStore((state) => state.tasks);
  const projects = useTaskStore((state) => state.projects);
  const columns = useTaskStore((state) => state.columns);
  const createTask = useTaskStore((state) => state.createTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const moveTask = useTaskStore((state) => state.moveTask);
  const [view, setView] = useState<TaskView>("table");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VisibleStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [projectId, setProjectId] = useState<string>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return taskItems
      .filter((task) => status === "all" || task.status === status)
      .filter((task) => priority === "all" || task.priority === priority)
      .filter((task) => projectId === "all" || task.projectId === projectId)
      .filter((task) => {
        if (!normalizedQuery) return true;

        const project = projects.find((item) => item.id === task.projectId);
        const taskLabels = labels
          .filter((label) => task.labelIds.includes(label.id))
          .map((label) => label.name)
          .join(" ");
        const haystack = `${task.title} ${task.description ?? ""} ${project?.name ?? ""} ${taskLabels}`;

        return haystack.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (a.status !== b.status) {
          return statusColumns.findIndex((column) => column.value === a.status) -
            statusColumns.findIndex((column) => column.value === b.status);
        }

        if (a.order !== b.order) return a.order - b.order;

        return (
          new Date(a.dueDate ?? "9999-12-31").getTime() -
          new Date(b.dueDate ?? "9999-12-31").getTime()
        );
      });
  }, [labels, priority, projectId, projects, query, status, taskItems]);

  const selectedTask = taskItems.find((task) => task.id === selectedTaskId);
  const activeTask = taskItems.find((task) => task.id === activeTaskId);
  const selectedProject = selectedTask ? getProject(selectedTask) : undefined;
  const createProjectId = newTaskProjectId || projects[0]?.id || "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") !== "today") return;

    const frameId = window.requestAnimationFrame(() => {
      setIsCreateOpen(true);
      setNewTaskDueDate((current) => current || getTodayInputValue());
    });
    window.history.replaceState(null, "", window.location.pathname);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function getProject(task: Task) {
    return projects.find((project) => project.id === task.projectId);
  }

  function getLabels(task: Task) {
    return labels.filter((label) => task.labelIds.includes(label.id));
  }

  function openTaskDetail(taskId: string) {
    setSelectedTaskId(taskId);
  }

  function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTaskTitle.trim() || !createProjectId) return;

    const task = createTask({
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      projectId: createProjectId,
      createdBy: users[0]?.id ?? "user-1",
      priority: newTaskPriority,
      dueDate: newTaskDueDate ? `${newTaskDueDate}T09:00:00.000Z` : undefined,
    });

    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskPriority("medium");
    setNewTaskProjectId(createProjectId);
    setIsCreateOpen(false);
    setSelectedTaskId(task.id);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const movingTask = taskItems.find((task) => task.id === activeId);
    if (!movingTask) return;

    const overTask = taskItems.find((task) => task.id === overId);
    const targetColumn = overTask
      ? columns.find((column) => column.id === overTask.columnId)
      : columns.find((column) => column.id === overId);

    if (!targetColumn) return;

    const targetColumnTasks = taskItems
      .filter((task) => task.columnId === targetColumn.id && task.id !== activeId)
      .sort((a, b) => a.order - b.order);
    const targetIndex = overTask
      ? Math.max(0, targetColumnTasks.findIndex((task) => task.id === overTask.id))
      : targetColumnTasks.length;

    moveTask({
      taskId: activeId,
      targetColumnId: targetColumn.id,
      targetIndex: targetIndex === -1 ? targetColumnTasks.length : targetIndex,
    });
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge variant="outline" className="mb-4 border-0 bg-card/70 px-3 py-1 shadow-xs">
              작업
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">작업 목록</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              스프레드시트처럼 무겁지 않게, 지금 집중해야 할 일을 가볍게 정리합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="rounded-full"
              onClick={() => setIsCreateOpen((current) => !current)}
            >
              <Plus />
              새 작업
            </Button>
            <div className="flex rounded-full bg-card/72 p-1 shadow-xs">
              <Button
                type="button"
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-9 rounded-full"
                onClick={() => setView("table")}
              >
                <Table2 />
                리스트
              </Button>
              <Button
                type="button"
                variant={view === "kanban" ? "secondary" : "ghost"}
                size="sm"
                className="h-9 rounded-full"
                onClick={() => setView("kanban")}
              >
                <Columns3 />
                보드
              </Button>
            </div>
          </div>
        </section>

        {isCreateOpen ? (
          <form className="rounded-2xl bg-card/86 p-5 shadow-xs backdrop-blur" onSubmit={handleCreateTask}>
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_140px_150px_auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">작업 제목</span>
                <input
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  placeholder="새 작업을 입력하세요"
                  className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">프로젝트</span>
                <select
                  value={createProjectId}
                  onChange={(event) => setNewTaskProjectId(event.target.value)}
                  className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">우선순위</span>
                <select
                  value={newTaskPriority}
                  onChange={(event) => setNewTaskPriority(event.target.value as TaskPriority)}
                  className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                  <option value="urgent">긴급</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium text-muted-foreground">마감일</span>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(event) => setNewTaskDueDate(event.target.value)}
                  className="h-11 w-full rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                />
              </label>
              <Button type="submit" className="rounded-full" disabled={!newTaskTitle.trim() || !createProjectId}>
                추가
              </Button>
            </div>
            <textarea
              value={newTaskDescription}
              onChange={(event) => setNewTaskDescription(event.target.value)}
              placeholder="설명을 추가하세요"
              className="mt-3 min-h-20 w-full resize-none rounded-2xl bg-background/70 px-4 py-3 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
            />
            {projects.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">작업을 추가하려면 먼저 프로젝트를 만들어주세요.</p>
            ) : null}
          </form>
        ) : null}

        <section className="rounded-2xl bg-card/82 p-4 shadow-xs backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="작업, 설명, 프로젝트, 라벨 검색"
                className="h-11 w-full rounded-full bg-background/70 pl-11 pr-4 text-sm outline-none transition-[background,box-shadow] placeholder:text-muted-foreground/70 focus:bg-background focus:shadow-[var(--shadow-focus)]"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3 lg:flex lg:items-center">
              <label className="relative">
                <span className="sr-only">상태 필터</span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as VisibleStatus | "all")}
                  className="h-11 min-w-36 rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="all">전체 상태</option>
                  {statusColumns.map((column) => (
                    <option key={column.value} value={column.value}>
                      {column.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="sr-only">우선순위 필터</span>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as TaskPriority | "all")}
                  className="h-11 min-w-36 rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="all">전체 우선순위</option>
                  <option value="urgent">긴급</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </label>

              <label>
                <span className="sr-only">프로젝트 필터</span>
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  className="h-11 min-w-40 rounded-full bg-background/70 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                >
                  <option value="all">전체 프로젝트</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 px-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ListFilter className="size-4" />
              <span>작업 {visibleTasks.length}개 표시</span>
            </div>
            {selectedTask ? (
              <span className="hidden truncate sm:block">
                상세 패널 열림: {selectedTask.title}
              </span>
            ) : (
              <span className="hidden sm:block">작업을 클릭하면 상세 패널이 열립니다.</span>
            )}
          </div>
        </section>

        {view === "table" ? (
          <TableView
            getLabels={getLabels}
            getProject={getProject}
            onTaskClick={openTaskDetail}
            selectedTaskId={selectedTaskId}
            tasks={visibleTasks}
          />
        ) : (
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            <KanbanView
              activeTaskId={activeTaskId}
              columns={columns}
              getLabels={getLabels}
              getProject={getProject}
              onTaskClick={openTaskDetail}
              selectedTaskId={selectedTaskId}
              tasks={visibleTasks}
            />
            <DragOverlay>
              {activeTask ? (
                <KanbanTaskCard
                  getLabels={getLabels}
                  getProject={getProject}
                  isDraggingOverlay
                  onTaskClick={() => undefined}
                  selectedTaskId={selectedTaskId}
                  task={activeTask}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <TaskDetailPanel
        activities={activities}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        onDeleteTask={(taskId) => {
          deleteTask(taskId);
          setSelectedTaskId(null);
        }}
        onUpdateTask={updateTask}
        project={selectedProject}
        task={selectedTask}
        users={users}
      />
    </>
  );
}

interface TaskViewProps {
  tasks: Task[];
  selectedTaskId: string | null;
  getProject: (task: Task) => Project | undefined;
  getLabels: (task: Task) => TaskLabel[];
  onTaskClick: (taskId: string) => void;
}

function TableView({
  getLabels,
  getProject,
  onTaskClick,
  selectedTaskId,
  tasks,
}: TaskViewProps) {
  return (
    <section className="rounded-2xl bg-card/82 p-3 shadow-xs backdrop-blur">
      <div className="space-y-2">
        {tasks.map((task) => {
          const project = getProject(task);
          const taskLabels = getLabels(task);

          return (
            <button
              key={task.id}
              type="button"
              className={cn(
                "group flex w-full flex-col gap-4 rounded-2xl bg-background/60 p-4 text-left transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-secondary/72 hover:shadow-xs md:flex-row md:items-center md:justify-between",
                selectedTaskId === task.id && "bg-secondary/78 shadow-xs ring-2 ring-ring/20",
              )}
              onClick={() => onTaskClick(task.id)}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <StatusButton status={task.status} />
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-semibold tracking-tight">{task.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: project?.color }} />
                      {project?.name ?? "프로젝트 없음"}
                    </span>
                    {taskLabels.slice(0, 1).map((label) => (
                      <span key={label.id} className="rounded-full bg-muted/70 px-2 py-0.5">
                        {label.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 pl-8 md:pl-0">
                <PriorityBadge priority={task.priority} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/65 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface KanbanViewProps extends TaskViewProps {
  activeTaskId: string | null;
  columns: BoardColumn[];
}

function KanbanView({
  activeTaskId,
  columns,
  getLabels,
  getProject,
  onTaskClick,
  selectedTaskId,
  tasks,
}: KanbanViewProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-4">
      {statusColumns.map((column) => {
        const boardColumn = columns.find((item) => item.status === column.value);
        const columnTasks = tasks
          .filter((task) => task.status === column.value)
          .sort((a, b) => a.order - b.order);

        return (
          <DroppableKanbanColumn
            key={column.value}
            activeTaskId={activeTaskId}
            columnId={boardColumn?.id ?? column.value}
            columnTasks={columnTasks}
            getLabels={getLabels}
            getProject={getProject}
            label={column.label}
            onTaskClick={onTaskClick}
            selectedTaskId={selectedTaskId}
            status={column.value}
          />
        );
      })}
    </section>
  );
}

interface DroppableKanbanColumnProps {
  activeTaskId: string | null;
  columnId: string;
  columnTasks: Task[];
  getProject: (task: Task) => Project | undefined;
  getLabels: (task: Task) => TaskLabel[];
  label: string;
  onTaskClick: (taskId: string) => void;
  selectedTaskId: string | null;
  status: VisibleStatus;
}

function DroppableKanbanColumn({
  activeTaskId,
  columnId,
  columnTasks,
  getLabels,
  getProject,
  label,
  onTaskClick,
  selectedTaskId,
  status,
}: DroppableKanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId });

  return (
    <div className="rounded-2xl bg-card/82 p-5 shadow-xs backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-1 pb-4">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-background/70">
            <StatusDot status={status} />
          </span>
          <h2 className="text-sm font-semibold tracking-tight">{label}</h2>
        </div>
        <Badge variant="outline" className="rounded-full border-0 bg-background/70 px-2.5">
          {columnTasks.length}
        </Badge>
      </div>
      <SortableContext items={columnTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "grid min-h-[420px] content-start gap-3 rounded-2xl bg-muted/28 p-3 transition-[background,box-shadow]",
            isOver && "bg-sage/16 shadow-[inset_0_0_0_1px_var(--ring)]",
          )}
        >
          {columnTasks.length > 0 ? (
            columnTasks.map((task) => (
              <SortableKanbanTaskCard
                key={task.id}
                getLabels={getLabels}
                getProject={getProject}
                isActive={activeTaskId === task.id}
                onTaskClick={onTaskClick}
                selectedTaskId={selectedTaskId}
                task={task}
              />
            ))
          ) : (
            <div className="grid min-h-32 place-items-center rounded-2xl bg-background/45 p-4 text-sm text-muted-foreground">
              여기에 작업을 놓으세요
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanTaskCardProps {
  getProject: (task: Task) => Project | undefined;
  getLabels: (task: Task) => TaskLabel[];
  isActive?: boolean;
  isDraggingOverlay?: boolean;
  onTaskClick: (taskId: string) => void;
  selectedTaskId: string | null;
  task: Task;
}

function SortableKanbanTaskCard({
  getLabels,
  getProject,
  isActive,
  onTaskClick,
  selectedTaskId,
  task,
}: KanbanTaskCardProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "outline-none transition-transform duration-200",
        isDragging && "scale-[0.98] opacity-35",
      )}
      onClick={() => onTaskClick(task.id)}
      {...attributes}
      {...listeners}
    >
      <KanbanTaskCard
        getLabels={getLabels}
        getProject={getProject}
        isActive={isActive}
        onTaskClick={() => undefined}
        selectedTaskId={selectedTaskId}
        task={task}
      />
    </div>
  );
}

function KanbanTaskCard({
  getLabels,
  getProject,
  isActive,
  isDraggingOverlay,
  onTaskClick,
  selectedTaskId,
  task,
}: KanbanTaskCardProps) {
  const project = getProject(task);
  const taskLabels = getLabels(task);

  return (
    <div
      className={cn(
        "w-full cursor-grab rounded-2xl bg-background/74 p-4 text-left shadow-xs transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-secondary/72 hover:shadow-sm active:cursor-grabbing",
        "hover:scale-[1.015]",
        selectedTaskId === task.id && "bg-secondary/78 ring-2 ring-ring/20",
        isActive && "ring-2 ring-ring/20",
        isDraggingOverlay && "scale-105 rotate-1 bg-background shadow-2xl ring-2 ring-ring/25",
      )}
      onClick={() => onTaskClick(task.id)}
    >
      <div className="flex items-start gap-2.5">
        <StatusButton status={task.status} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[13px] font-semibold leading-5 tracking-tight">{task.title}</p>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: project?.color }} />
            <span className="truncate">{project?.name ?? "프로젝트 없음"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {taskLabels.map((label) => (
          <Badge key={label.id} variant="outline" className="h-5 rounded-full border-0 bg-muted/70 text-[11px]">
            {label.name}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <PriorityBadge priority={task.priority} />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  );
}

function StatusButton({ status }: { status: TaskStatus }) {
  return (
    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-muted/70">
      <StatusDot status={status} />
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", priorityTone[priority])}>
      {priorityLabels[priority]}
    </span>
  );
}

function StatusDot({ status }: { status: TaskStatus }) {
  const tone: Record<string, string> = {
    todo: "bg-warm-beige",
    in_progress: "bg-dusty-blue",
    review: "bg-terracotta",
    done: "bg-sage",
  };

  return <span className={cn("size-2 rounded-full", tone[status] ?? "bg-warm-beige")} />;
}
