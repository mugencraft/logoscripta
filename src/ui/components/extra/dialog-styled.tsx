import { Button } from "@/ui/components/core/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/components/core/dialog";
import { cn } from "@/ui/utils";
import type { PropsWithChildren } from "react";

interface DialogStyledProps extends PropsWithChildren {
	className?: string;
	title: string;
	description?: string;
	open?: boolean;
	showCloseButton?: boolean;
	onOpenChange?(open: boolean): void;
}

export const DialogStyled = ({
	className,
	open,
	onOpenChange,
	title,
	description,
	showCloseButton,
	children,
}: DialogStyledProps) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"sm:max-w-[90vw] md:max-w-[80vw] p-4",
					"bg-mono-100",
					className,
				)}
			>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{children}
				{showCloseButton && (
					<DialogFooter>
						<Button
							variant="ghost"
							onClick={() => onOpenChange?.(false)}
							className="w-full"
						>
							Close
						</Button>
					</DialogFooter>
				)}
			</DialogContent>
		</Dialog>
	);
};
