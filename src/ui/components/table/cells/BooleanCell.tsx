import { Badge } from "@/ui/components/core/badge";

interface BooleanCellProps {
	value: boolean;
}

export const BooleanCell = ({ value }: BooleanCellProps) =>
	value ? (
		<Badge variant="default">Yes</Badge>
	) : (
		<Badge variant="default">No</Badge>
	);
