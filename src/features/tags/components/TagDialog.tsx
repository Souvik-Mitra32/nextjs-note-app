"use client"

import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError } from "@/components/ui/field"
import { DeleteButton } from "@/components/DeleteButton"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { TagSchema, tagSchema } from "../actions/schema"
import { deleteTagAction, editTagsBatchAction } from "../actions/action"

export function TagDialog({ tags }: { tags: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const defaultValues = Object.fromEntries(tags.map((t) => [t.id, t.name]))
  const form = useForm({
    resolver: zodResolver(tagSchema),
    defaultValues,
    shouldUnregister: true,
  })

  function onSubmit(data: TagSchema) {
    startTransition(async () => {
      const error = await editTagsBatchAction(data)
      setError(error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit tags</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {tags.length === 0 ? "Not tags" : "Edit tags"}
          </DialogTitle>
          <DialogDescription>
            {tags.length === 0
              ? "Create tag during adding a note."
              : "Make changes to your tags here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>

        {tags.length > 0 && (
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {error && <FieldError>{error}</FieldError>}

            {tags.map((tag, index) => (
              <div key={tag.id} className="flex gap-4 items-center">
                <Controller
                  name={tag.id}
                  control={form.control}
                  defaultValue={tag.name}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        placeholder="Tag name"
                        aria-invalid={fieldState.invalid}
                        autoFocus={index === 0}
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <DeleteButton
                  id={tag.id}
                  onClick={deleteTagAction}
                  icon="only"
                />
              </div>
            ))}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
