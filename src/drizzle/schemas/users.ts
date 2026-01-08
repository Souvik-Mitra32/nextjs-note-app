import { relations } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"

import { NoteTable } from "./notes"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { UserOAuthAccountTable } from "./userOAuthAccounts"

export const UserTable = pgTable("users", {
  id,
  name: text().notNull(),
  email: text().unique().notNull(),
  password: text(),
  salt: text(),
  createdAt,
  updatedAt,
})

export const userRelations = relations(UserTable, ({ many }) => ({
  oAuthAccounts: many(UserOAuthAccountTable),
  notes: many(NoteTable),
}))
