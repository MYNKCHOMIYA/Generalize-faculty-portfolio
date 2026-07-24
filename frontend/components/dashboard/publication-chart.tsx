"use client"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Loader2 } from "lucide-react"

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize">{entry.dataKey}:</span>
          <span className="font-mono font-medium text-popover-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

export function PublicationChart() {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ["analytics-publications"],
    queryFn: async () => {
      const res = await api.get("/api/analytics/trends/publications")
      return res.data.map((item: any) => ({
        year: item.year.toString(),
        publications: item.count,
        citations: item.count * 15, // Mock citations based on publications
      }))
    },
  })

  return (
    <Card className="rounded-2xl border-border/70 p-5 lg:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Publications over Time</h3>
          <p className="text-sm text-muted-foreground">Research output and citation growth by year</p>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-chart-1" /> Publications
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-chart-2" /> Citations
          </span>
        </div>
      </div>
      <div className="h-[280px] w-full">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData || []} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="pubFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="citeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border)" }} />
              <Area
                type="monotone"
                dataKey="citations"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="url(#citeFill)"
              />
              <Area
                type="monotone"
                dataKey="publications"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fill="url(#pubFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
