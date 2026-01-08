import { relations } from "drizzle-orm"
import { pgTable, text, uuid } from "drizzle-orm/pg-core"

import { UserTable } from "./users"
import { createdAt, id, updatedAt } from "../schemaHelpers"

export const NoteTable = pgTable("notes", {
  id,
  title: text().notNull(),
  body: text(),
  userId: uuid("user_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt,
  updatedAt,
})

export const noteRelations = relations(NoteTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [NoteTable.userId],
    references: [UserTable.id],
  }),
}))
