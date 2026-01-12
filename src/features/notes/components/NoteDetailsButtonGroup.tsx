"use client"

import { useTransition } from "react"
import Link from "next/link"

import { deleteNoteAction } from "../actions/action"

import { Button } from "@/components/ui/button"
import { DeleteButton } from "@/components/DeleteButton"

export function NoteDetailsButtonGroup({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteNoteAction(id)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button disabled={isPending} asChild>
        <Link href={`/${id}/edit-note`}>Edit</Link>
      </Button>

      <DeleteButton onClick={() => handleDelete(id)} isLoading={isPending} />

      <Button variant="outline" disabled={isPending} asChild>
        <Link href=".">Back</Link>
      </Button>
    </div>
  )
}
