"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import z from "zod"

import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"

import { signInSchema, signUpSchema } from "./schema"

import { createUserSession, removeUserFromSession } from "../lib/session"
import {
  comparePasswords,
  generateSalt,
  hashPassword,
} from "../lib/passwordHasher"

export async function signUpAction(unsafeData: z.infer<typeof signUpSchema>) {
  const parsed = signUpSchema.safeParse(unsafeData)
  if (!parsed.success) return "Unable to create account."

  const data = parsed.data

  const existingUser = await db.query.UserTable.findFirst({
    columns: { id: true },
    where: (t, f) => f.eq(t.email, data.email),
  })

  if (existingUser) return "Account already exists for this email."

  const salt = generateSalt()
  const hashedPassword = await hashPassword(data.password, salt)

  const [newUser] = await db
    .insert(UserTable)
    .values({ ...data, password: hashedPassword, salt })
    .returning({ id: UserTable.id })

  if (newUser == null) return "Unable to create account."

  await createUserSession(newUser, await cookies())

  redirect("/")
}

export async function signInAction(unsafeData: z.infer<typeof signInSchema>) {
  const parsed = signInSchema.safeParse(unsafeData)
  if (!parsed.success) return "Unable to sign in."

  const data = parsed.data

  const existingUser = await db.query.UserTable.findFirst({
    where: (t, f) => f.eq(t.email, data.email),
  })

  if (!existingUser) return "Invalid email/password."

  if (existingUser.password == null || existingUser.salt == null)
    return "Unable to sign in"

  const isPasswordCorrect = await comparePasswords(
    data.password,
    existingUser.password,
    existingUser.salt
  )

  if (!isPasswordCorrect) return "Invalid email/password."

  await createUserSession(existingUser, await cookies())

  redirect("/")
}

export async function logout() {
  await removeUserFromSession(await cookies())

  redirect("/")
}
