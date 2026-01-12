"use server"

import { redirect } from "next/navigation"
import { updateTag } from "next/cache"
import { and, eq } from "drizzle-orm"

import { db } from "@/drizzle/db"
import { NoteTable, NoteTagTable, TagTable } from "@/drizzle/schema"

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

  let newNote: { id: string; tags: string[] }
  try {
    newNote = await db.transaction(async (tx) => {
      const [note] = await tx
        .insert(NoteTable)
        .values({ ...data, userId: user.id })
        .returning({ id: NoteTable.id })

      const tagIds = await Promise.all(
        data.tags.map(async (tag) => {
          const existing = await tx.query.TagTable.findFirst({
            columns: { id: true },
            where: (t, f) => f.eq(t.name, tag.label),
          })

          if (existing) return existing.id

          const [inserted] = await tx
            .insert(TagTable)
            .values({ name: tag.label, userId: user.id })
            .returning({ id: TagTable.id })

          return inserted.id
        })
      )

      await Promise.all(
        tagIds.map((tagId) =>
          tx
            .insert(NoteTagTable)
            .values({ noteId: note.id, tagId })
            .onConflictDoNothing()
        )
      )

      return { id: note.id, tags: tagIds }
    })
  } catch (err) {
    console.error(err)
    return "Unable to add note."
  }

  updateTag("global:notes")
  updateTag(`id:${newNote.id}-notes`)

  if (newNote.tags.length > 0) {
    updateTag("global:tags")
    newNote.tags.forEach((tag) => updateTag(`id:${tag}-tags`))
  }

  redirect(`/${newNote.id}?toast=note_created`)
}

export async function editNoteAction(id: string, unsafeData: NoteSchema) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: true,
  })

  const parsed = noteSchema.safeParse(unsafeData)
  if (!parsed.success) return "Invalid input."

  const incomingTags = parsed.data.tags.map((t) => t.label)

  const editedNote = await db
    .transaction(async (tx) => {
      const note = await tx.query.NoteTable.findFirst({
        columns: { id: true },
        where: (t, f) => f.eq(t.id, id),
      })
      if (!note) throw new Error("Note not found.")

      await tx
        .update(NoteTable)
        .set(parsed.data)
        .where(eq(NoteTable.id, note.id))

      const allTags = await tx.query.TagTable.findMany({
        columns: { id: true, name: true },
        with: { tagNotes: { columns: { noteId: true } } },
      })

      const allNames = allTags.map((t) => t.name)

      const existingNames = allTags
        .filter((t) => t.tagNotes.some((n) => n.noteId === note.id))
        .map((t) => t.name)

      const toCreate = incomingTags.filter((name) => !allNames.includes(name))
      const toAdd = incomingTags.filter((name) => !existingNames.includes(name))
      const toRemove = existingNames.filter(
        (name) => !incomingTags.includes(name)
      )

      const addedTagIds: string[] = []
      const removedTagIds: string[] = []

      if (toCreate.length) {
        const inserted = await tx
          .insert(TagTable)
          .values(toCreate.map((name) => ({ name, userId: user.id })))
          .returning({ id: TagTable.id })

        inserted.forEach((r) => addedTagIds.push(r.id))
      }

      const toAddIds = allTags
        .filter((t) => toAdd.includes(t.name))
        .map((t) => t.id)
      addedTagIds.push(...toAddIds)

      if (addedTagIds.length) {
        await tx
          .insert(NoteTagTable)
          .values(addedTagIds.map((tagId) => ({ noteId: note.id, tagId })))
      }

      const toRemoveIds = allTags
        .filter((t) => toRemove.includes(t.name))
        .map((t) => t.id)
      removedTagIds.push(...toRemoveIds)

      if (removedTagIds.length) {
        await Promise.all(
          removedTagIds.map((tagId) =>
            tx
              .delete(NoteTagTable)
              .where(
                and(
                  eq(NoteTagTable.noteId, note.id),
                  eq(NoteTagTable.tagId, tagId)
                )
              )
          )
        )
      }

      return { id: note.id, added: addedTagIds, removed: removedTagIds }
    })
    .catch(() => {
      return "Unable to edit note."
    })

  if (typeof editedNote === "string") return editedNote

  updateTag("global:notes")
  updateTag(`id:${editedNote.id}-notes`)

  const allTouched = [...editedNote.added, ...editedNote.removed]
  if (allTouched.length) {
    updateTag("global:tags")
    allTouched.forEach((id) => updateTag(`id:${id}-tags`))
  }

  redirect(`/${id}?toast=note_updated`)
}

export async function deleteNoteAction(id: string) {
  await getCurrentUser({ withFullUser: false, redirectIfNotFound: true })

  const deletedNote = await db
    .transaction(async (tx) => {
      const note = await tx.query.NoteTable.findFirst({
        columns: { id: true },
        where: (t, f) => f.eq(t.id, id),
        with: {
          noteTags: {
            columns: {},
            where: (t, f) => f.eq(t.noteId, id),
            with: {
              tag: { columns: { id: true } },
            },
          },
        },
      })

      if (!note) throw new Error("Note not found.")

      await tx.delete(NoteTable).where(eq(NoteTable.id, note.id))

      const removedTagIds = note.noteTags.map(({ tag }) => tag.id)

      await Promise.all(
        removedTagIds.map((tagId) =>
          tx
            .delete(NoteTagTable)
            .where(
              and(
                eq(NoteTagTable.noteId, note.id),
                eq(NoteTagTable.tagId, tagId)
              )
            )
        )
      )

      return { id: note.id, tags: removedTagIds }
    })
    .catch(() => "Unable to delete note.")

  if (typeof deletedNote === "string") return deletedNote

  updateTag("global:notes")
  updateTag(`id:${id}-notes`)

  if (deletedNote.tags.length > 0) {
    updateTag("global:tags")
    deletedNote.tags.forEach((tag) => updateTag(`id:${tag}-tags`))
  }

  redirect("/?toast=note_deleted")
}
