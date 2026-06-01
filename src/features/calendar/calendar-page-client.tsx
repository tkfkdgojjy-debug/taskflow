"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Project, Task } from "@/types";

interface CalendarPageClientProps {
  projects: Project[];
  tasks: Task[];
}

const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function taskDateKey(task: Task) {
  return task.dueDate?.slice(0, 10);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(value);
}

function buildMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function CalendarPageClient({ projects, tasks }: CalendarPageClientProps) {
  const initialDate = new Date("2026-06-03T09:00:00.000Z");
  const [visibleMonth, setVisibleMonth] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);
  const selectedKey = toDateKey(selectedDate);
  const tasksByDate = useMemo(() => {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
      const key = taskDateKey(task);
      if (!key) return acc;

      acc[key] = [...(acc[key] ?? []), task];
      return acc;
    }, {});
  }, [tasks]);

  const selectedTasks = tasksByDate[selectedKey] ?? [];
  const deadlineCount = tasks.filter((task) => task.dueDate).length;

  function getProject(task: Task) {
    return projects.find((project) => project.id === task.projectId);
  }

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <section className="flex flex-col gap-5 pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="outline" className="mb-4 border-0 bg-card/70 px-3 py-1 shadow-xs">
            캘린더
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">캘린더</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            하루의 흐름을 방해하지 않는 차분한 월간 마감 일정입니다.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-card/72 p-1 shadow-xs">
          <Button type="button" variant="ghost" size="icon" className="size-9" aria-label="이전 달" onClick={() => moveMonth(-1)}>
            <ChevronLeft />
          </Button>
          <div className="min-w-40 px-3 text-center text-sm font-semibold">
            {formatMonth(visibleMonth)}
          </div>
          <Button type="button" variant="ghost" size="icon" className="size-9" aria-label="다음 달" onClick={() => moveMonth(1)}>
            <ChevronRight />
          </Button>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-card/82 p-5 shadow-xs backdrop-blur">
          <div className="grid grid-cols-7 px-1 pb-3 text-xs font-medium text-muted-foreground">
            {weekDays.map((day) => (
              <div key={day} className="py-2 text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((date) => {
              const dateKey = toDateKey(date);
              const dayTasks = tasksByDate[dateKey] ?? [];
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = dateKey === selectedKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  aria-label={`${formatDate(date)} 선택`}
                  className={cn(
                    "min-h-28 rounded-2xl p-3 text-left transition-[background,box-shadow,transform] hover:-translate-y-0.5 hover:bg-secondary/68 hover:shadow-xs",
                    !isCurrentMonth && "text-muted-foreground/42",
                    isSelected && "bg-secondary/78 shadow-xs ring-2 ring-ring/20",
                  )}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("grid size-8 place-items-center rounded-full text-sm font-medium", isSelected && "bg-primary/82 text-primary-foreground")}>
                      {date.getDate()}
                    </span>
                    {dayTasks.length > 0 ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {dayTasks.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {dayTasks.slice(0, 1).map((task) => {
                      const project = getProject(task);

                      return (
                        <div key={task.id} className="truncate rounded-full bg-muted/72 px-2.5 py-1 text-[11px]">
                          <span className="mr-1 inline-block size-1.5 rounded-full" style={{ backgroundColor: project?.color }} />
                          {task.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 1 ? (
                      <div className="px-2 text-[11px] text-muted-foreground">외 {dayTasks.length - 1}개</div>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-card/82 p-6 shadow-xs backdrop-blur">
            <div>
              <p className="text-sm font-medium text-muted-foreground">선택한 날짜</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{formatDate(selectedDate)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">선택된 마감 {selectedTasks.length}개</p>
            </div>
          </section>

          <section className="rounded-2xl bg-card/82 p-5 shadow-xs backdrop-blur">
            <div>
              <h2 className="text-sm font-semibold">마감 일정</h2>
              <p className="mt-1 text-xs text-muted-foreground">목 데이터에 마감 {deadlineCount}개</p>
            </div>
            <div className="mt-5 space-y-3">
              {selectedTasks.length > 0 ? (
                selectedTasks.map((task) => {
                  const project = getProject(task);

                  return (
                    <article key={task.id} className="rounded-2xl bg-secondary/58 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-medium">{task.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{project?.name ?? "프로젝트 없음"}</p>
                        </div>
                        <Badge variant="outline" className="rounded-full border-0 bg-muted/70 capitalize">
                          {task.priority === "urgent" ? "긴급" : task.priority === "high" ? "높음" : task.priority === "medium" ? "보통" : "낮음"}
                        </Badge>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="size-3.5" />
                        예상 {task.estimateHours ?? 0}시간
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="grid min-h-40 place-items-center rounded-2xl bg-secondary/45 p-6 text-center text-sm text-muted-foreground">
                  이 날짜에는 마감 작업이 없습니다.
                </div>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
