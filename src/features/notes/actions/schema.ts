import z from "zod"

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z
    .string()
    .optional()
    .catch(undefined)
    .transform((v) => v ?? null),
  tags: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
})

export type NoteSchema = z.infer<typeof noteSchema>
