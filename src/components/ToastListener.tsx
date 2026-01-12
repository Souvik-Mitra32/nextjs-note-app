"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function ToastListener() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const type = params.get("toast")
    if (!type) return

    switch (type) {
      case "note_created":
        toast.success("Note created successfully")
        break
      case "note_updated":
        toast.success("Note updated successfully")
        break
      case "note_deleted":
        toast.success("Note deleted successfully")
        break
      case "tags_updated":
        toast.success("Tags updated successfully")
        break
    }

    // remove query param after showing toast
    router.replace(window.location.pathname, { scroll: false })
  }, [params, router])

  return null
}
