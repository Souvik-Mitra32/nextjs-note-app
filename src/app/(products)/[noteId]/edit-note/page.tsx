import { Suspense } from "react"
import { notFound } from "next/navigation"

import { getCurrentUser } from "@/features/auth/lib/currentUser"
import { getNoteById } from "@/features/notes/data-access/queries"
import { getTagsByUserId } from "@/features/tags/data-access/queries"

import {
  NoteForm,
  NoteFormSkeleton,
} from "@/features/notes/components/NoteForm"

type Props = {
  params: Promise<{ noteId: string }>
}

export default function EditNotePage(props: Props) {
  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-3xl font-semibold">Edit note</h1>
      </div>

      <Suspense fallback={<NoteFormSkeleton />}>
        <NoteFormWithDefaultValues {...props} />
      </Suspense>
    </>
  )
}

async function NoteFormWithDefaultValues({ params }: Props) {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: true,
  })

  const { noteId } = await params
  const [note, tags] = await Promise.all([
    getNoteById(noteId),
    getTagsByUserId(user.id),
  ])

  if (!note) return notFound()

  const tagOptions = tags.map((tag) => ({ label: tag.name, value: tag.id }))
  const selectedTags = note.noteTags.map(({ tag }) => ({
    label: tag.name,
    value: tag.id,
  }))

  return (
    <NoteForm
      defaultValues={{ ...note, tags: selectedTags }}
      tagOptions={tagOptions}
    />
  )
}
