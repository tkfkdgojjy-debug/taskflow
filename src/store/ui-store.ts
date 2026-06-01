import { create } from "zustand";
import type { ID } from "@/types";

type SidebarState = "expanded" | "collapsed";
type ThemeMode = "light" | "dark" | "system";

interface UIState {
  sidebarState: SidebarState;
  themeMode: ThemeMode;
  activeTaskId?: ID;
  isCreateTaskOpen: boolean;
  setSidebarState: (sidebarState: SidebarState) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setActiveTask: (taskId?: ID) => void;
  setCreateTaskOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarState: "expanded",
  themeMode: "system",
  activeTaskId: undefined,
  isCreateTaskOpen: false,
  setSidebarState: (sidebarState) => set({ sidebarState }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setActiveTask: (activeTaskId) => set({ activeTaskId }),
  setCreateTaskOpen: (isCreateTaskOpen) => set({ isCreateTaskOpen }),
}));
