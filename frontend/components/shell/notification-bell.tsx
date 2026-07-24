"use client"

import { useState } from "react"
import { Bell, CheckCheck, CircleAlert, CircleCheck, Info, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import api from "@/lib/api"

const typeIcon: Record<string, any> = {
  info: Info,
  success: CircleCheck,
  warning: CircleAlert,
}

const typeColor: Record<string, string> = {
  info: "text-primary",
  success: "text-success",
  warning: "text-warning",
}

export function NotificationBell() {
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/notifications/")
        return res.data
      } catch {
        return [] // fallback if endpoint not available
      }
    },
    refetchInterval: 60000, // Refresh every minute
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/notifications/${id}/read`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await api.post("/api/notifications/mark-all-read")
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const unread = items.filter((n: any) => !n.is_read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
          className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
          aria-label={`Notifications, ${unread} unread`}
        >
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] overflow-hidden rounded-xl p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread} unread alerts</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="size-3.5" />
            Mark all
          </Button>
        </div>
        <div className="max-h-[360px] overflow-y-auto py-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            <AnimatePresence initial={false}>
              {items.map((n: any, i: number) => {
                const Icon = typeIcon[n.notification_type] || Info
                const color = typeColor[n.notification_type] || "text-primary"
                return (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/60",
                      !n.is_read && "bg-accent/30",
                    )}
                  >
                    <span className={cn("mt-0.5 shrink-0", color)}>
                      <Icon className="size-4" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium leading-tight line-clamp-2">{n.message}</span>
                        {!n.is_read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                      </span>
                      <span className="mt-1 block text-[11px] text-muted-foreground/70">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </span>
                  </motion.button>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
