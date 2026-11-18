import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("audit_events", {
  seq: integer("seq").primaryKey({ autoIncrement: true }),
  op: text("op").notNull().unique(),
  entity: text("entity").notNull(),
  revision: integer("revision").notNull(),
  payload: text("payload").notNull(),
  at: text("at").notNull(),
}, table => [uniqueIndex("audit_entity_revision").on(table.entity, table.revision)]);
