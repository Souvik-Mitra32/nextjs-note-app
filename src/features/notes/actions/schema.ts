import z from "zod"

export const noteSchema = z.object({
  title: z.string().min(1, "Required"),
  body: z
    .string()
    .optional()
    .catch(undefined)
    .transform((v) => v ?? null),
})

export type NoteSchema = z.infer<typeof noteSchema>
