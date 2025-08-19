import type { ResultSet } from "@libsql/client";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { SQLiteTransaction } from "drizzle-orm/sqlite-core";

import type * as schemas from "@/shared/schema";

export type DbTransaction = SQLiteTransaction<
  "async",
  ResultSet,
  typeof schemas,
  ExtractTablesWithRelations<typeof schemas>
>;
