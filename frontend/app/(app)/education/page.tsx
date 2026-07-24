"use client"

import * as z from "zod"
import { GraduationCap, CalendarDays, Trash2, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  field_of_study: z.string().min(1, "Field is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  grade: z.string().optional(),
})

const fields = [
  { name: "degree", label: "Degree", required: true, placeholder: "Ph.D., M.Tech, B.E., ..." },
  { name: "institution", label: "Institution / University", required: true, placeholder: "IIT Bombay" },
  { name: "field_of_study", label: "Field of Study", required: true, placeholder: "Computer Science" },
  { name: "start_date", label: "Start Date", type: "date" as const, required: true },
  { name: "end_date", label: "End Date (leave blank if ongoing)", type: "date" as const },
  { name: "grade", label: "Grade / CGPA / Percentage", placeholder: "9.2 / 10" },
]

type Education = {
  id: string; degree: string; institution: string; field_of_study: string
  start_date: string; end_date?: string; grade?: string
}

function EducationCard({ item, onEdit, onDelete }: { item: Education; onEdit: (i: Education) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-1/10">
          <GraduationCap className="size-5 text-chart-1" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{item.degree}</p>
              <p className="text-xs text-muted-foreground">{item.institution}</p>
              <p className="text-xs text-muted-foreground">{item.field_of_study}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3" />
                {item.start_date?.slice(0, 7)} {item.end_date ? `– ${item.end_date?.slice(0, 7)}` : "– Present"}
              </span>
              {item.grade && <Badge variant="secondary" className="text-xs">{item.grade}</Badge>}
            </div>
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

export default function EducationPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Education>
        title="Education"
        description="Manage your academic qualifications and degrees."
        apiPath="/api/v1/education/me"
        createPath="/api/v1/education/"
        deletePath="/api/v1/education/"
        queryKey="education"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <EducationCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No education records. Add your qualifications."
      />
    </PageTransition>
  )
}
