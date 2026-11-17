import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const attempts=sqliteTable('attempts',{id:text('id').primaryKey(),student:text('student').notNull(),mode:text('mode').notNull(),course:text('course').notNull(),score:integer('score').notNull(),passed:integer('passed').notNull(),created:text('created').notNull(),payload:text('payload').notNull(),review:text('review')});
