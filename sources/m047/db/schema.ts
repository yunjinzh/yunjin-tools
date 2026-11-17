import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteCards = sqliteTable("site_cards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  url: text("url"),
  category: text("category").notNull().default("其他"),
  accent: text("accent").notNull().default("coral"),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  versionCount: integer("version_count").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sitePreferences = sqliteTable("site_preferences", {
  siteId: text("site_id").primaryKey(),
  customName: text("custom_name"),
  customDescription: text("custom_description"),
  customCategory: text("custom_category"),
  customAccent: text("custom_accent"),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
  deleted: integer("deleted", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
