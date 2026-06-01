import { ProjectsPage } from "@/features/projects/projects-page";
import { mockProjects, mockTasks } from "@/data/mock-data";

export default function ProjectsRoute() {
  return <ProjectsPage projects={mockProjects} tasks={mockTasks} />;
}
