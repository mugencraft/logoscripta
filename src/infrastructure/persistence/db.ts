import { join } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import type { AppConfig } from "@/domain/config/app";
import * as schema from "@/shared/schema";

// get the config asynchronously
const getConfig = async (): Promise<AppConfig> => {
  const { useConfig } = await import("@/domain/config/useConfig");
  const { config } = await useConfig();
  return config;
};

// Singleton function to ensure only one db instance is created
const singleton = <Value>(name: string, value: () => Value): Value => {
  // biome-ignore lint/suspicious/noExplicitAny: global is of type any
  const globalAny: any = global;
  globalAny.__singletons = globalAny.__singletons || {};

  if (!globalAny.__singletons[name]) {
    globalAny.__singletons[name] = value();
  }

  return globalAny.__singletons[name];
};

// Function to create the database connection and apply migrations if needed
const createDatabaseConnection = async () => {
  const { paths } = await getConfig();

  const client = createClient({
    url: `file:${join(paths.db, "drizzle.db")}`,
  });
  return drizzle({ client, schema });
};

const client = async () => await singleton("db", createDatabaseConnection);
const db = await client();

export { db };
