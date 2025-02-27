import { sql } from "drizzle-orm";
import {
	integer,
	primaryKey,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

import { relations } from "drizzle-orm";

export const repositories = sqliteTable("repositories", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	fullName: text("full_name").notNull(),
	ownerId: integer("owner_id")
		.notNull()
		.references(() => owners.githubId),
	description: text("description"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	pushedAt: integer("pushed_at", { mode: "timestamp" }).notNull(),
	homepage: text("homepage"),
	size: integer("size").notNull(),
	stargazersCount: integer("stargazers_count").notNull(),
	subscribersCount: integer("subscribers_count").notNull(),
	language: text("language"),
	forksCount: integer("forks_count").notNull(),
	openIssuesCount: integer("open_issues_count").notNull(),
	licenseName: text("license_name"),
	topics: text("topics", { mode: "json" })
		.$type<string[]>()
		.notNull()
		.default(sql`'[]'`),
	visibility: text("visibility").notNull(),
	defaultBranch: text("default_branch").notNull(),
	isArchived: integer("is_archived", { mode: "boolean" }).notNull(),
	isDisabled: integer("is_disabled", { mode: "boolean" }).notNull(),
	isPrivate: integer("is_private", { mode: "boolean" }).notNull(),
	snapshotDate: text("snapshot_date").default(sql`(strftime('%s', 'now'))`),
});

export const owners = sqliteTable("owners", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	login: text("login"),
	githubId: integer("github_id").notNull().unique(),
	type: text("type").notNull(),
	avatarUrl: text("avatar_url").notNull(),
	repoCount: integer("repo_count").notNull(),
});

export const topics = sqliteTable("topics", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	topic: text("topic").notNull().unique(),
});

export const repositoriesToTopics = sqliteTable(
	"repositories_to_topics",
	{
		repositoryId: integer("repository_id")
			.notNull()
			.references(() => repositories.id, { onDelete: "cascade" }),
		topicId: integer("topic_id")
			.notNull()
			.references(() => topics.id, { onDelete: "cascade" }),
	},
	(t) => [primaryKey({ columns: [t.repositoryId, t.topicId] })],
);

export const repositoryLists = sqliteTable("repository_lists", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	description: text("description"),
	metadata: text("metadata", { mode: "json" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(strftime('%s', 'now'))`),

	readOnly: integer("read_only", { mode: "boolean" }).notNull().default(false),
	sourceType: text("source_type"),
	sourceVersion: text("source_version"),
});

export const repositoryListItems = sqliteTable(
	"repository_list_items",
	{
		listId: integer("list_id")
			.notNull()
			.references(() => repositoryLists.id, { onDelete: "cascade" }),
		// Always required
		fullName: text("full_name").notNull(),
		// Our internal reference
		repositoryId: integer("repository_id").references(() => repositories.id, {
			onDelete: "set null",
		}),
		metadata: text("metadata", { mode: "json" }),
	},
	(table) => [primaryKey({ columns: [table.listId, table.fullName] })],
);

// Relations

export const repositoriesRelations = relations(
	repositories,
	({ one, many }) => ({
		owner: one(owners, {
			fields: [repositories.ownerId],
			references: [owners.githubId],
		}),
		repositoriesToTopics: many(repositoriesToTopics),
		repositoryListItems: many(repositoryListItems),
	}),
);

export const ownersRelations = relations(owners, ({ many }) => ({
	repositories: many(repositories),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
	repositoriesToTopics: many(repositoriesToTopics),
}));

export const repositoriesToTopicsRelations = relations(
	repositoriesToTopics,
	({ one }) => ({
		repository: one(repositories, {
			fields: [repositoriesToTopics.repositoryId],
			references: [repositories.id],
		}),
		topic: one(topics, {
			fields: [repositoriesToTopics.topicId],
			references: [topics.id],
		}),
	}),
);

export const repositoryListsRelations = relations(
	repositoryLists,
	({ many }) => ({
		items: many(repositoryListItems),
	}),
);

export const repositoryListItemsRelations = relations(
	repositoryListItems,
	({ one }) => ({
		list: one(repositoryLists, {
			fields: [repositoryListItems.listId],
			references: [repositoryLists.id],
		}),
		repository: one(repositories, {
			fields: [repositoryListItems.repositoryId],
			references: [repositories.id],
		}),
	}),
);
