"use client"

import { useQuery } from "@tanstack/react-query"
import { ShieldCheck, Users, Search, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useRole } from "@/components/role-provider"
import { toast } from "sonner"

export default function AdminConsolePage() {
  const router = useRouter()
  const { role } = useRole()

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/users")
      return res.data
    },
    enabled: role === "admin",
  })

  if (role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldCheck className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-md">You do not have the required administrator privileges to view this page.</p>
        <Button variant="outline" onClick={() => router.push("/")}>Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <PageTransition className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">Manage system users and access global settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push("/search")}>
            <Search className="size-4 mr-2" />
            Global Search
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered in the system</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-sm">Failed to load users. Ensure you have admin privileges.</p>
            </div>
          ) : (
            <div className="rounded-md border border-border/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-card">
                  {users?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`capitalize ${
                          u.role === 'admin' ? 'border-primary text-primary' : 
                          u.role === 'hod' ? 'border-amber-500 text-amber-600' : ''
                        }`}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.id}</td>
                    </tr>
                  ))}
                  {users?.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  )
}
