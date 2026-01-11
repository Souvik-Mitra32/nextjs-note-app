import { cacheTag } from "next/cache"
import { db } from "@/drizzle/db"

export async function getNotesByUserId(userId: string) {
  "use cache"
  cacheTag("global:notes")

  return db.query.NoteTable.findMany({
    columns: { id: true, title: true, body: true },
    where: (t, f) => f.eq(t.userId, userId),
    with: {
      noteTags: {
        columns: {},
        with: {
          tag: {
            columns: { id: true, name: true },
          },
        },
      },
    },
    orderBy: (t, f) => f.desc(t.updatedAt),
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
    with: {
      noteTags: {
        columns: {},
        with: {
          tag: {
            columns: { id: true, name: true },
          },
        },
      },
    },
  })
}
