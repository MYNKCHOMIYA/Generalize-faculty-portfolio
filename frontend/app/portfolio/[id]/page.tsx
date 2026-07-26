"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap, Mail, MapPin, Globe,
  BookOpen,
  Briefcase, Award, Lightbulb, Download, ExternalLink, Share2,
  Building2, Calendar, FlaskConical, ChevronDown, Moon, Sun
} from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { useTheme } from "next-themes"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const LinkedinIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const OrcidIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h4.543c3.481 0 5.385 2.158 5.385 5.013 0 2.923-1.956 5.028-5.467 5.028H10.21V7.416zm1.443 1.25v7.54h2.898c1.941 0 3.655-1.025 3.655-3.791 0-2.616-1.579-3.749-3.749-3.749h-2.804z" />
  </svg>
)

const ScholarIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.911L12 18l7.162-4.589L24 9.5z" />
  </svg>
)

// ── Animation variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as const } }),
}

const stagger = {
  show: { transition: { staggerChildren: 0.07 } },
}

function Section({ title, icon: Icon, children, delay = 0 }: { title: string; icon: any; children: React.ReactNode; delay?: number }) {
  const [open, setOpen] = useState(true)
  return (
    <motion.section variants={fadeUp} custom={delay} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 mb-4 text-left group"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <h2 className="text-lg font-bold flex-1">{title}</h2>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-0" : "-rotate-90"}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-5 ${className}`}>
      {children}
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-9" />
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-background/80 backdrop-blur text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PublicPortfolioPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/portfolio/public/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null } return r.json() })
      .then(d => { if (d) setData(d) })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Portfolio link copied!")
  }

  const handleDownloadCV = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/export/cv/${id}`)
      if (!res.ok) { toast.error("CV not available"); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data.first_name}_${data.last_name}_CV.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error("Failed to download CV") }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <GraduationCap className="size-6 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading portfolio…</p>
      </div>
    </div>
  )

  if (notFound || !data) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center px-4">
      <GraduationCap className="size-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
      <p className="text-muted-foreground">This faculty portfolio doesn't exist or has been removed.</p>
    </div>
  )

  const fullName = `${data.first_name} ${data.last_name}`
  const initials = `${data.first_name?.[0] || ""}${data.last_name?.[0] || ""}`.toUpperCase()
  const areas = data.areas_of_interest ? data.areas_of_interest.split(",").map((s: string) => s.trim()) : []
  const skills = data.skills ? data.skills.split(",").map((s: string) => s.trim()) : []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      {/* ── Sticky top bar ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <GraduationCap className="size-5 text-primary" />
            <span className="hidden sm:inline text-muted-foreground">Faculty Portfolio</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              <Share2 className="size-3.5" /> Share
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-10">

        {/* ── Hero ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-3xl overflow-hidden border border-border/50 bg-card shadow-xl">
          {/* Gradient banner */}
          <div className="h-36 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--primary)/15%,transparent_60%)]" />
          </div>

          <div className="px-6 pb-8 -mt-16">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end">
              {/* Avatar */}
              <div className="size-28 rounded-2xl border-4 border-card shadow-xl overflow-hidden bg-muted shrink-0">
                {data.profile_image_url
                  ? <img src={data.profile_image_url} alt={fullName} className="w-full h-full object-cover" loading="eager" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary/60">{initials}</div>
                }
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{fullName}</h1>
                {data.designation && <p className="text-primary font-medium mt-0.5">{data.designation}</p>}
                {data.department && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <Building2 className="size-3.5" /> {data.department}
                  </p>
                )}
                {data.office_location && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="size-3.5" /> {data.office_location}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleDownloadCV}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  <Download className="size-4" /> Download CV
                </button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 mt-5">
              {data.email && (
                <a href={`mailto:${data.email}`} className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-accent transition-all">
                  <Mail className="size-3.5" /> Email
                </a>
              )}
              {data.website && (
                <a href={data.website.startsWith("http") ? data.website : `https://${data.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium hover:bg-accent transition-all">
                  <Globe className="size-3.5" /> Website
                </a>
              )}
              {data.linkedin && (
                <a href={data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-[#0A66C2]/40 bg-[#0A66C2]/5 px-3 py-1.5 text-xs font-medium text-[#0A66C2] hover:bg-[#0A66C2]/15 dark:text-[#4B9FE5] transition-all">
                  <LinkedinIcon className="size-3.5" /> LinkedIn
                </a>
              )}
              {data.google_scholar && (
                <a href={data.google_scholar.startsWith("http") ? data.google_scholar : `https://${data.google_scholar}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-[#4285F4]/40 bg-[#4285F4]/5 px-3 py-1.5 text-xs font-medium text-[#4285F4] hover:bg-[#4285F4]/15 transition-all">
                  <ScholarIcon className="size-3.5" /> Scholar
                </a>
              )}
              {data.orcid && (
                <a href={`https://orcid.org/${data.orcid}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-[#A6CE39]/40 bg-[#A6CE39]/5 px-3 py-1.5 text-xs font-medium text-[#658000] hover:bg-[#A6CE39]/15 dark:text-[#A6CE39] transition-all">
                  <OrcidIcon className="size-3.5" /> ORCID
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Bio ── */}
        {data.bio && (
          <Section title="About" icon={FlaskConical} delay={0}>
            <Card><p className="text-sm text-muted-foreground leading-relaxed">{data.bio}</p></Card>
          </Section>
        )}

        {/* ── Research Areas & Skills ── */}
        {(areas.length > 0 || skills.length > 0) && (
          <Section title="Research & Skills" icon={Lightbulb} delay={1}>
            <div className="space-y-4">
              {areas.length > 0 && (
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Research Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((a: string) => <Pill key={a}>{a}</Pill>)}
                  </div>
                </Card>
              )}
              {skills.length > 0 && (
                <Card>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s: string) => <span key={s} className="inline-flex items-center rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium text-foreground/80">{s}</span>)}
                  </div>
                </Card>
              )}
            </div>
          </Section>
        )}

        {/* ── Publications ── */}
        {data.publications?.length > 0 && (
          <Section title={`Publications (${data.publications.length})`} icon={BookOpen} delay={2}>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="space-y-3">
              {data.publications.map((pub: any, i: number) => (
                <motion.div key={pub.id} variants={fadeUp} custom={i}>
                  <Card>
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-snug line-clamp-2">{pub.title}</p>
                        {pub.journal_name && <p className="text-xs text-muted-foreground mt-1 italic">{pub.journal_name}</p>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pub.year_published && <Pill>{pub.year_published}</Pill>}
                          {pub.publication_type && <Pill>{pub.publication_type}</Pill>}
                        </div>
                      </div>
                      {pub.doi && (
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-primary hover:text-primary/70 transition-colors">
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {/* ── Projects ── */}
        {data.projects?.length > 0 && (
          <Section title={`Projects (${data.projects.length})`} icon={Briefcase} delay={3}>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid sm:grid-cols-2 gap-3">
              {data.projects.map((proj: any, i: number) => (
                <motion.div key={proj.id} variants={fadeUp} custom={i}>
                  <Card className="h-full flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="font-semibold text-sm leading-snug">{proj.title}</p>
                      <Pill>{proj.status || "Active"}</Pill>
                    </div>
                    {proj.description && <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{proj.description}</p>}
                    {proj.funding_agency && (
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                        <Building2 className="size-3" /> {proj.funding_agency}
                      </p>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </Section>
        )}

        {/* ── Experience ── */}
        {data.experience?.length > 0 && (
          <Section title="Experience" icon={Briefcase} delay={4}>
            <div className="space-y-3">
              {data.experience.map((exp: any) => (
                <Card key={exp.id}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-sm">{exp.job_title}</p>
                      <p className="text-xs text-muted-foreground">{exp.institution}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Calendar className="size-3" />
                        {exp.start_date} — {exp.is_current ? "Present" : exp.end_date || ""}
                      </p>
                    </div>
                  </div>
                  {exp.description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* ── Education ── */}
        {data.education?.length > 0 && (
          <Section title="Education" icon={GraduationCap} delay={5}>
            <div className="space-y-3">
              {data.education.map((edu: any) => (
                <Card key={edu.id}>
                  <p className="font-semibold text-sm">{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{edu.institution}</p>
                  {(edu.start_year || edu.end_year) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="size-3" /> {edu.start_year} — {edu.end_year || "Present"}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* ── Achievements ── */}
        {data.achievements?.length > 0 && (
          <Section title="Achievements & Awards" icon={Award} delay={6}>
            <div className="space-y-3">
              {data.achievements.map((ach: any) => (
                <Card key={ach.id}>
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-sm">{ach.title}</p>
                    {ach.year && <Pill>{ach.year}</Pill>}
                  </div>
                  {ach.award_body && <p className="text-xs text-muted-foreground mt-1">{ach.award_body}</p>}
                  {ach.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ach.description}</p>}
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* ── Patents ── */}
        {data.patents?.length > 0 && (
          <Section title={`Patents (${data.patents.length})`} icon={Lightbulb} delay={7}>
            <div className="space-y-3">
              {data.patents.map((pat: any) => (
                <Card key={pat.id}>
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-semibold text-sm">{pat.title}</p>
                    {pat.status && <Pill>{pat.status}</Pill>}
                  </div>
                  {pat.patent_number && <p className="text-xs text-muted-foreground mt-1">#{pat.patent_number}</p>}
                </Card>
              ))}
            </div>
          </Section>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>Powered by <span className="font-semibold text-primary">Portfolio OS</span> — Faculty Research Suite</p>
      </footer>
    </div>
  )
}
