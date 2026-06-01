"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ActivityIcon,
  Check,
  CheckCircle2,
  MessageSquare,
  Plus,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appTransition, softSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Activity, Project, Task, TaskPriority, TaskStatus, User } from "@/types";

type EditableStatus = Extract<TaskStatus, "todo" | "in_progress" | "review" | "done">;

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

interface TaskDetailPanelProps {
  activities: Activity[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>) => void;
  project?: Project;
  task?: Task;
  users: User[];
}

const statusOptions: Array<{ label: string; value: EditableStatus }> = [
  { label: "할 일", value: "todo" },
  { label: "진행 중", value: "in_progress" },
  { label: "검토", value: "review" },
  { label: "완료", value: "done" },
];

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: "긴급", value: "urgent" },
  { label: "높음", value: "high" },
  { label: "보통", value: "medium" },
  { label: "낮음", value: "low" },
];

const priorityTone: Record<TaskPriority, string> = {
  urgent: "border-terracotta/30 bg-terracotta/20 text-[#7f5547] dark:border-terracotta/35 dark:bg-terracotta/18 dark:text-[#e0b8a8]",
  high: "border-warning/35 bg-warning/20 text-[#7c642f] dark:border-warning/35 dark:bg-warning/18 dark:text-[#ead39b]",
  medium: "border-dusty-blue/35 bg-dusty-blue/22 text-[#536779] dark:border-dusty-blue/35 dark:bg-dusty-blue/18 dark:text-[#c5d1dc]",
  low: "border-sage/35 bg-sage/20 text-[#5f735b] dark:border-sage/35 dark:bg-sage/18 dark:text-[#c9d7c5]",
};

const defaultChecklist: Record<string, ChecklistItem[]> = {
  "task-1": [
    { id: "check-1", label: "워크스페이스 소유자 모델 확인", completed: true },
    { id: "check-2", label: "작업과 프로젝트 관계 매핑", completed: false },
    { id: "check-3", label: "향후 API payload 형태 검토", completed: false },
  ],
  "task-2": [
    { id: "check-4", label: "주간 생산성 데이터 정의", completed: true },
    { id: "check-5", label: "차트 로딩 상태 준비", completed: false },
  ],
  "task-3": [
    { id: "check-6", label: "드래그 핸들 동작 문서화", completed: false },
    { id: "check-7", label: "키보드 이동 동작 정리", completed: false },
  ],
  "task-4": [
    { id: "check-8", label: "로컬 UI 상태 분리", completed: true },
    { id: "check-9", label: "서버 캐시 경계 명확화", completed: true },
  ],
};

const defaultComments: Record<string, Comment[]> = {
  "task-1": [
    {
      id: "comment-1",
      authorId: "user-2",
      body: "첫 출시 범위의 핵심 엔티티에 집중하고, 권한 예외 케이스는 다음 단계에서 다루면 좋겠습니다.",
      createdAt: "2026-05-27T10:00:00.000Z",
    },
  ],
  "task-3": [
    {
      id: "comment-2",
      authorId: "user-3",
      body: "보드 상태가 확정되면 인터랙션 노트를 추가하겠습니다.",
      createdAt: "2026-05-27T14:20:00.000Z",
    },
  ],
};

function toDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function fromDateInputValue(value: string) {
  if (!value) return undefined;
  return `${value}T09:00:00.000Z`;
}

