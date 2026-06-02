import type {
  Activity,
  BoardColumn,
  BurndownPoint,
  DashboardMetric,
  Project,
  Task,
  TaskLabel,
  User,
  Workspace,
} from "@/types";
import { projectCategoryOptions } from "@/constants/project-categories";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "정주영",
    email: "owner@example.com",
    role: "owner",
  },
  {
    id: "user-2",
    name: "프로덕트 리드",
    email: "product@example.com",
    role: "admin",
  },
  {
    id: "user-3",
    name: "프론트엔드 엔지니어",
    email: "frontend@example.com",
    role: "member",
  },
];

export const mockWorkspaces: Workspace[] = [
  {
    id: "workspace-1",
    name: "데일리 워크스페이스",
    slug: "acme-operations",
    ownerId: "user-1",
    memberIds: ["user-1", "user-2", "user-3"],
    createdAt: "2026-05-01T09:00:00.000Z",
  },
];

export const mockProjects: Project[] = projectCategoryOptions.map((category, index) => ({
  id: `project-${index + 1}`,
  workspaceId: "workspace-1",
  name: category.label,
  description: category.description,
  category: category.value,
  clientName: "내부",
  status: index === 0 ? "active" : "planning",
  color: category.color,
  dueDate: "2026-06-30T09:00:00.000Z",
  createdAt: "2026-05-01T09:00:00.000Z",
  updatedAt: "2026-05-20T09:00:00.000Z",
}));

export const mockColumns: BoardColumn[] = [
  { id: "column-backlog", projectId: "project-1", title: "백로그", status: "backlog", order: 0 },
  { id: "column-todo", projectId: "project-1", title: "할 일", status: "todo", order: 1 },
  { id: "column-progress", projectId: "project-1", title: "진행 중", status: "in_progress", order: 2 },
  { id: "column-review", projectId: "project-1", title: "검토", status: "review", order: 3 },
  { id: "column-done", projectId: "project-1", title: "완료", status: "done", order: 4 },
];

export const mockLabels: TaskLabel[] = [
  { id: "label-design", name: "디자인", color: "#C89B87" },
  { id: "label-engineering", name: "개발", color: "#A9B9C9" },
  { id: "label-research", name: "리서치", color: "#D8CBB8" },
  { id: "label-ops", name: "운영", color: "#A8BBA3" },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    columnId: "column-todo",
    title: "워크스페이스와 프로젝트 모델 정의",
    description: "API 연동 전에 핵심 데이터 구조와 관계를 확정합니다.",
    status: "todo",
    priority: "high",
    assigneeIds: ["user-1", "user-2"],
    labelIds: ["label-research", "label-engineering"],
    dueDate: "2026-06-03T09:00:00.000Z",
    estimateHours: 5,
    order: 0,
    createdBy: "user-1",
    createdAt: "2026-05-20T09:00:00.000Z",
    updatedAt: "2026-05-21T09:00:00.000Z",
  },
  {
    id: "task-2",
    workspaceId: "workspace-1",
    projectId: "project-1",
    columnId: "column-progress",
    title: "대시보드 차트 데이터 구조 준비",
    description: "요약 화면에서 사용할 생산성 지표와 차트 데이터를 정리합니다.",
    status: "in_progress",
    priority: "medium",
    assigneeIds: ["user-3"],
    labelIds: ["label-engineering"],
    dueDate: "2026-06-05T09:00:00.000Z",
    estimateHours: 4,
    order: 0,
    createdBy: "user-2",
    createdAt: "2026-05-22T09:00:00.000Z",
    updatedAt: "2026-05-25T09:00:00.000Z",
  },
  {
    id: "task-3",
    workspaceId: "workspace-1",
    projectId: "project-1",
    columnId: "column-review",
    title: "보드 드래그 인터랙션 요구사항 검토",
    description: "카드 정렬과 컬럼 이동 동작을 문서화합니다.",
    status: "review",
    priority: "medium",
    assigneeIds: ["user-2"],
    labelIds: ["label-design", "label-engineering"],
    dueDate: "2026-06-07T09:00:00.000Z",
    estimateHours: 3,
    order: 0,
    createdBy: "user-1",
    createdAt: "2026-05-23T09:00:00.000Z",
    updatedAt: "2026-05-26T09:00:00.000Z",
  },
  {
    id: "task-4",
    workspaceId: "workspace-1",
    projectId: "project-1",
    columnId: "column-done",
    title: "프론트엔드 상태 관리 경계 정리",
    description: "서버 캐시와 보드 인터랙션 상태를 분리합니다.",
    status: "done",
    priority: "urgent",
    assigneeIds: ["user-1"],
    labelIds: ["label-ops"],
    dueDate: "2026-05-28T09:00:00.000Z",
    estimateHours: 2,
    order: 0,
    createdBy: "user-1",
    createdAt: "2026-05-18T09:00:00.000Z",
    updatedAt: "2026-05-28T09:00:00.000Z",
    completedAt: "2026-05-28T09:00:00.000Z",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "activity-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    taskId: "task-4",
    actorId: "user-1",
    action: "completed_task",
    message: "프론트엔드 상태 관리 경계 정리를 완료했습니다.",
    createdAt: "2026-05-28T09:30:00.000Z",
  },
  {
    id: "activity-2",
    workspaceId: "workspace-1",
    projectId: "project-1",
    taskId: "task-3",
    actorId: "user-2",
    action: "moved_task",
    message: "보드 인터랙션 검토 작업을 검토 단계로 이동했습니다.",
    createdAt: "2026-05-26T13:10:00.000Z",
  },
];

export const mockDashboardMetrics: DashboardMetric[] = [
  { label: "열린 작업", value: 3, delta: 12 },
  { label: "완료", value: 1, delta: 25 },
  { label: "이번 주 마감", value: 3, delta: -8 },
  { label: "평균 처리일", value: 2, delta: -15 },
];

export const mockBurndownData: BurndownPoint[] = [
  { date: "2026-05-24", completed: 0, remaining: 4 },
  { date: "2026-05-25", completed: 0, remaining: 4 },
  { date: "2026-05-26", completed: 0, remaining: 4 },
  { date: "2026-05-27", completed: 0, remaining: 4 },
  { date: "2026-05-28", completed: 1, remaining: 3 },
];
