// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
export {};
import {sqliteTable,text,integer,index,primaryKey} from 'drizzle-orm/sqlite-core';
export const teachingProjects=sqliteTable('teaching_projects',{
 id:text('id').primaryKey(),owner:text('owner').notNull(),name:text('name').notNull(),modelName:text('model_name').notNull(),revision:integer('revision').notNull(),blobKey:text('blob_key').notNull(),bytes:integer('bytes').notNull(),updatedAt:text('updated_at').notNull(),
},t=>[index('teaching_projects_owner').on(t.owner)]);
export const teachingVersions=sqliteTable('teaching_versions',{
 projectId:text('project_id').notNull().references(()=>teachingProjects.id,{onDelete:'cascade'}),revision:integer('revision').notNull(),blobKey:text('blob_key').notNull(),bytes:integer('bytes').notNull(),createdAt:text('created_at').notNull(),
},t=>[primaryKey({columns:[t.projectId,t.revision]})]);
