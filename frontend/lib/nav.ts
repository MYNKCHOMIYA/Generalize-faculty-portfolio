import type { Role } from "@/components/role-provider"
import {
  LayoutDashboard,
  UserRound,
  ShieldCheck,
  Users,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  BadgeCheck,
  Lightbulb,
  Users2,
  Presentation,
  Search,
  Globe2,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  roles: Role[]
  group?: string
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "hod", "faculty"], group: "Overview" },
  { label: "My Profile", href: "/profile", icon: UserRound, roles: ["admin", "hod", "faculty"], group: "Overview" },
  { label: "My Portfolio", href: "/portfolio", icon: Globe2, roles: ["admin", "hod", "faculty"], group: "Overview" },
  { label: "Search Faculty", href: "/search", icon: Search, roles: ["admin", "hod", "faculty"], group: "Overview" },
  { label: "Publications", href: "/publications", icon: BookOpen, roles: ["admin", "hod", "faculty"], group: "Portfolio" },
  { label: "Projects", href: "/projects", icon: FlaskConical, roles: ["admin", "hod", "faculty"], group: "Portfolio" },
  { label: "Education", href: "/education", icon: GraduationCap, roles: ["admin", "hod", "faculty"], group: "Portfolio" },
  { label: "Experience", href: "/experience", icon: Briefcase, roles: ["admin", "hod", "faculty"], group: "Portfolio" },
  { label: "Achievements", href: "/achievements", icon: Award, roles: ["admin", "hod", "faculty"], group: "Portfolio" },
  { label: "Patents", href: "/patents", icon: FileText, roles: ["admin", "hod", "faculty"], group: "Portfolio" },
  { label: "Certifications", href: "/certifications", icon: BadgeCheck, roles: ["admin", "hod", "faculty"], group: "Portfolio" },
  { label: "Teaching", href: "/teaching", icon: Lightbulb, roles: ["admin", "hod", "faculty"], group: "Academic" },
  { label: "Student Guidance", href: "/student-guidance", icon: Users2, roles: ["admin", "hod", "faculty"], group: "Academic" },
  { label: "Workshops", href: "/workshops", icon: Presentation, roles: ["admin", "hod", "faculty"], group: "Academic" },
  { label: "Department", href: "/department", icon: Users, roles: ["admin", "hod"], group: "Admin" },
  { label: "Admin Console", href: "/admin", icon: ShieldCheck, roles: ["admin"], group: "Admin" },
]

export const roleLabels: Record<Role, string> = {
  admin: "Administrator",
  hod: "Head of Department",
  faculty: "Faculty",
}
