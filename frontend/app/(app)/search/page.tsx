"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Loader2, User, BookOpen, Filter, Building2, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/motion"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { useRole } from "@/components/role-provider"

export default function SearchPage() {
  const { role, user } = useRole()
  const [params, setParams] = useState({
    department: "",
    designation: "",
    skill: "",
    min_publications: "",
  })
  const [searchQuery, setSearchQuery] = useState(params)

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (searchQuery.department) searchParams.append("department", searchQuery.department)
      if (searchQuery.designation) searchParams.append("designation", searchQuery.designation)
      if (searchQuery.skill) searchParams.append("skill", searchQuery.skill)
      if (searchQuery.min_publications)
        searchParams.append("min_publications", searchQuery.min_publications)
      const res = await api.get(`/api/search/?${searchParams.toString()}`)
      return res.data
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(params)
  }

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Search</h1>
        <p className="text-muted-foreground mt-1">
          {role === "admin"
            ? "Searching across all faculty in the institution."
            : "Searching faculty in your assigned department."}
        </p>
      </div>

      {/* HOD dept context banner */}
      {role === "hod" && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <Building2 className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You are viewing faculty in your assigned department only. Contact an administrator
            to change your department assignment.
          </p>
        </div>
      )}

      {/* Admin context banner */}
      {role === "admin" && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <p className="text-sm text-primary/80">
            Administrator view — showing all faculty across all departments.
          </p>
        </div>
      )}

      {/* Search filters */}
      <Card className="rounded-2xl border-border/70">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g. Computer Science"
                  value={params.department}
                  onChange={(e) => setParams((p) => ({ ...p, department: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  placeholder="e.g. Professor"
                  value={params.designation}
                  onChange={(e) => setParams((p) => ({ ...p, designation: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill">Skill / Area</Label>
                <Input
                  id="skill"
                  placeholder="e.g. Machine Learning"
                  value={params.skill}
                  onChange={(e) => setParams((p) => ({ ...p, skill: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_pub">Min. Publications</Label>
                <Input
                  id="min_pub"
                  type="number"
                  placeholder="e.g. 5"
                  value={params.min_publications}
                  onChange={(e) =>
                    setParams((p) => ({ ...p, min_publications: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading || isFetching} className="gap-2">
                {isFetching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Search
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setParams({ department: "", designation: "", skill: "", min_publications: "" })
                  setSearchQuery({ department: "", designation: "", skill: "", min_publications: "" })
                }}
              >
                <Filter className="size-4 mr-2" />
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : results && results.length > 0 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r: any) => (
              <Card
                key={r.id}
                className="rounded-2xl border-border/70 hover:border-primary/40 transition-all hover:shadow-md group cursor-pointer"
                onClick={() => window.open(`/portfolio/${r.user_id}`, "_blank")}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <User className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate group-hover:text-primary transition-colors">
                        {r.first_name} {r.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{r.designation}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {r.department}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-3.5" />
                      {r.total_publications} publications
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : results && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Search className="size-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">No faculty matched your search criteria.</p>
        </div>
      ) : null}
    </PageTransition>
  )
}
