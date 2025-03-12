import { Label } from "@/ui/components/core/label";
import type { ReactNode } from "react";

interface MetadataFormFieldProps {
	id?: string;
	label: string;
	hasVariedValues?: boolean;
	children: ReactNode;
}

export function MetadataFormField({
	id,
	label,
	hasVariedValues,
	children,
}: MetadataFormFieldProps) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id} className="flex justify-between">
				<span>{label}</span>
				{hasVariedValues && (
					<span className="text-xs text-amber-500">Multiple values</span>
				)}
			</Label>
			{children}
		</div>
	);
}
