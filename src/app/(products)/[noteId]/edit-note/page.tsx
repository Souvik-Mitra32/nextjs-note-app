import { Suspense } from "react"
import { notFound } from "next/navigation"

import { getNoteById } from "@/features/notes/data-access/queries"

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
  const { noteId } = await params
  const note = await getNoteById(noteId)

  if (!note) return notFound()

  return <NoteForm defaultValues={note} />
}
