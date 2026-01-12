import Link from "next/link"
import { Suspense } from "react"

import { getCurrentUser } from "@/features/auth/lib/currentUser"

import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/components/LogoutButton"
import { TagDialog } from "@/features/tags/components/TagDialog"
import {
  NoteList,
  NoteListSkeleton,
} from "@/features/notes/components/NoteList"
import { db } from "@/drizzle/db"

export default function HomePage() {
  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <Suspense fallback={<h1 className="text-3xl font-semibold">Hi</h1>}>
          <PageTitleWithUsername />
        </Suspense>

        <div className="flex flex-wrap items-center gap-2 md:flex-row">
          <Button asChild>
            <Link href="/add-note">Add note</Link>
          </Button>

          <Suspense /*{TODO: Add fallback}*/>
            <TagDialogButton />
          </Suspense>

          <LogoutButton icon="only" />
        </div>
      </div>

      <Suspense fallback={<NoteListSkeleton />}>
        <NoteList />
      </Suspense>
    </>
  )
}

async function PageTitleWithUsername() {
  const user = await getCurrentUser({
    withFullUser: true,
    redirectIfNotFound: true,
  })

  return (
    <h1 className="text-3xl font-semibold max-w-[15ch] xs:max-w-[10ch] truncate">
      Hi, {user.name.split(" ")[0]}
    </h1>
  )
}

async function TagDialogButton() {
  const user = await getCurrentUser({
    withFullUser: true,
    redirectIfNotFound: true,
  })

  const tags = await db.query.TagTable.findMany({
    columns: { id: true, name: true },
    where: (t, f) => f.eq(t.userId, user.id),
  })

  return <TagDialog tags={tags} />
}
