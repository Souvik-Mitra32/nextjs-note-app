"use client"

import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { logoutAction } from "../actions/action"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => await logoutAction())
  }

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isPending}>
      {isPending ? "Logging out..." : "Log out"}
    </Button>
  )
}
