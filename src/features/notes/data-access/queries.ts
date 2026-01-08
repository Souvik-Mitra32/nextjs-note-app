import { db } from "@/drizzle/db"
import { cacheTag } from "next/cache"

export async function getNotesByUserId(userId: string) {
  "use cache"
  cacheTag("global:notes")

  return db.query.NoteTable.findMany({
    columns: { id: true, title: true, body: true },
    where: (t, f) => f.eq(t.userId, userId),
  })
}

export async function getNoteById(id: string) {
  "use cache"
  cacheTag(`id:${id}-notes`)

  return db.query.NoteTable.findFirst({
    columns: {
      id: true,
      title: true,
      body: true,
    },
    where: (t, f) => f.eq(t.id, id),
  })
}
