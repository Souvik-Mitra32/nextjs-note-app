import { NoteForm } from "@/features/notes/components/NoteForm"

export default function AddNotePage() {
  return (
    <>
      <div className="flex flex-wrap justify-between gap-4">
        <h1 className="text-3xl font-semibold">Add note</h1>
      </div>

      <NoteForm />
    </>
  )
}
