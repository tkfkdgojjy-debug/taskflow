import { GoalsPage } from "@/features/goals/goals-page";
import { mockProjects, mockTasks } from "@/data/mock-data";

export default function GoalsRoute() {
  return <GoalsPage projects={mockProjects} tasks={mockTasks} />;
}
