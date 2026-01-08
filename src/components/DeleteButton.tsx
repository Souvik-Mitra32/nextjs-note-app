"use client"

import { useTransition } from "react"

import { Trash2 } from "lucide-react"

import { Button } from "./ui/button"

export function DeleteButton({
  id,
  onClick,
}: {
  id: string
  onClick: (id: string) => Promise<string>
}) {
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    startTransition(async () => {
      await onClick(id)
    })
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
      <Trash2 />
      {isPending ? "Deleting" : "Delete"}
    </Button>
  )
}
