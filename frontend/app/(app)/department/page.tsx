"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, Loader2, BookOpen, User, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/motion"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/components/role-provider"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DepartmentPage() {
  const { role, profile } = useRole()
  const router = useRouter()
  const departmentName = profile?.department

  const { data: faculty, isLoading, error } = useQuery({
    queryKey: ["department-faculty", departmentName],
    queryFn: async () => {
      if (!departmentName) return []
      const res = await api.get(`/api/search/?department=${encodeURIComponent(departmentName)}`)
      return res.data
    },
    enabled: role === "hod" || role === "admin",
  })

  if (role !== "hod" && role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Building2 className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-md">You do not have HOD privileges to view the department overview.</p>
        <Button variant="outline" onClick={() => router.push("/")}>Return to Dashboard</Button>
      </div>
    )
  }

  if (!departmentName && role === "hod") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Building2 className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Department Not Set</h2>
        <p className="text-muted-foreground text-sm max-w-md">Please update your profile and set your department to view this page.</p>
        <Button variant="outline" onClick={() => router.push("/profile")}>Go to Profile</Button>
      </div>
    )
  }

  const totalPublications = faculty?.reduce((sum: number, f: any) => sum + (f.total_publications || 0), 0) || 0

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Department Overview</h1>
        <p className="text-muted-foreground mt-1">Manage and view statistics for {departmentName || "All Departments"}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Department Faculty</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faculty?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total registered members</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Publications</CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPublications}</div>
            <p className="text-xs text-muted-foreground mt-1">Combined research output</p>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="size-5" /> Faculty Members
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : faculty?.length === 0 ? (
          <div className="text-center py-12 border rounded-xl bg-muted/20 border-dashed">
            <p className="text-muted-foreground text-sm">No faculty members found in your department.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faculty?.map((f: any) => (
              <Card key={f.id} className="rounded-xl border-border/70 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex gap-4">
                  <div className="size-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">{f.first_name} {f.last_name}</h3>
                    <p className="text-xs text-muted-foreground">{f.designation}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        <BookOpen className="size-3 mr-1 inline" /> {f.total_publications} Pubs
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
