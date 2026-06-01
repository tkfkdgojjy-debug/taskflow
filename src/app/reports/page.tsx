import { ReportsPage } from "@/features/reports/reports-page";
import { mockProjects, mockTasks } from "@/data/mock-data";

export default function ReportsRoute() {
  return <ReportsPage projects={mockProjects} tasks={mockTasks} />;
}
