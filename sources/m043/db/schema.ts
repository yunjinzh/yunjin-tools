import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const pageStats = sqliteTable(
  "page_stats",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    path: text("path").notNull(),
    views: integer("views").notNull().default(0),
    updatedAt: integer("updated_at").notNull().default(0),
  },
  (table) => [uniqueIndex("idx_page_stats_path").on(table.path)]
);
