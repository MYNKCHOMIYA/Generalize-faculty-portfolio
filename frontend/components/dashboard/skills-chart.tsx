"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Loader2, Radar as RadarIcon } from "lucide-react"

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-chart-3" />
        <span className="font-medium text-popover-foreground">
          {payload[0].payload.skill}
        </span>
      </div>
      <p className="mt-1 pl-4 text-muted-foreground">
        Score:{" "}
        <span className="font-mono font-medium text-popover-foreground">
          {payload[0].value}
        </span>
      </p>
    </div>
  )
}

export function SkillsChart() {
  const { data: skillsData, isLoading } = useQuery({
    queryKey: ["analytics-skills"],
    queryFn: async () => {
      const res = await api.get("/api/analytics/skills/top?limit=6")
      return res.data
    },
  })

  const data = skillsData ?? []
  const hasData = data.length >= 3 // Radar needs at least 3 points to render nicely

  return (
    <Card className="flex h-full flex-col rounded-2xl border-border/70 p-5 lg:p-6">
      <div className="mb-2">
        <h3 className="text-base font-semibold tracking-tight">Expertise Radar</h3>
        <p className="text-sm text-muted-foreground">
          Competency distribution across core areas
        </p>
      </div>

      <div className="min-h-[220px] flex-1 flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : !hasData ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent">
              <RadarIcon className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No expertise data yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add at least 3 skills in your profile to see the radar chart.
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart
              data={data}
              margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
            >
              <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                tickSize={12}
              />
              <Tooltip content={<ChartTooltip />} />
              <Radar
                name="Score"
                dataKey="count"
                stroke="var(--chart-3)"
                strokeWidth={2}
                fill="var(--chart-3)"
                fillOpacity={0.25}
                dot={{ r: 3, fill: "var(--chart-3)", strokeWidth: 0 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
