"use client"

import { useTransition } from "react"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

import { logoutAction } from "../actions/action"
import { ButtonIcon } from "@/lib/types"

export function LogoutButton({ icon = "none" }: { icon?: ButtonIcon }) {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => await logoutAction())
  }

  return (
    <Button
      variant="destructiveOutline"
      onClick={handleLogout}
      disabled={isPending}
    >
      {(icon === "leading" || icon === "only") && <LogOut />}
      {icon !== "only" ? (isPending ? "Logging out" : "Log out") : null}
      {icon === "trailing" && <LogOut />}
    </Button>
  )
}
