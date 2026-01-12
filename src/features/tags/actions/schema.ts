import z from "zod"

export const tagSchema = z.record(
  z.uuid(),
  z.string().min(1, "Name is required")
)

export type TagSchema = z.infer<typeof tagSchema>
