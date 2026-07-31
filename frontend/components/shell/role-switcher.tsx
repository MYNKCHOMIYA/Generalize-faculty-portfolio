"use client"

import { ShieldCheck, UserRound, Users } from "lucide-react"
import { useRole } from "@/components/role-provider"
import { roleLabels } from "@/lib/nav"
import type { Role } from "@/components/role-provider"

const roleMeta: Record<Role, { icon: typeof UserRound; color: string }> = {
  admin: { icon: ShieldCheck, color: "text-primary border-primary/30 bg-primary/5" },
  hod: { icon: Users, color: "text-amber-600 border-amber-500/30 bg-amber-500/5 dark:text-amber-400" },
  faculty: { icon: UserRound, color: "text-muted-foreground border-border/60 bg-muted/30" },
}

export function RoleSwitcher() {
  const { role, user } = useRole()

  if (!role) return null

  const { icon: Icon, color } = roleMeta[role]

  return (
    <div
      className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium ${color}`}
      title={`Logged in as: ${user?.email}`}
    >
      <span className="size-1.5 rounded-full bg-emerald-500" />
      <Icon className="size-3.5" />
      <span>{roleLabels[role]}</span>
    </div>
  )
}
