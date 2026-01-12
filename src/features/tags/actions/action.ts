"use server"

import { getCurrentUser } from "@/features/auth/lib/currentUser"
import { tagSchema, TagSchema } from "./schema"
import { db } from "@/drizzle/db"
import { NoteTagTable, TagTable } from "@/drizzle/schema"
import { and, eq } from "drizzle-orm"
import { updateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function editTagsBatchAction(unsafeData: TagSchema) {
  await getCurrentUser({ withFullUser: false, redirectIfNotFound: true })

  const parsed = tagSchema.safeParse(unsafeData)
  if (!parsed.success) return "Invalid input."

  type Success = {
    success: true
    data: { id: string; tagNotes: { note: { id: string } }[] }[]
  }

  type Failure = {
    success: false
    error: string
  }

  type Result = Success | Failure

  const result: Result = await db.transaction(async (tx) => {
    const entries = Object.entries(parsed.data)

    const loaded = await Promise.all(
      entries.map(async ([id, newName]) => {
        const tag = await tx.query.TagTable.findFirst({
          columns: { id: true, name: true },
          where: (t, f) => f.eq(t.id, id),
          with: {
            tagNotes: {
              columns: {},
              with: { note: { columns: { id: true } } },
            },
          },
        })

        if (!tag) return null
        return { ...tag, newName }
      })
    )

    if (loaded.some((t) => t === null)) {
      return { success: false, error: "Tag(s) not found" }
    }

    const existing = loaded as {
      id: string
      name: string
      newName: string
      tagNotes: { note: { id: string } }[]
    }[]

    const updated = await Promise.all(
      existing.map(async (tag) => {
        if (tag.name === tag.newName)
          return { id: tag.id, tagNotes: tag.tagNotes }

        const [u] = await tx
          .update(TagTable)
          .set({ name: tag.newName })
          .where(eq(TagTable.id, tag.id))
          .returning({ id: TagTable.id })
          .catch(() => ["Duplicate tag(s) found."])

        if (typeof u === "string") return null

        return { id: u.id, tagNotes: tag.tagNotes }
      })
    )

    if (updated.some((t) => t === null)) {
      return { success: false, error: "Duplicate tags are not allowed." }
    }

    return { success: true, data: updated as Success["data"] }
  })

  if (!result.success) return result.error

  for (const { id, tagNotes } of result.data) {
    updateTag("global:tags")
    updateTag(`id:${id}-tags`)
    if (tagNotes.length) {
      updateTag("global:notes")
      for (const { note } of tagNotes) {
        updateTag(`id:${note.id}-notes`)
      }
    }
  }

  redirect("/?toast=tags_updated")
}

export async function deleteTagAction(id: string) {
  await getCurrentUser({ withFullUser: false, redirectIfNotFound: true })

  const result = await db
    .transaction(async (tx) => {
      const tag = await tx.query.TagTable.findFirst({
        columns: { id: true },
        where: (t, f) => f.eq(t.id, id),
        with: {
          tagNotes: {
            columns: { noteId: true, tagId: true },
          },
        },
      })

      if (!tag) throw new Error("Tag not found.")

      const loaded = await Promise.all(
        tag.tagNotes.map(async ({ noteId, tagId }) => {
          const [d] = await tx
            .delete(NoteTagTable)
            .where(
              and(
                eq(NoteTagTable.noteId, noteId),
                eq(NoteTagTable.tagId, tagId)
              )
            )
            .returning({ noteId: NoteTagTable.noteId })
          if (!d) return null
          return d
        })
      )

      if (loaded.some((n) => n === null)) throw new Error("Failed to delete.")

      const deletedTagFromNotes = loaded as { noteId: string }[]

      const [deletedTag] = await tx
        .delete(TagTable)
        .where(eq(TagTable.id, tag.id))
        .returning({ id: TagTable.id })

      if (!deletedTag) throw new Error("Failed to delete.")

      return {
        success: true,
        data: { id: deletedTag.id, tagNotes: deletedTagFromNotes },
      }
    })
    .catch(() => "Failed to delete tag.")

  if (typeof result === "string") return { success: false, error: result }

  updateTag("global:tags")
  updateTag(`id:${result.data.id}-tags`)

  if (result.data.tagNotes.length) {
    updateTag("global:notes")
    for (const { noteId } of result.data.tagNotes) {
      updateTag(`id:${noteId}-notes`)
    }
  }

  return { success: true }
}
