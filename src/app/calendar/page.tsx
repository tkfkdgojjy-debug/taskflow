import { CalendarPageClient } from "@/features/calendar/calendar-page-client";
import { mockProjects, mockTasks } from "@/data/mock-data";

export default function CalendarRoute() {
  return <CalendarPageClient projects={mockProjects} tasks={mockTasks} />;
}
