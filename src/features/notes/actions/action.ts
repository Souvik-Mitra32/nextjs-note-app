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

  const data = parsed.data

  let editedNote: {
    id: string
    tags: string[]
  }
  try {
    editedNote = await db.transaction(async (tx) => {
      const note = await tx.query.NoteTable.findFirst({
        columns: { id: true },
        where: (t, f) => f.eq(t.id, id),
        with: {
          noteTags: {
            columns: {},
            with: {
              tag: {
                columns: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!note) throw new Error("Note not found.")

      await tx.update(NoteTable).set(data).where(eq(NoteTable.id, note.id))

      const incomingTags = data.tags.map((tag) => tag.label)
      const existingTags = note.noteTags.map(({ tag }) => tag.name)
      const uniqueTags = Array.from(
        new Set([...existingTags, ...incomingTags])
      ).map((i) => i)

      const toAdd = uniqueTags.filter(
        (tag) => !existingTags.find((t) => t === tag)
      )
      const toRemove = uniqueTags.filter(
        (tag) => !incomingTags.find((t) => t == tag)
      )

      const addedTagIds: string[] = []
      const removedTagIds: string[] = []

      if (toAdd.length > 0) {
        const tags = await tx
          .insert(TagTable)
          .values(toAdd.map((tag) => ({ name: tag, userId: user.id })))
          .returning({ id: TagTable.id })

        tags.forEach((tag) => addedTagIds.push(tag.id))

        await tx
          .insert(NoteTagTable)
          .values(addedTagIds.map((tagId) => ({ noteId: note.id, tagId })))
      }

      if (toRemove.length > 0) {
        const tags = await Promise.all(
          toRemove.map((tagName) =>
            tx.query.TagTable.findFirst({
              columns: { id: true },
              where: (t, f) => f.eq(t.name, tagName),
            })
          )
        )

        tags.forEach((tag) => tag && removedTagIds.push(tag.id))

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

      return { id: note.id, tags: [...addedTagIds, ...removedTagIds] }
    })
  } catch (err) {
    console.error(err)
    return "Unable to edit note."
  }

  updateTag("global:notes")
  updateTag(`id:${editedNote.id}-notes`)

  if (editedNote.tags.length > 0) {
    updateTag("global:tags")
    editedNote.tags.forEach((tag) => updateTag(`id:${tag}-tags`))
  }

  redirect(`/${id}?toast=note_updated`)
}

export async function deleteNoteAction(id: string) {
  await getCurrentUser({ withFullUser: false, redirectIfNotFound: true })

  let deletedNote: { id: string; tags: string[] }
  try {
    deletedNote = await db.transaction(async (tx) => {
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
  } catch (err) {
    console.error(err)
    return "Unable to delete note."
  }

  updateTag("global:notes")
  updateTag(`id:${id}-notes`)

  if (deletedNote.tags.length > 0) {
    updateTag("global:tags")
    deletedNote.tags.forEach((tag) => updateTag(`id:${tag}-tags`))
  }

  redirect("/?toast=note_deleted")
}
