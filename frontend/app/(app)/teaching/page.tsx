"use client"

import * as z from "zod"
import { Lightbulb, Hash, Trash2, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  course_name: z.string().min(1, "Course name is required"),
  subject_code: z.string().min(1, "Subject code is required"),
  semester: z.string().min(1, "Semester is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  credits: z.coerce.number().int().min(1).max(10),
})

const fields = [
  { name: "course_name", label: "Course Name", required: true, placeholder: "Advanced Algorithms" },
  { name: "subject_code", label: "Subject Code", required: true, placeholder: "CS601" },
  { name: "semester", label: "Semester", type: "select" as const, required: true, options: ["Odd", "Even", "Both", "Summer"] },
  { name: "academic_year", label: "Academic Year", required: true, placeholder: "2024-25" },
  { name: "credits", label: "Credits", type: "number" as const, required: true, placeholder: "3" },
]

type Teaching = {
  id: string; course_name: string; subject_code: string; semester: string; academic_year: string; credits: number
}

function TeachingCard({ item, onEdit, onDelete }: { item: Teaching; onEdit: (i: Teaching) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
          <Lightbulb className="size-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{item.course_name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 font-mono">
                <Hash className="size-3" />{item.subject_code}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.academic_year} · {item.semester} Semester</p>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">{item.credits} Credits</Badge>
          </div>
        </div>
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button size="icon" variant="ghost" className="size-7" onClick={() => onEdit(item)}><Pencil className="size-3.5" /></Button>
          <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="size-3.5" /></Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TeachingPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Teaching>
        title="Teaching"
        description="Manage the courses you teach each semester."
        apiPath="/api/teaching/"
        createPath="/api/teaching/"
        deletePath="/api/teaching/"
        queryKey="teaching"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <TeachingCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No teaching records. Add courses you are teaching."
      />
    </PageTransition>
  )
}
