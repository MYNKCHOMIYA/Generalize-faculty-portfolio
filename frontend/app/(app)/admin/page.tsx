"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ShieldCheck,
  Users,
  Search,
  Loader2,
  AlertCircle,
  Pencil,
  X,
  Check,
  Building2,
  UserRound,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import api from "@/lib/api"
import { useRole } from "@/components/role-provider"
import { toast } from "sonner"

type UserRecord = {
  id: string
  email: string
  role: "faculty" | "hod" | "admin"
  department_id: string | null
  department_name: string | null
  is_active: boolean
}

type Department = { id: string; name: string; code: string }

const roleBadgeClass: Record<string, string> = {
  admin: "border-primary/40 text-primary bg-primary/5",
  hod: "border-amber-500/40 text-amber-600 bg-amber-500/5 dark:text-amber-400",
  faculty: "border-border text-muted-foreground",
}

function EditRoleModal({
  user,
  departments,
  onClose,
  onSave,
  isSaving,
}: {
  user: UserRecord
  departments: Department[]
  onClose: () => void
  onSave: (userId: string, role: string, departmentId: string | null) => void
  isSaving: boolean
}) {
  const [selectedRole, setSelectedRole] = useState(user.role)
  const [selectedDeptId, setSelectedDeptId] = useState<string>(user.department_id ?? "")

  const handleSave = () => {
    if (selectedRole === "hod" && !selectedDeptId) {
      toast.error("Please select a department for the HOD role")
      return
    }
    onSave(user.id, selectedRole, selectedRole === "faculty" ? null : selectedDeptId || null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="mb-5">
          <h3 className="text-lg font-semibold">Edit User Role</h3>
          <p className="text-sm text-muted-foreground mt-1 truncate">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="faculty">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-4" />
                    Faculty Member
                  </div>
                </SelectItem>
                <SelectItem value="hod">
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    Head of Department (HOD)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "hod" && (
            <div className="space-y-2">
              <Label>Assign Department</Label>
              <Select
                value={selectedDeptId}
                onValueChange={(v: string | null) => setSelectedDeptId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4" />
                        {d.name} ({d.code})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The HOD will only see and manage faculty in this department.
              </p>
            </div>
          )}

          {selectedRole === "faculty" && user.role === "hod" && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Demoting this user to Faculty will remove their department assignment.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Check className="mr-2 size-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminConsolePage() {
  const router = useRouter()
  const { role } = useRole()
  const queryClient = useQueryClient()
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)

  const { data: users, isLoading, error } = useQuery<UserRecord[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/users")
      return res.data
    },
    enabled: role === "admin",
  })

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/departments")
      return res.data
    },
    enabled: role === "admin",
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      newRole,
      departmentId,
    }: {
      userId: string
      newRole: string
      departmentId: string | null
    }) => {
      const res = await api.patch(`/api/v1/auth/users/${userId}/role`, {
        role: newRole,
        department_id: departmentId,
      })
      return res.data
    },
    onSuccess: (_, variables) => {
      toast.success(`User role updated to ${variables.newRole}`)
      setEditingUser(null)
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update role")
    },
  })

  if (role !== "admin") {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <ShieldCheck className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          You do not have the required administrator privileges to view this page.
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to Dashboard
        </Button>
      </div>
    )
  }

  const adminCount = users?.filter((u) => u.role === "admin").length ?? 0
  const hodCount = users?.filter((u) => u.role === "hod").length ?? 0
  const facultyCount = users?.filter((u) => u.role === "faculty").length ?? 0

  return (
    <PageTransition className="space-y-6 max-w-6xl mx-auto">
      {editingUser && (
        <EditRoleModal
          user={editingUser}
          departments={departments}
          onClose={() => setEditingUser(null)}
          isSaving={updateRoleMutation.isPending}
          onSave={(userId, newRole, departmentId) =>
            updateRoleMutation.mutate({ userId, newRole, departmentId })
          }
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">
            Manage user roles and department assignments.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/search")}>
          <Search className="size-4 mr-2" />
          Global Search
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Users", value: users?.length ?? 0, icon: Users, color: "text-primary" },
          { label: "Administrators", value: adminCount, icon: ShieldCheck, color: "text-primary" },
          { label: "HODs", value: hodCount, icon: Users, color: "text-amber-600 dark:text-amber-400" },
          { label: "Faculty", value: facultyCount, icon: UserRound, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-2xl border-border/70">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`size-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User table */}
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Click the edit button to change a user&apos;s role or department assignment.
          </CardDescription>
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
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/50 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-card">
                  {users?.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`capitalize ${roleBadgeClass[u.role]}`}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.department_name ? (
                          <span className="flex items-center gap-1.5">
                            <Building2 className="size-3.5" />
                            {u.department_name}
                          </span>
                        ) : (
                          <span className="text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingUser(u)}
                            className="h-8 px-3 text-xs"
                          >
                            <Pencil className="size-3.5 mr-1" />
                            Edit Role
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                        No users found.
                      </td>
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
