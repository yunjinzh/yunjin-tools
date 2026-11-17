import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const workspaces = sqliteTable('workspaces', { owner: text('owner').primaryKey(), body: text('body').notNull(), revision: integer('revision').notNull().default(1), writeToken:text('write_token') });
export const projectVersions=sqliteTable('project_versions',{id:text('id').primaryKey(),owner:text('owner').notNull(),projectId:text('project_id').notNull(),date:text('date').notNull(),note:text('note').notNull(),body:text('body').notNull()},t=>[index('versions_owner_project').on(t.owner,t.projectId)]);
