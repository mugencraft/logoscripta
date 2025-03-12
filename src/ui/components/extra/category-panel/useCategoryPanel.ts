import { useMemo, useState } from "react";
import type { CategoryGroup, CategoryOption } from "./types";

interface UseCategoryPanelProps {
	groups: CategoryGroup[];
	value: string;
	allowCustomValues?: boolean;
}

export function useCategoryPanel({ groups }: UseCategoryPanelProps) {
	// Track which groups are expanded
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
		{},
	);
	// Search term
	const [search, setSearch] = useState("");

	// Initialize flat options for easier handling
	const flatOptions = useMemo(() => {
		const options: CategoryOption[] = [];

		for (const group of groups) {
			// Add main group
			options.push({
				value: group.value,
				label: group.label,
				description: group.description,
			});

			// Add subitems
			for (const subitem of group.subitems) {
				options.push({
					value: `${group.value} > ${subitem}`,
					label: subitem,
					isSubitem: true,
					parentValue: group.value,
					parentLabel: group.label,
				});
			}
		}

		return options;
	}, [groups]);

	// Toggle expansion of a single group
	const toggleGroup = (groupValue: string) => {
		setExpandedGroups((prev) => ({
			...prev,
			[groupValue]: !prev[groupValue],
		}));
	};

	// Expand or collapse all groups
	const toggleAllGroups = (expanded: boolean) => {
		const newState: Record<string, boolean> = {};
		for (const group of groups) {
			newState[group.value] = expanded;
		}
		setExpandedGroups(newState);
	};

	// Filter groups and items based on search
	const filteredGroups = useMemo(() => {
		if (!search) return groups;

		const searchLower = search.toLowerCase();

		const result = [];

		for (const group of groups) {
			// Check if group matches
			const groupMatches =
				group.label.toLowerCase().includes(searchLower) ||
				group.description?.toLowerCase().includes(searchLower);

			// Filter subitems that match
			const matchingSubitems = group.subitems.filter((subitem) =>
				subitem.toLowerCase().includes(searchLower),
			);

			// Include group if either group matches or has matching subitems
			if (groupMatches || matchingSubitems.length > 0) {
				// When searching, we want to auto-expand groups with matches
				if (matchingSubitems.length > 0 || groupMatches) {
					setExpandedGroups((prev) => ({
						...prev,
						[group.value]: true,
					}));
				}

				result.push({
					...group,
					// If we're searching for subitems, only show matching ones
					subitems:
						matchingSubitems.length > 0 && !groupMatches
							? matchingSubitems
							: group.subitems,
				});
			}
		}

		return result;
	}, [groups, search]);

	// Get display value for the selected item
	const getDisplayValue = (val: string) => {
		if (!val) return "";

		const option = flatOptions.find((opt) => opt.value === val);
		if (option) {
			return option.isSubitem
				? `${option.parentLabel} > ${option.label}`
				: option.label;
		}

		return val; // For custom values
	};

	return {
		search,
		setSearch,
		expandedGroups,
		toggleGroup,
		toggleAllGroups,
		filteredGroups,
		getDisplayValue,
	};
}
