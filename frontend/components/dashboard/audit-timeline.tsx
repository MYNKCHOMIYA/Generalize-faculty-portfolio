"use client"

import { motion } from "framer-motion"
import { BookOpen, FlaskConical, Lock, ShieldCheck, UserRound, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

const meta: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  security: { icon: Lock, color: "text-destructive", bg: "bg-destructive/10" },
  profile: { icon: UserRound, color: "text-chart-1", bg: "bg-chart-1/10" },
  publication: { icon: BookOpen, color: "text-chart-2", bg: "bg-chart-2/10" },
  project: { icon: FlaskConical, color: "text-chart-3", bg: "bg-chart-3/10" },
  system: { icon: ShieldCheck, color: "text-muted-foreground", bg: "bg-muted" },
}

export function AuditTimeline({ className }: { className?: string }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => {
      const res = await api.get("/api/activity?limit=6")
      return res.data.map((log: any) => {
        let category = "system"
        if (log.action.toLowerCase().includes("login")) category = "security"
        else if (log.action.toLowerCase().includes("profile")) category = "profile"
        else if (log.entity_type === "Publication") category = "publication"
        else if (log.entity_type === "Project") category = "project"

        return {
          id: log.id,
          actor: "You",
          action: log.action,
          target: log.entity_type ? `(${log.entity_type})` : "",
          category,
          timestamp: new Date(log.timestamp).toLocaleString(),
        }
      })
    },
  })

  return (
    <Card className={cn("flex flex-col rounded-2xl border-border/70 p-5 lg:p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">System Tracking Audit Log</h3>
          <p className="text-sm text-muted-foreground">Recent security & data modifications</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-success">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Live
        </span>
      </div>

      <div className="relative flex-1 space-y-1">
        <span className="absolute bottom-2 left-[19px] top-2 w-px bg-border" aria-hidden />
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          logs?.map((log: any, i: number) => {
            const m = meta[log.category] || meta.system
            const Icon = m.icon
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="relative flex gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-accent/40"
              >
                <span
                  className={cn(
                    "z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-card",
                    m.bg,
                    m.color,
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{log.actor}</span>{" "}
                    <span className="text-muted-foreground">{log.action}</span>{" "}
                    <span className="font-medium">{log.target}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{log.timestamp}</p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </Card>
  )
}
