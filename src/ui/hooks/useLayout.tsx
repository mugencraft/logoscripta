import { createContext, type ReactNode, useContext } from "react";

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  headerContent: ReactNode | null;
  headerButtons: ReactNode | null;
  setHeaderButtons: (content: ReactNode) => void;
  setHeaderContent: (content: ReactNode) => void;
  setSidebarCollapsed: (value: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  isSidebarCollapsed: true,
  headerContent: null,
  headerButtons: null,
  setHeaderButtons: () => {},
  setHeaderContent: () => {},
  setSidebarCollapsed: () => {},
});

export const useLayout = () => useContext(LayoutContext);
