import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, User, BookOpen, Briefcase, GraduationCap,
  Award, FileText, Shield, BadgeCheck, BookMarked, Users, Presentation,
  ChevronLeft, ChevronRight, LogOut, GlobeIcon
} from 'lucide-react'
import { cn } from '@/utils'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Profile', to: '/profile', icon: User },
  { name: 'Publications', to: '/publications', icon: BookOpen },
  { name: 'Projects', to: '/projects', icon: Briefcase },
  { name: 'Experience', to: '/experience', icon: GlobeIcon },
  { name: 'Education', to: '/education', icon: GraduationCap },
  { name: 'Achievements', to: '/achievements', icon: Award },
  { name: 'Patents', to: '/patents', icon: Shield },
  { name: 'Certifications', to: '/certifications', icon: BadgeCheck },
  { name: 'Teaching', to: '/teaching', icon: BookMarked },
  { name: 'Student Guidance', to: '/student-guidance', icon: Users },
  { name: 'Workshops', to: '/workshops', icon: Presentation },
]

export function Sidebar({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const { logout, user } = useAuth()
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={cn(
        'relative h-full flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-100 border-r border-slate-800 overflow-hidden flex-shrink-0',
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-800">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
          FH
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-semibold text-white text-sm">FacultyHub</span>
              <p className="text-xs text-slate-400">{user?.role || 'Faculty'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
        {navItems.map((item) => {
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}
