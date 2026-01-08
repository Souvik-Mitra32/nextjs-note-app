import Link from "next/link"
import { Suspense } from "react"

import { getCurrentUser } from "@/features/auth/lib/currentUser"

import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/features/auth/components/LogoutButton"
import {
  NoteList,
  NoteListSkeleton,
} from "@/features/notes/components/NoteList"

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

          <LogoutButton />
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

  return <h1 className="text-3xl font-semibold">Hi, {user.name}</h1>
}
