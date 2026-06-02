export type ID = string;
export type ISODateString = string;

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type ProjectCategory = "fixed" | "settlement" | "planning" | "meeting" | "monitoring" | "mail" | "other";
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed";
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  role: WorkspaceRole;
}

export interface Workspace {
  id: ID;
  name: string;
  slug: string;
  ownerId: ID;
  memberIds: ID[];
  createdAt: ISODateString;
}

export interface Project {
  id: ID;
  workspaceId: ID;
  name: string;
  description: string;
  category?: ProjectCategory;
  clientName?: string;
  status: ProjectStatus;
  color: string;
  dueDate?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface BoardColumn {
  id: ID;
  projectId: ID;
  title: string;
  status: TaskStatus;
  order: number;
}

export interface TaskLabel {
  id: ID;
  name: string;
  color: string;
}

export interface TaskComment {
  id: ID;
  taskId: ID;
  authorId: ID;
  body: string;
  createdAt: ISODateString;
}

export interface TaskAttachment {
  id: ID;
  taskId: ID;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: ID;
  createdAt: ISODateString;
}

export interface Task {
  id: ID;
  workspaceId: ID;
  projectId: ID;
  columnId: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: ID[];
  labelIds: ID[];
  dueDate?: ISODateString;
  estimateHours?: number;
  order: number;
  createdBy: ID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  completedAt?: ISODateString;
}

export interface Activity {
  id: ID;
  workspaceId: ID;
  projectId?: ID;
  taskId?: ID;
  actorId: ID;
  action: string;
  message: string;
  createdAt: ISODateString;
}

export interface DashboardMetric {
  label: string;
  value: number;
  delta: number;
}

export interface BurndownPoint {
  date: string;
  completed: number;
  remaining: number;
}

export interface TaskFilters {
  query: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assigneeId: ID | "all";
  labelId: ID | "all";
}
