export type Role = "admin" | "hod" | "faculty"

export interface FacultyProfile {
  id: string
  name: string
  employeeId: string
  title: string
  department: string
  email: string
  phone: string
  avatar: string
  role: Role
  officeLocation: string
  specialization: string
  areasOfInterest: string[]
  website: string
  linkedin: string
  googleScholar: string
  orcid: string
  bio: string
  joinedYear: number
}

export interface Publication {
  id: string
  title: string
  authors: string
  journal: string
  issn: string
  indexedIn: string[]
  year: number
  citations: number
  pdfUrl: string
}

export interface Project {
  id: string
  title: string
  fundingAgency: string
  amount: number
  status: "ongoing" | "completed" | "sanctioned"
  teamMembers: string[]
  startYear: number
  endYear: number | null
  documentsUrl: string
}

export interface Experience {
  id: string
  organization: string
  role: string
  employmentType: "Full-time" | "Part-time" | "Visiting" | "Contract"
  startYear: number
  endYear: number | null
  location: string
}

export interface Education {
  id: string
  degree: string
  institution: string
  field: string
  year: number
}

export interface Achievement {
  id: string
  title: string
  issuer: string
  year: number
  description: string
}

export interface Patent {
  id: string
  title: string
  patentNumber: string
  status: "granted" | "filed" | "published"
  year: number
  inventors: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  year: number
  credentialId: string
}

export interface AuditLog {
  id: string
  actor: string
  action: string
  target: string
  category: "security" | "profile" | "publication" | "project" | "system"
  timestamp: string
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type: "info" | "success" | "warning"
}

export interface PublicationTrendPoint {
  year: string
  publications: number
  citations: number
}

export interface SkillPoint {
  skill: string
  count: number
}
