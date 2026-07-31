"use client"

import { useState } from "react"
import { Menu, Search } from "lucide-react"
import { SidebarContent } from "./sidebar-content"
import { NotificationBell } from "./notification-bell"
import { ThemeToggle } from "./theme-toggle"
import { RoleSwitcher } from "./role-switcher"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { useRole } from "@/components/role-provider"


export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useRole()

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/70 glass px-4 md:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
              className="lg:hidden inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search publications, projects, faculty..."
              className="h-9 rounded-full border-border/70 bg-secondary/50 pl-9 text-sm"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">

            <RoleSwitcher />
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
