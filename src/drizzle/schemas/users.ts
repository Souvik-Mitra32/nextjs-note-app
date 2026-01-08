import { relations } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"

import { NoteTable } from "./notes"
import { createdAt, id, updatedAt } from "../schemaHelpers"

export const UserTable = pgTable("users", {
  id,
  name: text().notNull(),
  email: text().notNull(),
  password: text().notNull(),
  salt: text().notNull(),
  createdAt,
  updatedAt,
})

export const userRelations = relations(UserTable, ({ many }) => ({
  notes: many(NoteTable),
}))
