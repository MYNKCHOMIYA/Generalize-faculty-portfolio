"use client"

import * as z from "zod"
import { FileText, CalendarDays, Trash2, Pencil, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  patent_number: z.string().min(1, "Patent number is required"),
  inventors: z.string().min(1, "Inventors are required"),
  filing_date: z.string().min(1, "Filing date is required"),
  status: z.string().min(1, "Status is required"),
  link_url: z.string().optional(),
})

const fields = [
  { name: "title", label: "Patent Title", required: true, placeholder: "Method for Adaptive Consensus..." },
  { name: "patent_number", label: "Patent Number", required: true, placeholder: "IN 456789" },
  { name: "inventors", label: "Inventors", required: true, placeholder: "A. Sharma, R. Menon" },
  { name: "filing_date", label: "Filing Date", type: "date" as const, required: true },
  { name: "status", label: "Status", type: "select" as const, required: true, options: ["filed", "granted", "published", "abandoned"] },
  { name: "link_url", label: "Patent Link", type: "url" as const, placeholder: "https://..." },
]

type Patent = {
  id: string; title: string; patent_number: string; inventors: string
  filing_date: string; status: string; link_url?: string
}

const statusColor: Record<string, string> = {
  filed: "bg-amber-500/10 text-amber-600",
  granted: "bg-emerald-500/10 text-emerald-600",
  published: "bg-blue-500/10 text-blue-600",
  abandoned: "bg-red-500/10 text-red-600",
}

function PatentCard({ item, onEdit, onDelete }: { item: Patent; onEdit: (i: Patent) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
          <FileText className="size-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{item.patent_number}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.inventors}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3" />{item.filing_date?.slice(0, 7)}
                </span>
                {item.link_url && (
                  <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="size-3" /> View
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge className={`text-[10px] border-0 capitalize ${statusColor[item.status] || ""}`}>{item.status}</Badge>
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

export default function PatentsPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Patent>
        title="Patents"
        description="Manage your patent filings, grants, and publications."
        apiPath="/api/patents/"
        createPath="/api/patents/"
        deletePath="/api/patents/"
        queryKey="patents"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <PatentCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No patents yet. Add your first patent filing."
      />
    </PageTransition>
  )
}
