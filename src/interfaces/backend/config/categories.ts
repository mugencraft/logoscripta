import type { CategoryGroup } from "@/ui/components/extra/category-panel/types";

export const pluginCategories: CategoryGroup[] = [
	{
		value: "Knowledge Capture",
		label: "Capture",
		description:
			"Tools for collecting and importing information from various sources",
		subitems: [
			"Web clipping",
			"PDF annotation",
			"Citation management",
			"Import tools",
			"Research collection",
		],
	},
	{
		value: "Knowledge Organization",
		label: "Organize",
		description: "Tools for structuring and categorizing your knowledge base",
		subitems: [
			"Tagging systems",
			"Metadata management",
			"Link management",
			"Folder organization",
			"Project planning",
			"Media management",
		],
	},
	{
		value: "Knowledge Processing",
		label: "Process",
		description: "Tools for refining, analyzing, and transforming your notes",
		subitems: [
			"Note refactoring",
			"Text analysis",
			"Content generation",
			"Writing assistance",
			"Automation",
			"Workflows",
			"AI enhancement",
			"Collaboration",
		],
	},
	{
		value: "Knowledge Retrieval",
		label: "Retrieve",
		description: "Tools for finding, visualizing, and querying your knowledge",
		subitems: [
			"Advanced search",
			"Dataview tools",
			"Query builders",
			"Visualization",
			"Dashboards",
			"Data analysis",
			"Research synthesis",
		],
	},
	{
		value: "Task Management",
		label: "Tasks",
		description: "Tools for managing projects, tasks, and deadlines",
		subitems: [
			"To-do tracking",
			"Time management",
			"Progress visualization",
			"Calendar integration",
			"Kanban boards",
			"Session planning",
		],
	},
	{
		value: "User Experience",
		label: "UX",
		description: "Tools that enhance the look and feel of Obsidian",
		subitems: [
			"Themes",
			"Interface customization",
			"Navigation tools",
			"Reading view enhancement",
			"Workspace management",
		],
	},
	{
		value: "System Integration",
		label: "System",
		description:
			"Tools that connect Obsidian with other systems and extend core functionality",
		subitems: [
			"External app integration",
			"Sync tools",
			"Version control",
			"Publishing",
			"Export options",
			"Template management",
		],
	},
	{
		value: "Domain Tools",
		label: "Domains",
		description: "Tools designed for specific domains or use cases",
		subitems: [
			"Game design & TTRPG",
			"Digital humanities",
			"Software development",
			"Content creation",
			"Education tools",
			"Marketing & analytics",
		],
	},
];
