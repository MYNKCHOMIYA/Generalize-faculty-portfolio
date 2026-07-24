"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

export type Role = "admin" | "hod" | "faculty"

interface RoleContextValue {
  role: Role | null
  setRole: (r: Role) => void
  user: any | null
  profile: any | null
  isLoading: boolean
  logout: () => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // undefined = not yet checked (SSR / first paint)
  // null      = checked, no token found
  // string    = valid token present
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const [roleOverride, setRoleOverride] = useState<Role | null>(null)

  // Read token from localStorage on mount and when pathname changes
  useEffect(() => {
    setToken(localStorage.getItem("token"))
  }, [pathname])

  // Keep token state in sync when user navigates (handles login/logout in other tabs)
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"))
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await api.get("/api/v1/auth/me")
      return res.data
    },
    // Only run once we know the token state (token !== undefined)
    enabled: typeof token === "string",
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/v1/profile/me")
        return res.data
      } catch (err: any) {
        if (err.response?.status === 404) return null
        throw err
      }
    },
    enabled: !!user && user.role !== "admin",
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    // Wait until we've read localStorage (token !== undefined)
    if (token === undefined) return

    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register")
    if (isAuthPage) {
      if (token) {
        router.push("/")
      }
      return
    }

    // If no token exists, redirect to login
    // Note: We don't check userError here because react-query caches old errors while refetching,
    // and the global axios interceptor in lib/api.ts already handles 401s properly.
    if (!token) {
      router.push("/login")
    }
  }, [token, pathname, router])

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setRoleOverride(null)
    router.push("/login")
  }

  const jwtRole = user?.role as Role | undefined
  const role: Role | null = roleOverride ?? jwtRole ?? null
  // isLoading is true while we haven't read localStorage yet OR while queries run
  const isLoading = token === undefined || userLoading || (typeof token === "string" && profileLoading)

  const setRole = (r: Role) => setRoleOverride(r)

  // While we haven't determined auth state yet, show a full-screen spinner
  // so children never render with stale/empty context
  if (token === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <RoleContext.Provider value={{ role, setRole, user, profile, isLoading, logout }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
