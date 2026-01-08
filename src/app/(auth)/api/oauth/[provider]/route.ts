import { NextRequest } from "next/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import z from "zod"

import { db } from "@/drizzle/db"
import {
  OAuthProvider,
  oAuthProviders,
  UserOAuthAccountTable,
  UserTable,
} from "@/drizzle/schema"

import { getOAuthClient } from "@/features/auth/lib/oAuth/base"
import { createUserSession } from "@/features/auth/lib/session"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: rawProvider } = await params
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const provider = z.enum(oAuthProviders).parse(rawProvider)

  if (typeof code !== "string" || typeof state !== "string")
    redirect(
      `/sign-in?oauthError=${encodeURIComponent(
        "Failed to connect, please try again."
      )}`
    )

  const oAuthClient = getOAuthClient(provider)
  try {
    const oAuthUser = await oAuthClient.fetchUser(code, state, await cookies())

    const user = await connectUserToAccount(oAuthUser, provider)

    await createUserSession(user, await cookies())
  } catch (err) {
    console.error(err) // log error
    redirect(
      `/sign-in?oauthError=${encodeURIComponent(
        "Failed to connect, please try again."
      )}`
    )
  }

  redirect("/")
}

async function connectUserToAccount(
  { id, email, name }: { id: string; email: string; name: string },
  provider: OAuthProvider
) {
  return await db.transaction(async (tx) => {
    let user = await tx.query.UserTable.findFirst({
      columns: { id: true },
      where: (t, f) => f.eq(t.email, email),
    })

    if (user == null) {
      const [newUser] = await tx
        .insert(UserTable)
        .values({ name: name, email })
        .returning({ id: UserTable.id })

      user = newUser
    }

    await tx
      .insert(UserOAuthAccountTable)
      .values({ userId: user.id, providerAccountId: id, provider })
      .onConflictDoNothing()

    return user
  })
}
