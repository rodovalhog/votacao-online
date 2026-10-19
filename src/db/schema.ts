import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const candidates = pgTable('candidates', {
  id: text('id').primaryKey(), // 'lula' | 'flavio'
  name: text('name').notNull(),
  number: integer('number').notNull(),
  votes: integer('votes').notNull().default(0),
});
