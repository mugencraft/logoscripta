import { Button } from "@/ui/components/core/button";
import type { LucideIcon } from "lucide-react";

interface IconTooltipProps {
	icon: LucideIcon;
	label: string;
}

export const IconTooltip = ({ icon: Icon, label }: IconTooltipProps) => (
	<Button
		size="icon"
		variant="transparent"
		title={label}
		className="cursor-pointer"
	>
		<Icon className="w-4 h-4" />
	</Button>
);
