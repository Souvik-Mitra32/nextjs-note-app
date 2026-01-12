import { relations } from "drizzle-orm"
import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core"

import { UserTable } from "./users"
import { NoteTagTable } from "./notesTags"
import { createdAt, id, updatedAt } from "../schemaHelpers"

export const TagTable = pgTable(
  "tags",
  {
    id,
    name: text().notNull(),
    userId: uuid("user_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [unique("unique_tag_per_user").on(table.userId, table.name)]
)

export const tagRelations = relations(TagTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [TagTable.userId],
    references: [UserTable.id],
  }),
  tagNotes: many(NoteTagTable),
}))
