"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { GraduationCap, LogOut } from "lucide-react"
import { motion } from "framer-motion"
import { useRole } from "@/components/role-provider"
import { navItems, roleLabels } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role, user, profile, logout } = useRole()
  const items = navItems.filter((item) => item.roles.includes(role || "faculty"))

  // Build grouped nav
  const groups: Record<string, typeof items> = {}
  for (const item of items) {
    const g = item.group || "Other"
    if (!groups[g]) groups[g] = []
    groups[g].push(item)
  }

  function handleLogout() {
    logout()
  }

  const name = profile ? `${profile.first_name} ${profile.last_name}` : user?.email || "User"
  const avatar = profile?.profile_image_url || "/placeholder.svg"

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5 shrink-0">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <GraduationCap className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Portfolio OS</p>
          <p className="text-[11px] text-muted-foreground">Faculty Research Suite</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 sidebar-nav">
        {Object.entries(groups).map(([groupName, groupItems]) => (
          <div key={groupName}>
            <p className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {groupName}
            </p>
            <div className="space-y-0.5">
              {groupItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-xl bg-primary shadow-sm"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className="size-[18px]" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar className="size-9 border border-sidebar-border">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-accent text-xs text-accent-foreground">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{role ? roleLabels[role] : ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
