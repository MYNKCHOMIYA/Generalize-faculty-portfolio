"use client"

import { Check, ChevronDown, ShieldCheck, UserRound, Users } from "lucide-react"
import { useRole } from "@/components/role-provider"
import { roleLabels } from "@/lib/nav"
import type { Role } from "@/components/role-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const roleMeta: Record<Role, { icon: typeof UserRound; hint: string }> = {
  admin: { icon: ShieldCheck, hint: "Full institutional control" },
  hod: { icon: Users, hint: "Department-scoped access" },
  faculty: { icon: UserRound, hint: "Personal portfolio only" },
}

export function RoleSwitcher() {
  const { role, setRole } = useRole()
  const roles: Role[] = ["faculty", "hod", "admin"]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-secondary/60 px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <span className="size-1.5 rounded-full bg-success" />
        <span className="hidden sm:inline">{roleLabels[role]}</span>
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-xl">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Preview as role (RBAC demo)
        </p>
        <DropdownMenuSeparator />
        {roles.map((r) => {
          const Icon = roleMeta[r].icon
          return (
            <DropdownMenuItem
              key={r}
              className="flex items-center gap-3 rounded-lg py-2"
              onClick={() => setRole(r)}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium">{roleLabels[r]}</span>
                <span className="text-xs text-muted-foreground">{roleMeta[r].hint}</span>
              </span>
              {role === r && <Check className="ml-auto size-4 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
