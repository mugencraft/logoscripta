import { createContext, useContext } from "react";

export const LayoutContext = createContext({
	isSidebarCollapsed: true,
	headerContent: null as React.ReactNode | null,
	headerButtons: null as React.ReactNode | null,
	setHeaderButtons: (content: React.ReactNode) => {},
	setHeaderContent: (content: React.ReactNode) => {},
	setSidebarCollapsed: (value: boolean) => {},
});

// Custom hook to access layout state
export const useLayout = () => useContext(LayoutContext);
