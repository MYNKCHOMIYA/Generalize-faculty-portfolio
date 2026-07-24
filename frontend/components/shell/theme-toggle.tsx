"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = theme === "dark"

  const handleToggle = () => {
    // If View Transitions aren't supported, just toggle instantly
    if (!document.startViewTransition) {
      setTheme(isDark ? "light" : "dark")
      return
    }

    // Native, highly optimized, smooth cross-fade transition
    document.startViewTransition(() => {
      setTheme(isDark ? "light" : "dark")
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-200"
      aria-label="Toggle theme"
      onClick={handleToggle}
    >
      {mounted && isDark ? (
        <Sun className="size-[18px]" />
      ) : (
        <Moon className="size-[18px]" />
      )}
    </Button>
  )
}
