import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"

import { deleteNoteAction } from "@/features/notes/actions/action"

import { getNoteById } from "@/features/notes/data-access/queries"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DeleteButton } from "@/components/DeleteButton"

type Props = { params: Promise<{ noteId: string }> }

export default function NoteDetailsPage(props: Props) {
  return (
    <Suspense fallback={<NoteDetailsSkeleton />}>
      <NoteDetails {...props} />
    </Suspense>
  )
}

async function NoteDetails({ params }: Props) {
  const { noteId } = await params
  const note = await getNoteById(noteId)

  if (!note) return notFound()

  return (
    <>
      <div className="flex flex-wrap justify-between items-start gap-4">
        <h1 className="text-3xl font-semibold max-w-[40%]">{note.title}</h1>

        <div className="flex flex-wrap items-center gap-2 md:flex-row">
          <Button asChild>
            <Link href={`/${note.id}/edit-note`}>Edit</Link>
          </Button>

          <DeleteButton id={note.id} onClick={deleteNoteAction} />

          <Button variant="outline" asChild>
            <Link href=".">Back</Link>
          </Button>
        </div>
      </div>

      {note.body && <p>{note.body}</p>}
    </>
  )
}

function NoteDetailsSkeleton() {
  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <Skeleton className="h-7.5 w-[30%]" />

        <div className="flex flex-wrap items-center gap-2 md:flex-row">
          <Button disabled>Edit</Button>

          <Button variant="destructive" disabled>
            <Trash2 />
            Delete
          </Button>

          <Button variant="outline">
            <Link href=".">Back</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[70%]" />
      </div>
    </>
  )
}
