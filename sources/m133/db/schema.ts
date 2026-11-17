import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('research_records', {
 key: text('key').primaryKey(), owner: text('owner').notNull(), kind: text('kind').notNull(), payload: text('payload').notNull(), updated: text('updated').notNull(), revision: integer('revision').notNull().default(1)
});