function formatActivityTime(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TaskDetailPanel({
  activities,
  isOpen,
  onClose,
  onUpdateTask,
  project,
  task,
  users,
}: TaskDetailPanelProps) {
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>(defaultChecklist);
  const [comments, setComments] = useState<Record<string, Comment[]>>(defaultComments);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newComment, setNewComment] = useState("");

  const taskChecklist = task ? checklists[task.id] ?? [] : [];
  const taskComments = task ? comments[task.id] ?? [] : [];
  const completedChecklist = taskChecklist.filter((item) => item.completed).length;
  const checklistProgress = taskChecklist.length
    ? Math.round((completedChecklist / taskChecklist.length) * 100)
    : 0;

  const taskActivities = useMemo(() => {
    if (!task) return [];

    const mockTaskActivities = activities.filter((activity) => activity.taskId === task.id);
    const synthetic = [
      {
        id: `${task.id}-activity-status`,
        message: `현재 상태는 ${statusOptions.find((item) => item.value === task.status)?.label}입니다.`,
        createdAt: task.updatedAt,
      },
      {
        id: `${task.id}-activity-created`,
        message: "작업이 생성되어 프로젝트 보드에 추가되었습니다.",
        createdAt: task.createdAt,
      },
    ];

    return [...mockTaskActivities, ...synthetic].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [activities, task]);

  function updateTask(patch: Partial<Task>) {
    if (!task) return;
    onUpdateTask(task.id, patch);
  }

  function toggleChecklistItem(itemId: string) {
    if (!task) return;

    setChecklists((current) => ({
      ...current,
      [task.id]: (current[task.id] ?? []).map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
    }));
  }

  function addChecklistItem() {
    if (!task || !newChecklistItem.trim()) return;

    setChecklists((current) => ({
      ...current,
      [task.id]: [
        ...(current[task.id] ?? []),
        {
          id: `check-${task.id}-${Date.now()}`,
          label: newChecklistItem.trim(),
          completed: false,
        },
      ],
    }));
    setNewChecklistItem("");
  }

  function addComment() {
    if (!task || !newComment.trim()) return;

    setComments((current) => ({
      ...current,
      [task.id]: [
        ...(current[task.id] ?? []),
        {
          id: `comment-${task.id}-${Date.now()}`,
          authorId: "user-1",
          body: newComment.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setNewComment("");
  }

  return (
    <AnimatePresence>
      {isOpen && task ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
        >
          <motion.button
            type="button"
            aria-label="작업 상세 패널 닫기"
            className="absolute inset-0 bg-background/55 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={appTransition}
          />

          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[600px] flex-col bg-background shadow-2xl sm:w-[92vw] lg:w-[600px]"
            aria-label="작업 상세 패널"
            initial={{ opacity: 0.92, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0.92, x: "100%" }}
            transition={softSpring}
          >
          <>
            <header className="flex h-16 shrink-0 items-center justify-between px-8">
              <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: project?.color }} />
                <span className="truncate">{project?.name ?? "프로젝트 없음"}</span>
              </div>
              <Button type="button" variant="ghost" size="icon" className="size-9" aria-label="패널 닫기" onClick={onClose}>
                <X />
              </Button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-10">
              <section className="pt-6">
                <label className="block">
                  <span className="sr-only">작업 제목</span>
                  <input
                    value={task.title}
                    onChange={(event) => updateTask({ title: event.target.value })}
                    className="w-full border-0 bg-transparent px-0 py-2 text-3xl font-semibold leading-tight tracking-tight outline-none focus:ring-0"
                  />
                </label>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-muted-foreground">상태</span>
                    <div className="relative">
                      <select
                        value={task.status}
                        onChange={(event) => updateTask({ status: event.target.value as EditableStatus })}
                        className="h-10 w-full rounded-full bg-muted/60 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-muted-foreground">우선순위</span>
                    <select
                      value={task.priority}
                      onChange={(event) => updateTask({ priority: event.target.value as TaskPriority })}
                      className={cn("h-10 w-full rounded-full px-4 text-sm capitalize outline-none focus:shadow-[var(--shadow-focus)]", priorityTone[task.priority])}
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-muted-foreground">마감일</span>
                    <input
                      type="date"
                      value={toDateInputValue(task.dueDate)}
                      onChange={(event) => updateTask({ dueDate: fromDateInputValue(event.target.value) })}
                      className="h-10 w-full rounded-full bg-muted/60 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                    />
                  </label>
                </div>
              </section>

              <section className="mt-10 space-y-10">
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground">설명</h2>
                  <textarea
                    value={task.description ?? ""}
                    onChange={(event) => updateTask({ description: event.target.value })}
                    rows={5}
                    className="mt-3 w-full resize-none border-0 bg-transparent px-0 text-base leading-8 outline-none placeholder:text-muted-foreground/70"
                    placeholder="맥락, 요구사항, 완료 기준을 적어주세요."
                  />
                </section>

                <section>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-muted-foreground">체크리스트</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {taskChecklist.length}개 중 {completedChecklist}개 완료
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full">
                      {checklistProgress}%
                    </Badge>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${checklistProgress}%` }} />
                  </div>
                  <div className="mt-5 space-y-1">
                    {taskChecklist.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-start gap-3 rounded-lg py-2 text-left transition-colors hover:bg-secondary/55"
                        onClick={() => toggleChecklistItem(item.id)}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-muted-foreground/30",
                            item.completed && "border-primary bg-primary text-primary-foreground",
                          )}
                        >
                          {item.completed ? <Check className="size-3" /> : null}
                        </span>
                        <span
                          className={cn(
                            "text-sm leading-5",
                            item.completed && "text-muted-foreground line-through",
                          )}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input
                      value={newChecklistItem}
                      onChange={(event) => setNewChecklistItem(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") addChecklistItem();
                      }}
                      placeholder="체크리스트 항목 추가"
                      className="h-10 min-w-0 flex-1 rounded-full bg-muted/50 px-4 text-sm outline-none focus:shadow-[var(--shadow-focus)]"
                    />
                    <Button type="button" size="icon" variant="ghost" aria-label="체크리스트 항목 추가" onClick={addChecklistItem}>
                      <Plus />
                    </Button>
                  </div>
                </section>
              </section>

              <section className="mt-12 space-y-10 border-t pt-8">
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-muted-foreground">댓글</h2>
                  </div>
                  <div className="space-y-5">
                    {taskComments.map((comment) => {
                      const author = users.find((user) => user.id === comment.authorId);

                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar name={author?.name ?? "사용자"} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{author?.name ?? "사용자"}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatActivityTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.body}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-3">
                      <Avatar name={users[0]?.name ?? "Me"} />
                      <div className="flex min-w-0 flex-1 gap-2 rounded-2xl bg-muted/45 p-2">
                        <input
                          value={newComment}
                          onChange={(event) => setNewComment(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") addComment();
                          }}
                          placeholder="댓글을 작성하세요..."
                          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                        />
                        <Button type="button" size="icon" aria-label="댓글 보내기" onClick={addComment}>
                          <Send />
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <ActivityIcon className="size-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-muted-foreground">활동 로그</h2>
                  </div>
                  <div className="space-y-5">
                    {taskActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-muted/55">
                          <CheckCircle2 className="size-3.5 text-muted-foreground" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm leading-5">{activity.message}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatActivityTime(activity.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </section>
            </div>
          </>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">
      {getInitials(name)}
    </span>
  );
}
