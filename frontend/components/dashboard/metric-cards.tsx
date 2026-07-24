"use client"

import { ArrowUpRight, BookOpen, FlaskConical, TrendingUp, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useRole } from "@/components/role-provider"
import { StaggerItem, StaggerList } from "@/components/motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

interface Metric {
  label: string
  value: string
  delta: string
  hint: string
  icon: LucideIcon
  accent: string
}

export function MetricCards() {
  const { role } = useRole()

  const scope =
    role === "admin" ? "Institution-wide" : role === "hod" ? "Department" : "Personal"

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: async () => {
      const res = await api.get("/api/analytics/dashboard")
      return res.data
    },
  })

  const metrics: Metric[] = [
    {
      label: "Total Publications",
      value: isLoading ? "..." : (analytics?.total_publications?.toString() ?? "0"),
      delta: "+12.4%",
      hint: `${scope} · last 12 months`,
      icon: BookOpen,
      accent: "text-chart-1",
    },
    {
      label: "Active Projects",
      value: isLoading ? "..." : (analytics?.active_projects?.toString() ?? "0"),
      delta: "+4",
      hint: `${scope} · ongoing grants`,
      icon: FlaskConical,
      accent: "text-chart-2",
    },
    {
      label: "Total Citations",
      value: isLoading ? "..." : (analytics?.total_citations?.toString() ?? "0"),
      delta: "+8.1%",
      hint: `${scope} · cumulative`,
      icon: TrendingUp,
      accent: "text-chart-3",
    },
  ]

  // Faculty do not see the monitored faculty count
  if (role !== "faculty") {
    metrics.push({
      label: "Monitored Faculty",
      value: isLoading ? "..." : (analytics?.total_faculty?.toString() ?? "0"),
      delta: "+3",
      hint: `${scope} · active members`,
      icon: Users,
      accent: "text-chart-5",
    })
  }

  return (
    <StaggerList
      className={cn(
        "grid gap-4",
        role === "faculty" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {metrics.map((m) => {
        const Icon = m.icon
        return (
          <StaggerItem key={m.label}>
            <Card className="group relative overflow-hidden rounded-2xl border-border/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-start justify-between">
                <span className={cn("flex size-10 items-center justify-center rounded-xl bg-accent", m.accent)}>
                  <Icon className="size-5" />
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                  <ArrowUpRight className="size-3" />
                  {m.delta}
                </span>
              </div>
              <p className="mt-4 font-mono text-3xl font-semibold tracking-tight tabular-nums">
                {m.value}
              </p>
              <p className="mt-1 text-sm font-medium">{m.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{m.hint}</p>
            </Card>
          </StaggerItem>
        )
      })}
    </StaggerList>
  )
}
