import { Link } from "@tanstack/react-router";

import { HeaderSideButtons } from "@/ui/components/layout/HeaderSideButtons";
import { useLayout } from "@/ui/hooks/useLayout";

export const Header = () => {
  const { headerContent } = useLayout();

  return (
    <header className="transition-all duration-300 ease-in-out border-b h-12 bg-muted">
      <div className="flex justify-between items-center h-full px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-bold transition-all duration-300 text-lg">
            <Link to="/">Dashboard</Link>
          </h1>

          <div className="transition-opacity duration-300">{headerContent}</div>
        </div>

        <HeaderSideButtons />
      </div>
    </header>
  );
};
