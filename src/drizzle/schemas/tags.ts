import { relations } from "drizzle-orm"
import { pgTable, text, uuid } from "drizzle-orm/pg-core"

import { UserTable } from "./users"
import { NoteTagTable } from "./notesTags"
import { createdAt, id, updatedAt } from "../schemaHelpers"

export const TagTable = pgTable("tags", {
  id,
  name: text().unique().notNull(),
  userId: uuid("user_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt,
  updatedAt,
})

export const tagRelations = relations(TagTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [TagTable.userId],
    references: [UserTable.id],
  }),
  tagNotes: many(NoteTagTable),
}))
