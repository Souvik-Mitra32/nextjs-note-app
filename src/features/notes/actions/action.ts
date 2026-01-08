"use server"

import { redirect } from "next/navigation"
import { updateTag } from "next/cache"
import { eq } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { NoteTable } from "@/drizzle/schema"

import { noteSchema, NoteSchema } from "./schema"

import { getCurrentUser } from "@/features/auth/lib/currentUser"

export async function addNoteAction(unsafeData: NoteSchema) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: true,
  })

  const parsed = noteSchema.safeParse(unsafeData)
  if (!parsed.success) return "Invalid input."

  const data = parsed.data

  let newNote: { id: string }
  try {
    ;[newNote] = await db
      .insert(NoteTable)
      .values({ ...data, userId: user.id })
      .returning({ id: NoteTable.id })

    updateTag("global:notes")
    updateTag(`id:${newNote.id}-notes`)
  } catch (err) {
    console.error(err)
    return "Unable to add note."
  }

  redirect(`/${newNote.id}?toast=note_created`)
}

export async function editNoteAction(id: string, unsafeData: NoteSchema) {
  await getCurrentUser({ withFullUser: false, redirectIfNotFound: true })

  const parsed = noteSchema.safeParse(unsafeData)
  if (!parsed.success) return "Invalid input."

  const data = parsed.data

  try {
    await db.update(NoteTable).set(data).where(eq(NoteTable.id, id))

    updateTag("global:notes")
    updateTag(`id:${id}-notes`)
  } catch (err) {
    console.error(err)
    return "Unable to edit note."
  }

  redirect(`/${id}?toast=note_updated`)
}

export async function deleteNoteAction(id: string) {
  await getCurrentUser({ withFullUser: false, redirectIfNotFound: true })

  try {
    await db.delete(NoteTable).where(eq(NoteTable.id, id))
    updateTag("global:notes")
    updateTag(`id:${id}-notes`)
  } catch (err) {
    console.error(err)
    return "Unable to delete note."
  }

  redirect("/?toast=note_deleted")
}
