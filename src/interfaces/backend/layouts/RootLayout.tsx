import { Header } from "@/ui/components/layout/Header";
import { MainContent } from "@/ui/components/layout/Main";
import { LayoutContext } from "@/ui/components/layout/useLayout";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";

export default function RootLayout() {
	const isDev = process.env.NODE_ENV === "development";

	const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean | null>(
		null,
	);
	const [headerContent, setHeaderContent] = useState<React.ReactNode | null>();
	const [headerButtons, setHeaderButtons] = useState<React.ReactNode | null>();

	useEffect(() => {
		setSidebarCollapsed(true);
	}, []);

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
				<MainContent />
				{isDev && <TanStackRouterDevtools />}
			</div>
		</LayoutContext.Provider>
	);
}
