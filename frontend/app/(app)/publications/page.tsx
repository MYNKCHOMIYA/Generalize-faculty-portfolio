"use client"

import * as z from "zod"
import { ExternalLink, BookOpen, Quote, Trash2, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"
import { Separator } from "@/components/ui/separator"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  publication_type: z.string().min(1, "Type is required"),
  publication_year: z.coerce.number().int().min(1900).max(2100),
  authors: z.string().optional(),
  journal: z.string().optional(),
  publisher: z.string().optional(),
  issn: z.string().optional(),
  doi: z.string().optional(),
  indexed_in: z.string().optional(),
  citations: z.coerce.number().int().min(0).optional(),
  pdf_url: z.string().optional(),
})

const fields = [
  { name: "title", label: "Title", required: true, placeholder: "Publication title" },
  { name: "publication_type", label: "Type", type: "select" as const, required: true, options: ["Journal Paper", "Conference Paper", "Book", "Book Chapter", "Magazine"] },
  { name: "publication_year", label: "Year", type: "number" as const, required: true, placeholder: "2024" },
  { name: "authors", label: "Authors", placeholder: "A. Sharma, B. Kumar, ..." },
  { name: "journal", label: "Journal / Conference", placeholder: "IEEE Transactions on ..." },
  { name: "publisher", label: "Publisher", placeholder: "IEEE, ACM, Springer..." },
  { name: "issn", label: "ISSN", placeholder: "XXXX-XXXX" },
  { name: "doi", label: "DOI", placeholder: "10.1000/xyz123" },
  { name: "indexed_in", label: "Indexed In", placeholder: "Scopus, SCIE, Web of Science..." },
  { name: "citations", label: "Citation Count", type: "number" as const, placeholder: "0" },
  { name: "pdf_url", label: "PDF URL", type: "url" as const, placeholder: "https://..." },
]

type Publication = {
  id: string
  title: string
  publication_type: string
  publication_year: number
  authors?: string
  journal?: string
  publisher?: string
  issn?: string
  doi?: string
  indexed_in?: string
  citations: number
  pdf_url?: string
}

function PublicationCard({ item, onEdit, onDelete }: { item: Publication; onEdit: (i: Publication) => void; onDelete: (id: string) => void }) {
  const tags = item.indexed_in ? item.indexed_in.split(",").map(s => s.trim()).filter(Boolean) : []
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-2 pt-4 px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <BookOpen className="size-4 text-chart-1 mt-0.5 shrink-0" />
            <h3 className="text-sm font-semibold leading-snug line-clamp-2">{item.title}</h3>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">{item.publication_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-4 space-y-3">
        {item.authors && <p className="text-xs text-muted-foreground">{item.authors}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {item.journal && <span className="font-medium text-foreground/80">{item.journal}</span>}
          <span>{item.publication_year}</span>
          {item.issn && <span>ISSN: {item.issn}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">{t}</Badge>)}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Quote className="size-3" />{item.citations} citations
            </span>
            {item.pdf_url && (
              <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="size-3" /> PDF
              </a>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="size-7" onClick={() => onEdit(item)}><Pencil className="size-3.5" /></Button>
            <Button size="icon" variant="ghost" className="size-7 text-destructive hover:text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="size-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PublicationsPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Publication>
        title="Publications"
        description="Manage your research publications, journal papers, and conference proceedings."
        apiPath="/api/v1/publications/me"
        createPath="/api/v1/publications/"
        deletePath="/api/v1/publications/"
        queryKey="publications"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => (
          <PublicationCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
        )}
        emptyMessage="No publications yet. Add your first research paper."
      />
    </PageTransition>
  )
}
