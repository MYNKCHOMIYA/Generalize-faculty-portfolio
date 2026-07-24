"use client"

import * as z from "zod"
import { Briefcase, CalendarDays, Trash2, Pencil, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  organization: z.string().min(1, "Organization is required"),
  employment_type: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  is_current: z.boolean().optional(),
  description: z.string().optional(),
})

const fields = [
  { name: "job_title", label: "Job Title", required: true, placeholder: "Associate Professor" },
  { name: "organization", label: "Organization", required: true, placeholder: "University / Company" },
  { name: "employment_type", label: "Employment Type", type: "select" as const, options: ["Full-time", "Part-time", "Contract", "Visiting", "Consultant", "Intern"] },
  { name: "start_date", label: "Start Date", type: "date" as const, required: true },
  { name: "end_date", label: "End Date (leave blank if current)", type: "date" as const },
  { name: "description", label: "Responsibilities", type: "textarea" as const, placeholder: "Key responsibilities and achievements..." },
]

type Experience = {
  id: string; job_title: string; organization: string; employment_type?: string
  start_date: string; end_date?: string; is_current?: boolean; description?: string
}

const empTypeColor: Record<string, string> = {
  "Full-time": "bg-emerald-500/10 text-emerald-600",
  "Part-time": "bg-blue-500/10 text-blue-600",
  "Contract": "bg-amber-500/10 text-amber-600",
  "Visiting": "bg-purple-500/10 text-purple-600",
  "Consultant": "bg-orange-500/10 text-orange-600",
  "Intern": "bg-sky-500/10 text-sky-600",
}

function ExperienceCard({ item, onEdit, onDelete }: { item: Experience; onEdit: (i: Experience) => void; onDelete: (id: string) => void }) {
  const isOngoing = !item.end_date || item.is_current
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-chart-2/10">
          <Briefcase className="size-5 text-chart-2" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{item.job_title}</p>
              <p className="text-xs text-muted-foreground font-medium">{item.organization}</p>
              {item.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3" />
                {item.start_date?.slice(0, 7)} → {isOngoing ? "Present" : item.end_date?.slice(0, 7)}
              </span>
              {item.employment_type && (
                <Badge className={`text-[10px] border-0 ${empTypeColor[item.employment_type] || ""}`}>{item.employment_type}</Badge>
              )}
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

export default function ExperiencePage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Experience>
        title="Experience"
        description="Manage your professional work history and academic positions."
        apiPath="/api/v1/experience/me"
        createPath="/api/v1/experience/"
        deletePath="/api/v1/experience/"
        queryKey="experience"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <ExperienceCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No experience records. Add your work history."
      />
    </PageTransition>
  )
}
