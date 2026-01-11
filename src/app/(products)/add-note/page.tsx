import { Suspense } from "react"

import { getCurrentUser } from "@/features/auth/lib/currentUser"
import { getTagsByUserId } from "@/features/tags/data-access/queries"

import { NoteForm } from "@/features/notes/components/NoteForm"

export default function AddNotePage() {
  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-3xl font-semibold">Add note</h1>
      </div>

      <Suspense>
        <SuspendedNoteForm />
      </Suspense>
    </>
  )
}

async function SuspendedNoteForm() {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: true,
  })

  const tags = await getTagsByUserId(user.id)
  const tagOptions = tags.map((tag) => ({ label: tag.name, value: tag.id }))

  return <NoteForm tagOptions={tagOptions} />
}
