import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/sqlite-core";

export const revisions = sqliteTable(
  "revisions",
  {
    id: text("id").notNull(),
    revision: integer("revision").notNull(),
    body: text("body").notNull(),
    changedAt: text("changed_at").notNull(),
    actor: text("actor").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.id, t.revision] }),
    index("recent_activity").on(t.changedAt),
  ],
);

export const uploads = sqliteTable("uploads", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull(),
});
