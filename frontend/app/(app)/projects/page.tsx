"use client"

import * as z from "zod"
import { ExternalLink, FlaskConical, CalendarDays, Trash2, Pencil, Users2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.string().min(1, "Status is required"),
  funding_agency: z.string().optional(),
  budget: z.coerce.number().min(0).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  team_members: z.string().optional(),
  project_documents_url: z.string().optional(),
})

const fields = [
  { name: "title", label: "Project Title", required: true, placeholder: "Project name" },
  { name: "status", label: "Status", type: "select" as const, required: true, options: ["Ongoing", "Completed", "Sanctioned", "Submitted"] },
  { name: "funding_agency", label: "Funding Agency", placeholder: "DST, SERB, AICTE..." },
  { name: "budget", label: "Budget (₹)", type: "number" as const, placeholder: "0" },
  { name: "start_date", label: "Start Date", type: "date" as const },
  { name: "end_date", label: "End Date", type: "date" as const },
  { name: "team_members", label: "Team Members", placeholder: "Dr. A Sharma, Dr. B Kumar, ..." },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Brief description of the project..." },
  { name: "project_documents_url", label: "Documents URL", type: "url" as const, placeholder: "https://..." },
]

type Project = {
  id: string; title: string; status: string; funding_agency?: string; budget?: number
  start_date?: string; end_date?: string; team_members?: string; project_documents_url?: string; description?: string
}

const statusColor: Record<string, string> = {
  Ongoing: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  Completed: "bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800",
  Sanctioned: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
  Submitted: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800",
}

function ProjectCard({ item, onEdit, onDelete }: { item: Project; onEdit: (i: Project) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <FlaskConical className="size-4 text-chart-2 mt-0.5 shrink-0" />
            <h3 className="text-sm font-semibold leading-snug line-clamp-2">{item.title}</h3>
          </div>
          <Badge className={`shrink-0 text-xs border ${statusColor[item.status] || ""}`}>{item.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        {item.funding_agency && <p className="text-xs text-muted-foreground">{item.funding_agency}{item.budget ? ` · ₹${(item.budget / 100000).toFixed(1)}L` : ""}</p>}
        {item.team_members && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users2 className="size-3" />{item.team_members}
          </p>
        )}
        {(item.start_date || item.end_date) && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3" />
            {item.start_date?.slice(0, 7)} {item.end_date ? `→ ${item.end_date?.slice(0, 7)}` : "→ Present"}
          </p>
        )}
        {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
        <div className="flex items-center justify-between pt-1">
          {item.project_documents_url ? (
            <a href={item.project_documents_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="size-3" /> Documents
            </a>
          ) : <span />}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="size-7" onClick={() => onEdit(item)}><Pencil className="size-3.5" /></Button>
            <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="size-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProjectsPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Project>
        title="Research Projects"
        description="Manage your funded and collaborative research projects."
        apiPath="/api/v1/projects/me"
        createPath="/api/v1/projects/"
        deletePath="/api/v1/projects/"
        queryKey="projects"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <ProjectCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No projects yet. Add your first research project."
      />
    </PageTransition>
  )
}
