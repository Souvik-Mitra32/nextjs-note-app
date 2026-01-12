"use client"

import { Trash2 } from "lucide-react"

import { Button } from "./ui/button"
import { ButtonIcon } from "@/lib/types"

export function DeleteButton({
  onClick,
  icon = "none",
  isLoading = false,
}: {
  onClick: () => void
  icon?: ButtonIcon
  isLoading?: boolean
}) {
  return (
    <Button variant="destructiveOutline" onClick={onClick} disabled={isLoading}>
      {(icon === "leading" || icon === "only") && <Trash2 />}
      {icon !== "only" ? (isLoading ? "Deleting" : "Delete") : null}
      {icon === "trailing" && <Trash2 />}
    </Button>
  )
}
