"use client"

import * as z from "zod"
import { BadgeCheck, CalendarDays, Trash2, Pencil, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  organization: z.string().min(1, "Organization is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  expiry_date: z.string().optional(),
  certificate_url: z.string().optional(),
})

const fields = [
  { name: "name", label: "Certification Name", required: true, placeholder: "Certified Kubernetes Administrator" },
  { name: "organization", label: "Issuing Organization", required: true, placeholder: "Google, AWS, NPTEL..." },
  { name: "issue_date", label: "Issue Date", type: "date" as const, required: true },
  { name: "expiry_date", label: "Expiry Date (optional)", type: "date" as const },
  { name: "certificate_url", label: "Certificate URL", type: "url" as const, placeholder: "https://..." },
]

type Certification = {
  id: string; name: string; organization: string; issue_date: string
  expiry_date?: string; certificate_url?: string
}

function isExpired(expiry?: string) {
  if (!expiry) return false
  return new Date(expiry) < new Date()
}

function CertificationCard({ item, onEdit, onDelete }: { item: Certification; onEdit: (i: Certification) => void; onDelete: (id: string) => void }) {
  const expired = isExpired(item.expiry_date)
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${expired ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
          <BadgeCheck className={`size-5 ${expired ? "text-red-600" : "text-emerald-600"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.organization}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3" />Issued: {item.issue_date?.slice(0, 7)}
                </span>
                {item.expiry_date && (
                  <span className={`text-xs ${expired ? "text-destructive" : "text-muted-foreground"}`}>
                    Expires: {item.expiry_date?.slice(0, 7)}
                  </span>
                )}
              </div>
              {item.certificate_url && (
                <a href={item.certificate_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                  <ExternalLink className="size-3" /> View Certificate
                </a>
              )}
            </div>
            <Badge className={`text-[10px] border-0 shrink-0 ${expired ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600"}`}>
              {expired ? "Expired" : "Active"}
            </Badge>
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

export default function CertificationsPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Certification>
        title="Certifications"
        description="Manage your professional certifications and credentials."
        apiPath="/api/certifications/"
        createPath="/api/certifications/"
        deletePath="/api/certifications/"
        queryKey="certifications"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <CertificationCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No certifications yet. Add your credentials."
      />
    </PageTransition>
  )
}
