import { cacheTag } from "next/cache"
import { db } from "@/drizzle/db"

export async function getTagsByUserId(userId: string) {
  "use cache"
  cacheTag("global:tags")

  return db.query.TagTable.findMany({
    columns: { id: true, name: true },
    where: (t, f) => f.eq(t.userId, userId),
    with: {
      tagNotes: {
        columns: {},
        with: {
          note: {
            columns: { id: true, title: true, body: true },
          },
        },
      },
    },
    orderBy: (t, f) => f.desc(t.updatedAt),
  })
}

export async function getTagById(id: string) {
  "use cache"
  cacheTag(`id:${id}-tags`)

  return db.query.TagTable.findFirst({
    columns: {
      id: true,
      name: true,
    },
    where: (t, f) => f.eq(t.id, id),
    with: {
      tagNotes: {
        columns: {},
        with: {
          note: {
            columns: { id: true, title: true, body: true },
          },
        },
      },
    },
  })
}
