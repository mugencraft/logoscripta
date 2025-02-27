import type * as schemas from "@/shared/schema";
import type { ResultSet } from "@libsql/client";
import type { DBQueryConfig, ExtractTablesWithRelations } from "drizzle-orm";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

export type RepositoryWithInput = DBQueryConfig<
	"many",
	true,
	ExtractTablesWithRelations<typeof schemas>,
	ExtractTablesWithRelations<typeof schemas>["repositories"]
>["with"];

export type DbTransaction = SQLiteTransaction<
	"async",
	ResultSet,
	typeof schemas,
	ExtractTablesWithRelations<typeof schemas>
>;
