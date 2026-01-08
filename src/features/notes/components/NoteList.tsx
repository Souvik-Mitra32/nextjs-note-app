import Link from "next/link"
import { db } from "@/drizzle/db"

import { getCurrentUser } from "@/features/auth/lib/currentUser"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

export async function NoteList() {
  const user = await getCurrentUser({
    withFullUser: false,
    redirectIfNotFound: true,
  })
  const notes = await db.query.NoteTable.findMany({
    columns: { id: true, title: true, body: true },
    where: (t, f) => f.eq(t.userId, user.id),
  })

  return notes.length === 0 ? (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No notes yet</EmptyTitle>
        <EmptyDescription>
          You have not added any notes yet. Let's add your first note.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" asChild>
          <Link href="/add-note">Add note</Link>
        </Button>
      </EmptyContent>
    </Empty>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {notes.map((note) => (
        <Link key={note.id} href={`/${note.id}`}>
          <NoteCard {...note} />
        </Link>
      ))}
    </div>
  )
}

function NoteCard({ title, body }: { title: string; body: string | null }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {body && <p className="line-clamp-2">{body}</p>}
      </CardContent>
    </Card>
  )
}

export function NoteListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-[40%]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[70%]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
