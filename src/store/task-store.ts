import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { defaultClientName, getProjectCategoryColor } from "@/constants/project-categories";
import { mockColumns, mockGoals, mockProjects, mockTasks, mockWorkspaces } from "@/data/mock-data";
import type {
  BoardColumn,
  GoalItem,
  ID,
  Project,
  ProjectCategory,
  Task,
  TaskFilters,
  TaskStatus,
  Workspace,
} from "@/types";

interface CreateTaskInput {
  title: string;
  projectId: ID;
  columnId?: ID;
  createdBy: ID;
  description?: string;
  priority?: Task["priority"];
  assigneeIds?: ID[];
  labelIds?: ID[];
  dueDate?: string;
  estimateHours?: number;
}

interface CreateProjectInput {
  name: string;
  description: string;
  category?: ProjectCategory;
  clientName?: string;
  color?: string;
  dueDate?: string;
  status?: Project["status"];
}

interface CreateGoalInput {
  projectId: ID;
  title: string;
  description: string;
  target: number;
}

interface MoveTaskInput {
  taskId: ID;
  targetColumnId: ID;
  targetIndex: number;
}

export interface TaskStoreSnapshot {
  workspaces: Workspace[];
  projects: Project[];
  goals: GoalItem[];
  columns: BoardColumn[];
  tasks: Task[];
  selectedWorkspaceId: ID;
  selectedProjectId: ID;
}

interface TaskState {
  workspaces: Workspace[];
  projects: Project[];
  goals: GoalItem[];
  columns: BoardColumn[];
  tasks: Task[];
  selectedWorkspaceId: ID;
  selectedProjectId: ID;
  filters: TaskFilters;
  setSelectedWorkspace: (workspaceId: ID) => void;
  setSelectedProject: (projectId: ID) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  hydrateFromSnapshot: (snapshot: Partial<TaskStoreSnapshot>) => void;
  clearTasks: () => void;
  createProject: (input: CreateProjectInput) => Project;
  createGoal: (input: CreateGoalInput) => GoalItem;
  deleteGoal: (goalId: ID) => void;
  createTask: (input: CreateTaskInput) => Task;
  deleteProject: (projectId: ID) => void;
  updateGoal: (goalId: ID, patch: Partial<GoalItem>) => void;
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

function withDefaultProjects(projects: Project[]) {
  const existingProjectIds = new Set(projects.map((project) => project.id));
  const missingDefaultProjects = mockProjects
    .filter(
      (defaultProject) =>
        !projects.some(
          (project) =>
            project.category === defaultProject.category &&
            (project.clientName ?? defaultClientName) === (defaultProject.clientName ?? defaultClientName),
        ),
    )
    .map((project) =>
      existingProjectIds.has(project.id)
        ? { ...project, id: `${project.id}-${project.category ?? "default"}` }
        : project,
    );

  return [...projects, ...missingDefaultProjects];
}

export function getTaskStoreSnapshot(state: TaskState): TaskStoreSnapshot {
  return {
    workspaces: state.workspaces,
    projects: state.projects,
    goals: state.goals,
    columns: state.columns,
    tasks: state.tasks,
    selectedWorkspaceId: state.selectedWorkspaceId,
    selectedProjectId: state.selectedProjectId,
  };
}

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        workspaces: mockWorkspaces,
        projects: mockProjects,
        goals: mockGoals,
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
        hydrateFromSnapshot: (snapshot) =>
          set((state) => ({
            workspaces: snapshot.workspaces ?? state.workspaces,
            projects: withDefaultProjects(snapshot.projects ?? state.projects),
            goals: snapshot.goals ?? state.goals,
            columns: snapshot.columns ?? state.columns,
            tasks: snapshot.tasks ?? state.tasks,
            selectedWorkspaceId: snapshot.selectedWorkspaceId ?? state.selectedWorkspaceId,
            selectedProjectId: snapshot.selectedProjectId ?? state.selectedProjectId,
          })),
        clearTasks: () => set({ tasks: [] }),
        createGoal: (input) => {
          const now = new Date().toISOString();
          const project = get().projects.find((item) => item.id === input.projectId);
          const goal: GoalItem = {
            id: crypto.randomUUID(),
            workspaceId: project?.workspaceId ?? get().selectedWorkspaceId,
            projectId: input.projectId,
            title: input.title,
            description: input.description,
            target: Math.max(1, Math.round(input.target)),
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({ goals: [...state.goals, goal] }));
          return goal;
        },
        createProject: (input) => {
          const now = new Date().toISOString();
          const project: Project = {
            id: crypto.randomUUID(),
            workspaceId: get().selectedWorkspaceId,
            name: input.name,
            description: input.description,
            category: input.category ?? "other",
            clientName: input.clientName?.trim() || defaultClientName,
            status: input.status ?? "active",
            color: input.color ?? getProjectCategoryColor(input.category),
            dueDate: input.dueDate,
            createdAt: now,
            updatedAt: now,
          };

          set((state) => ({
            projects: [...state.projects, project],
            selectedProjectId: project.id,
          }));
          return project;
        },
        deleteGoal: (goalId) =>
          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== goalId),
          })),
        createTask: (input) => {
          const now = new Date().toISOString();
          const columnId = input.columnId ?? columnFromStatus(get().columns, "todo") ?? get().columns[0]?.id ?? "";
          const columnTasks = get().tasks.filter((task) => task.columnId === columnId);
          const project = get().projects.find((item) => item.id === input.projectId);
          const task: Task = {
            id: crypto.randomUUID(),
            workspaceId: project?.workspaceId ?? get().selectedWorkspaceId,
            projectId: input.projectId,
            columnId,
            title: input.title,
            description: input.description,
            status: statusFromColumn(get().columns, columnId),
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
        deleteProject: (projectId) =>
          set((state) => {
            const nextProjects = state.projects.filter((project) => project.id !== projectId);
            const nextSelectedProjectId =
              state.selectedProjectId === projectId
                ? nextProjects[0]?.id ?? ""
                : state.selectedProjectId;

            return {
              projects: nextProjects,
              goals: state.goals.filter((goal) => goal.projectId !== projectId),
              selectedProjectId: nextSelectedProjectId,
              tasks: state.tasks.filter((task) => task.projectId !== projectId),
            };
          }),
        updateGoal: (goalId, patch) =>
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    ...patch,
                    target: patch.target ? Math.max(1, Math.round(patch.target)) : goal.target,
                    updatedAt: new Date().toISOString(),
                  }
                : goal,
            ),
          })),
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
        merge: (persisted, current) => {
          const persistedState = (persisted ?? {}) as Partial<TaskState>;
          const persistedProjects = persistedState.projects ?? current.projects;
          const persistedGoals = persistedState.goals ?? current.goals;

          return {
            ...current,
            ...persistedState,
            projects: withDefaultProjects(persistedProjects),
            goals: persistedGoals,
          };
        },
        partialize: (state) => ({
          projects: state.projects,
          goals: state.goals,
          tasks: state.tasks,
          selectedWorkspaceId: state.selectedWorkspaceId,
          selectedProjectId: state.selectedProjectId,
        }),
      },
    ),
    { name: "task-store" },
  ),
);
