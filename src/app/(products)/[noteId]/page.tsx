import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"

import { db } from "@/drizzle/db"
import { deleteNoteAction } from "@/features/notes/actions/action"

import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/components/DeleteButton"

type Props = { params: Promise<{ noteId: string }> }

export default function NoteDetailsPage(props: Props) {
  return (
    <Suspense>
      <NoteDetails {...props} />
    </Suspense>
  )
}

async function NoteDetails({ params }: Props) {
  const { noteId } = await params
  const note = await db.query.NoteTable.findFirst({
    columns: {
      id: true,
      title: true,
      body: true,
    },
    where: (t, f) => f.eq(t.id, noteId),
  })

  if (!note) return notFound()

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-3xl font-semibold">{note.title}</h1>

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
