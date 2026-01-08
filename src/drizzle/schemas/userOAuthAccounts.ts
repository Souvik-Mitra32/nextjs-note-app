import { relations } from "drizzle-orm"
import { pgEnum, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core"

import { UserTable } from "./users"
import { createdAt, updatedAt } from "../schemaHelpers"

export const oAuthProviders = ["discord", "google"] as const
export type OAuthProvider = (typeof oAuthProviders)[number]
export const oAuthProvidersEnum = pgEnum("oauth_providers", oAuthProviders)

export const UserOAuthAccountTable = pgTable(
  "user_oauth_accounts",
  {
    userId: uuid("user_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    provider: text().notNull(),
    providerAccountId: text("provider_account_id").unique().notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
  ]
)

export const userOAuthAccountRelations = relations(
  UserOAuthAccountTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserOAuthAccountTable.userId],
      references: [UserTable.id],
    }),
  })
)
