import type { ProjectCategory } from "@/types";

export const defaultClientName = "내부";

export const projectCategoryOptions: Array<{
  color: string;
  description: string;
  label: string;
  value: ProjectCategory;
}> = [
  {
    value: "fixed",
    label: "고정업무",
    description: "반복적으로 관리해야 하는 상시 업무입니다.",
    color: "#A8BBA3",
  },
  {
    value: "settlement",
    label: "정산",
    description: "비용, 매출, 청구와 관련된 정산 업무입니다.",
    color: "#D8CBB8",
  },
  {
    value: "planning",
    label: "기획",
    description: "아이디어, 문서화, 실행 계획을 정리하는 업무입니다.",
    color: "#B9A7C9",
  },
  {
    value: "meeting",
    label: "미팅",
    description: "회의 준비, 아젠다, 후속 조치를 관리하는 업무입니다.",
    color: "#A9B9C9",
  },
  {
    value: "monitoring",
    label: "모니터링",
    description: "운영 상태, 이슈, 지표를 확인하는 업무입니다.",
    color: "#BFC8A5",
  },
  {
    value: "mail",
    label: "메일",
    description: "메일 확인, 회신, 팔로업을 정리하는 업무입니다.",
    color: "#C89B87",
  },
  {
    value: "other",
    label: "기타",
    description: "정해진 분류에 속하지 않는 업무입니다.",
    color: "#AAB7C7",
  },
];

export function getProjectCategoryLabel(category?: ProjectCategory) {
  return projectCategoryOptions.find((option) => option.value === category)?.label ?? "기타";
}

export function getProjectCategoryColor(category?: ProjectCategory) {
  return projectCategoryOptions.find((option) => option.value === category)?.color ?? "#AAB7C7";
}

export function getProjectCategoryDescription(category?: ProjectCategory) {
  return projectCategoryOptions.find((option) => option.value === category)?.description ?? "업무 설명을 추가하세요.";
}
