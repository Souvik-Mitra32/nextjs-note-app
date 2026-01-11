import { relations } from "drizzle-orm"
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core"

import { NoteTable } from "./notes"
import { TagTable } from "./tags"
import { createdAt, updatedAt } from "../schemaHelpers"

export const NoteTagTable = pgTable(
  "notes_tags",
  {
    noteId: uuid("note_id")
      .references(() => NoteTable.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => TagTable.id, { onDelete: "cascade" })
      .notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [primaryKey({ columns: [table.noteId, table.tagId] })]
)

export const noteToTagRelations = relations(NoteTagTable, ({ one }) => ({
  note: one(NoteTable, {
    fields: [NoteTagTable.noteId],
    references: [NoteTable.id],
  }),
  tag: one(TagTable, {
    fields: [NoteTagTable.tagId],
    references: [TagTable.id],
  }),
}))
