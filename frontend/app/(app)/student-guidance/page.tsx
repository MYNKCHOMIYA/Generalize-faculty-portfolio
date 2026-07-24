"use client"

import * as z from "zod"
import { Users2, BookOpen, Trash2, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  student_name: z.string().min(1, "Student name is required"),
  project_title: z.string().min(1, "Project title is required"),
  degree: z.string().min(1, "Degree is required"),
  year: z.coerce.number().int().min(2000).max(2100),
  status: z.string().min(1, "Status is required"),
})

const fields = [
  { name: "student_name", label: "Student Name", required: true, placeholder: "Student Full Name" },
  { name: "degree", label: "Degree", type: "select" as const, required: true, options: ["B.Tech", "M.Tech", "MBA", "Ph.D.", "M.Sc", "Other"] },
  { name: "project_title", label: "Project / Thesis Title", required: true, placeholder: "Research project title" },
  { name: "year", label: "Year", type: "number" as const, required: true, placeholder: "2024" },
  { name: "status", label: "Status", type: "select" as const, required: true, options: ["ongoing", "completed", "submitted"] },
]

type StudentGuidance = {
  id: string; student_name: string; project_title: string; degree: string; year: number; status: string
}

const statusColor: Record<string, string> = {
  ongoing: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  submitted: "bg-amber-500/10 text-amber-600",
}

function StudentGuidanceCard({ item, onEdit, onDelete }: { item: StudentGuidance; onEdit: (i: StudentGuidance) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
          <Users2 className="size-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{item.student_name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <BookOpen className="size-3" />{item.project_title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.degree} · {item.year}</p>
            </div>
            <Badge className={`shrink-0 text-[10px] border-0 capitalize ${statusColor[item.status] || ""}`}>{item.status}</Badge>
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

export default function StudentGuidancePage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<StudentGuidance>
        title="Student Guidance"
        description="Manage the students you supervise for projects and theses."
        apiPath="/api/student-guidance/"
        createPath="/api/student-guidance/"
        deletePath="/api/student-guidance/"
        queryKey="student-guidance"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <StudentGuidanceCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No student guidance records. Add students you supervise."
      />
    </PageTransition>
  )
}
