import { TasksPageClient } from "@/features/tasks/tasks-page-client";
import { mockActivities, mockLabels, mockUsers } from "@/data/mock-data";

export default function TasksPage() {
  return (
    <TasksPageClient
      activities={mockActivities}
      labels={mockLabels}
      users={mockUsers}
    />
  );
}
