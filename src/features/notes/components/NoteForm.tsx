"use client"

import { Suspense, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"

import { NoteSchema, noteSchema } from "../actions/schema"
import { addNoteAction, editNoteAction } from "../actions/action"

import { Button } from "../../../components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Option,
  CreatableMultiSelectSkeleton,
} from "@/components/CreatableMultiSelect"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
const CreatableMultiSelect = dynamic(
  () =>
    import("@/components/CreatableMultiSelect").then(
      (m) => m.CreatableMultiSelect
    ),
  { ssr: false, loading: () => <CreatableMultiSelectSkeleton /> }
)

type Props = {
  defaultValues?: {
    id: string
    title: string
    body: string | null
    tags: Option[]
  }
  tagOptions: Option[]
}

export function NoteForm(props: Props) {
  const pathname = usePathname()
  return <_NoteForm key={pathname} {...props} />
}

function _NoteForm({ defaultValues, tagOptions }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      body: defaultValues?.body ?? "",
      tags: defaultValues?.tags ?? [],
    },
  })

  function onSubmit(data: NoteSchema) {
    const action = defaultValues
      ? editNoteAction(defaultValues.id, data)
      : addNoteAction(data)

    startTransition(async () => {
      const error = await action
      setError(error)
    })
  }

  return (
    <form className="w-full max-w-md" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        {error && <FieldError>{error}</FieldError>}

        <FieldGroup>
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Note title"
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="tags"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                <CreatableMultiSelect
                  {...field}
                  options={tagOptions}
                  value={field.value}
                  onChange={field.onChange}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="body"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Body</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  placeholder="Write something about your note..."
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Field orientation="horizontal">
            <Button type="submit" disabled={isPending}>
              {defaultValues
                ? isPending
                  ? "Saving"
                  : "Save"
                : isPending
                ? "Adding"
                : "Add"}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={isPending}
              asChild
            >
              <Link href=".">Cancel</Link>
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}

export function NoteFormSkeleton() {
  return (
    <form>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input placeholder="Loading..." disabled />
          </Field>

          <Field>
            <FieldLabel>Tags</FieldLabel>
            <CreatableMultiSelectSkeleton />
          </Field>

          <Field>
            <FieldLabel>Body</FieldLabel>
            <Textarea placeholder="Loading..." disabled />
          </Field>

          <Field orientation="horizontal">
            <Button disabled>Save</Button>
            <Button variant="outline" type="button" disabled asChild>
              <Link href=".">Cancel</Link>
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  )
}
