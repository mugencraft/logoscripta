import { cn } from "@/ui/utils";
import {
	Children,
	type HTMLAttributes,
	type ReactNode,
	cloneElement,
	createContext,
	forwardRef,
	isValidElement,
} from "react";
import { Button } from "../core/button";

interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
	orientation?: "horizontal" | "vertical";
	variant?: "default" | "outline" | "secondary";
	size?: "default" | "sm" | "lg";
	children: ReactNode;
}

interface ButtonGroupContext {
	variant?: ButtonGroupProps["variant"];
	size?: ButtonGroupProps["size"];
}

const ButtonGroupContext = createContext<ButtonGroupContext>({});

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
	(
		{
			className,
			orientation = "horizontal",
			variant = "default",
			size = "default",
			children,
			...props
		},
		ref,
	) => {
		const groupClassName = cn(
			"inline-flex overflow-hidden",
			orientation === "horizontal" ? "rounded-md" : "flex-col rounded-md",
			className,
		);

		return (
			<ButtonGroupContext.Provider value={{ variant, size }}>
				<div className={groupClassName} ref={ref} role="group" {...props}>
					{Children.map(children, (child, index) => {
						if (isValidElement(child) && child.type === Button) {
							const isFirst = index === 0;
							const isLast = index === Children.count(children) - 1;
							const isMiddle = !isFirst && !isLast;

							const childClassName = cn(
								child.props.className,
								orientation === "horizontal"
									? {
											"rounded-l-none rounded-r-none": isMiddle,
											"rounded-r-none": isFirst,
											"rounded-l-none": isLast,
											"-ml-px": !isFirst,
										}
									: {
											"rounded-t-none rounded-b-none": isMiddle,
											"rounded-b-none": isFirst,
											"rounded-t-none": isLast,
											"-mt-px": !isFirst,
										},
							);

							return cloneElement(child, {
								variant: child.props.variant ?? variant,
								size: child.props.size ?? size,
								className: childClassName,
							});
						}
						return child;
					})}
				</div>
			</ButtonGroupContext.Provider>
		);
	},
);

ButtonGroup.displayName = "ButtonGroup";
