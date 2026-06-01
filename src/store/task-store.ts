import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { mockColumns, mockProjects, mockTasks, mockWorkspaces } from "@/data/mock-data";
import type { BoardColumn, ID, Project, Task, TaskFilters, TaskStatus, Workspace } from "@/types";

interface CreateTaskInput {
  title: string;
  projectId: ID;
  columnId: ID;
  createdBy: ID;
  description?: string;
  priority?: Task["priority"];
  assigneeIds?: ID[];
  labelIds?: ID[];
  dueDate?: string;
  estimateHours?: number;
}

interface MoveTaskInput {
  taskId: ID;
  targetColumnId: ID;
  targetIndex: number;
}

interface TaskState {
  workspaces: Workspace[];
  projects: Project[];
  columns: BoardColumn[];
  tasks: Task[];
  selectedWorkspaceId: ID;
  selectedProjectId: ID;
  filters: TaskFilters;
  setSelectedWorkspace: (workspaceId: ID) => void;
  setSelectedProject: (projectId: ID) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  clearTasks: () => void;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (taskId: ID, patch: Partial<Task>) => void;
  deleteTask: (taskId: ID) => void;
  moveTask: (input: MoveTaskInput) => void;
}

const defaultFilters: TaskFilters = {
  query: "",
  status: "all",
  priority: "all",
  assigneeId: "all",
  labelId: "all",
};

function statusFromColumn(columns: BoardColumn[], columnId: ID): TaskStatus {
  return columns.find((column) => column.id === columnId)?.status ?? "todo";
}

function columnFromStatus(columns: BoardColumn[], status: TaskStatus): ID | undefined {
  return columns.find((column) => column.status === status)?.id;
}

function reorderTasks(tasks: Task[], columnId: ID): Task[] {
  const columnTasks = tasks
    .filter((task) => task.columnId === columnId)
    .sort((a, b) => a.order - b.order);

  return tasks.map((task) => {
    const order = columnTasks.findIndex((item) => item.id === task.id);
    return order >= 0 ? { ...task, order } : task;
  });
}

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        workspaces: mockWorkspaces,
        projects: mockProjects,
        columns: mockColumns,
        tasks: mockTasks,
        selectedWorkspaceId: mockWorkspaces[0]?.id ?? "",
        selectedProjectId: mockProjects[0]?.id ?? "",
        filters: defaultFilters,
        setSelectedWorkspace: (workspaceId) => {
          const nextProject = get().projects.find((project) => project.workspaceId === workspaceId);
          set({
            selectedWorkspaceId: workspaceId,
            selectedProjectId: nextProject?.id ?? "",
          });
        },
        setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),
        setFilters: (filters) =>
          set((state) => ({
            filters: {
              ...state.filters,
              ...filters,
            },
          })),
        resetFilters: () => set({ filters: defaultFilters }),
        clearTasks: () => set({ tasks: [] }),
        createTask: (input) => {
          const now = new Date().toISOString();
          const columnTasks = get().tasks.filter((task) => task.columnId === input.columnId);
          const project = get().projects.find((item) => item.id === input.projectId);
          const task: Task = {
            id: crypto.randomUUID(),
            workspaceId: project?.workspaceId ?? get().selectedWorkspaceId,
            projectId: input.projectId,
            columnId: input.columnId,
            title: input.title,
            description: input.description,
            status: statusFromColumn(get().columns, input.columnId),
            priority: input.priority ?? "medium",
            assigneeIds: input.assigneeIds ?? [],
            labelIds: input.labelIds ?? [],
            dueDate: input.dueDate,
            estimateHours: input.estimateHours,
            order: columnTasks.length,
            createdBy: input.createdBy,
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({ tasks: [...state.tasks, task] }));
          return task;
        },
        updateTask: (taskId, patch) =>
          set((state) => ({
            tasks: state.tasks.map((task) => {
              if (task.id !== taskId) return task;

              const nextColumnId = patch.status
                ? columnFromStatus(state.columns, patch.status) ?? task.columnId
                : task.columnId;

              return {
                ...task,
                ...patch,
                columnId: nextColumnId,
                updatedAt: new Date().toISOString(),
              };
            }),
          })),
        deleteTask: (taskId) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== taskId),
          })),
        moveTask: ({ taskId, targetColumnId, targetIndex }) =>
          set((state) => {
            const movingTask = state.tasks.find((task) => task.id === taskId);
            if (!movingTask) return state;

            const sourceColumnId = movingTask.columnId;
            const targetStatus = statusFromColumn(state.columns, targetColumnId);
            const otherTasks = state.tasks.filter((task) => task.id !== taskId);
            const targetTasks = otherTasks
              .filter((task) => task.columnId === targetColumnId)
              .sort((a, b) => a.order - b.order);

            const boundedIndex = Math.max(0, Math.min(targetIndex, targetTasks.length));
            targetTasks.splice(boundedIndex, 0, {
              ...movingTask,
              columnId: targetColumnId,
              status: targetStatus,
              updatedAt: new Date().toISOString(),
            });

            const mergedTasks = otherTasks
              .filter((task) => task.columnId !== targetColumnId)
              .concat(targetTasks.map((task, index) => ({ ...task, order: index })));

            return {
              tasks:
                sourceColumnId === targetColumnId
                  ? mergedTasks
                  : reorderTasks(mergedTasks, sourceColumnId),
            };
          }),
      }),
      {
        name: "task-management-store-ko",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          tasks: state.tasks,
          selectedWorkspaceId: state.selectedWorkspaceId,
          selectedProjectId: state.selectedProjectId,
        }),
      },
    ),
    { name: "task-store" },
  ),
);
