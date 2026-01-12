"use client"

import { useTransition } from "react"

import { Trash2 } from "lucide-react"

import { Button } from "./ui/button"
import { ButtonIcon } from "@/lib/types"

export function DeleteButton({
  id,
  onClick,
  icon = "none",
}: {
  id: string
  onClick: (id: string) => Promise<string>
  icon?: ButtonIcon
}) {
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    startTransition(async () => {
      await onClick(id)
    })
  }

  return (
    <Button
      variant="destructiveOutline"
      onClick={handleDelete}
      disabled={isPending}
    >
      {(icon === "leading" || icon === "only") && <Trash2 />}
      {icon !== "only" ? (isPending ? "Deleting" : "Delete") : null}
      {icon === "trailing" && <Trash2 />}
    </Button>
  )
}
