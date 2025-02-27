interface BaseCellProps {
	text?: string;
	lines?: string;
}

export const BaseCell = ({ text, lines }: BaseCellProps) => (
	<div {...{ className: `line-clamp-${lines || 1}` }}>{text || "-"}</div>
);
