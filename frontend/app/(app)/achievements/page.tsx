"use client"

import * as z from "zod"
import { Award, CalendarDays, Trash2, Pencil } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CrudModule } from "@/components/crud-module"
import { PageTransition } from "@/components/motion"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  achievement_date: z.string().optional(),
  description: z.string().optional(),
})

const fields = [
  { name: "title", label: "Achievement Title", required: true, placeholder: "Best Paper Award" },
  { name: "category", label: "Category", type: "select" as const, required: true, options: ["Best Paper Award", "Research Award", "Teaching Award", "Fellowship", "Recognition", "Other"] },
  { name: "achievement_date", label: "Date Received", type: "date" as const },
  { name: "description", label: "Description", type: "textarea" as const, placeholder: "Describe the achievement..." },
]

type Achievement = {
  id: string; title: string; category: string; achievement_date?: string; description?: string
}

const catColor: Record<string, string> = {
  "Best Paper Award": "bg-yellow-500/10 text-yellow-600",
  "Research Award": "bg-blue-500/10 text-blue-600",
  "Teaching Award": "bg-emerald-500/10 text-emerald-600",
  "Fellowship": "bg-purple-500/10 text-purple-600",
  "Recognition": "bg-sky-500/10 text-sky-600",
  "Other": "bg-muted text-muted-foreground",
}

function AchievementCard({ item, onEdit, onDelete }: { item: Achievement; onEdit: (i: Achievement) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="rounded-2xl border-border/70 group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5 flex gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
          <Award className="size-5 text-yellow-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">{item.title}</p>
              {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              {item.achievement_date && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="size-3" />{item.achievement_date?.slice(0, 7)}
                </span>
              )}
              <Badge className={`text-[10px] border-0 ${catColor[item.category] || catColor.Other}`}>{item.category}</Badge>
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

export default function AchievementsPage() {
  return (
    <PageTransition className="mx-auto max-w-5xl">
      <CrudModule<Achievement>
        title="Achievements & Awards"
        description="Manage your awards, recognitions, and fellowships."
        apiPath="/api/v1/achievements/me"
        createPath="/api/v1/achievements/"
        deletePath="/api/v1/achievements/"
        queryKey="achievements"
        schema={schema}
        fields={fields}
        renderCard={(item, onEdit, onDelete) => <AchievementCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />}
        emptyMessage="No achievements yet. Add your awards and recognitions."
      />
    </PageTransition>
  )
}
