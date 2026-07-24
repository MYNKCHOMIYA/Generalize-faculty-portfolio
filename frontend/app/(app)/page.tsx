"use client"

import { Sparkles, Loader2 } from "lucide-react"
import { useRole } from "@/components/role-provider"
import { PageHeader } from "@/components/page-header"
import { PageTransition } from "@/components/motion"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { PublicationChart } from "@/components/dashboard/publication-chart"
import { SkillsChart } from "@/components/dashboard/skills-chart"
import { AuditTimeline } from "@/components/dashboard/audit-timeline"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProfileSheet } from "@/components/dashboard/profile-sheet"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

export default function DashboardPage() {
  const { role, user, profile, isLoading } = useRole()

  // Derive display name: prefer full name from profile, fall back to email prefix
  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email?.split("@")[0] ?? "User"

  const scopeCopy = {
    admin: "Global institutional research analytics across all departments and faculty.",
    hod: "Department-scoped analytics for your department.",
    faculty: "Your personal research portfolio trends and recent activity.",
  }[role ?? "faculty"]

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <PageTransition className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description={scopeCopy}
        action={
          <div className="flex items-center gap-3">
            <ProfileSheet />
            <Badge
              variant="secondary"
              className="hidden sm:flex gap-1.5 rounded-full bg-accent px-3 py-1.5 text-accent-foreground"
            >
              <Sparkles className="size-3.5" />
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </Badge>
          </div>
        }
      />

      <MetricCards />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PublicationChart />
        </div>
        <div className="lg:col-span-2">
          <SkillsChart />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <AuditTimeline className="lg:col-span-3" />
        <div className="lg:col-span-2">
          <SkillsHighlights />
        </div>
      </div>
    </PageTransition>
  )
}

function SkillsHighlights() {
  const { data: skillsData, isLoading } = useQuery({
    queryKey: ["analytics-research-focus"],
    queryFn: async () => {
      const res = await api.get("/api/analytics/research-focus?limit=6")
      return res.data
    },
  })

  if (isLoading) {
    return (
      <Card className="flex h-full min-h-[250px] items-center justify-center rounded-2xl border-border/70 p-5 lg:p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    )
  }

  const skills = skillsData || []
  const max = skills.length > 0 ? Math.max(...skills.map((s: any) => s.count)) : 1

  return (
    <Card className="rounded-2xl border-border/70 p-5 lg:p-6">
      <h3 className="text-base font-semibold tracking-tight">Research Focus Distribution</h3>
      <p className="mb-5 text-sm text-muted-foreground">Portfolio weighting by expertise area</p>
      <div className="space-y-4">
        {skills.map((s: any, i: number) => {
          const pct = Math.round((s.count / max) * 100)
          return (
            <div key={s.skill} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{s.skill}</span>
                <span className="font-mono text-xs text-muted-foreground">{pct}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    transitionDelay: `${i * 80}ms`,
                    background: `oklch(from var(--primary) calc(l - ${i * 0.04}) c h)`,
                  }}
                />
              </div>
            </div>
          )
        })}
        {skills.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">No research focus data yet.</p>
            <p className="text-xs text-muted-foreground/70">
              Add your <span className="font-medium text-primary">Areas of Interest</span> and{" "}
              <span className="font-medium text-primary">Specialization</span> in Edit Profile.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
