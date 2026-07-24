"use client"

import * as z from "zod"
import { Presentation, CalendarDays, Trash2, Pencil, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  event_name: z.string().min(1, "Event name is required"),
  organizer: z.string().min(1, "Organizer is required"),
  event_date: z.string().min(1, "Event date is required"),
  certificate_url: z.string().optional(),
})

const fields = [
  { name: "event_name", label: "Event / Workshop Name", required: true, placeholder: "Faculty Development Programme on AI..." },
  { name: "organizer", label: "Organizer", required: true, placeholder: "AICTE, IIT Bombay, NPTEL..." },
  { name: "event_date", label: "Event Date", type: "date" as const, required: true },
  { name: "certificate_url", label: "Certificate URL", type: "url" as const, placeholder: "https://..." },
]

type Workshop = {
  id: string; event_name: string; organizer: string; event_date: string; certificate_url?: string
}

function WorkshopCard({ item, onEdit, onDelete }: { item: Workshop; onEdit: (i: Workshop) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
          <Presentation className="size-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{item.event_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{item.organizer}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3" />{item.event_date?.slice(0, 10)}
            </span>
            {item.certificate_url && (
              <a href={item.certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="size-3" /> Certificate
              </a>
            )}
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

export default function WorkshopsPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Workshop>
        title="Workshops & FDPs"
        description="Manage workshops, faculty development programs, and seminars attended."
        apiPath="/api/workshops/"
        createPath="/api/workshops/"
        deletePath="/api/workshops/"
        queryKey="workshops"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <WorkshopCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No workshops recorded. Add workshops and FDPs you attended."
      />
    </PageTransition>
  )
}
