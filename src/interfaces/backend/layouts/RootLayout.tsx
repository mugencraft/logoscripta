import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect, useState } from "react";

import { Header } from "@/ui/components/layout/Header";
import { MainContent } from "@/ui/components/layout/Main";
import { LayoutContext } from "@/ui/hooks/useLayout";

import { navigation } from "../navigation";

export default function RootLayout() {
  const isDev = process.env.NODE_ENV === "development";

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean | null>(
    null,
  );
  const [headerContent, setHeaderContent] = useState<React.ReactNode | null>();
  const [headerButtons, setHeaderButtons] = useState<React.ReactNode | null>();

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar-collapsed");
      const initialValue = stored !== null ? JSON.parse(stored) : true;
      setIsSidebarCollapsed(initialValue);
    } catch (error) {
      console.warn("Failed to load sidebar state from localStorage:", error);
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Function that updates state and localStorage
  const setSidebarCollapsed = (value: boolean) => {
    setIsSidebarCollapsed(value);
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(value));
    } catch (error) {
      console.warn("Failed to save sidebar state to localStorage:", error);
    }
  };

  // Don't render until initial state is set
  if (isSidebarCollapsed === null) return null;

  return (
    <LayoutContext.Provider
      value={{
        isSidebarCollapsed,
        headerContent,
        headerButtons,
        setHeaderButtons,
        setHeaderContent,
        setSidebarCollapsed,
      }}
    >
      <div className="flex h-screen flex-col">
        <Header />
        <MainContent navigation={navigation} />
        {isDev && <TanStackRouterDevtools />}
      </div>
    </LayoutContext.Provider>
  );
}
