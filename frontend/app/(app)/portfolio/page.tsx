"use client"

import { useQueries, useQuery } from "@tanstack/react-query"
import { Loader2, Globe, MapPin, Mail, BookOpen, Briefcase, GraduationCap, FileText, FlaskConical, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/motion"
import { useRole } from "@/components/role-provider"
import api from "@/lib/api"
import { Separator } from "@/components/ui/separator"

export default function PortfolioPage() {
  const { profile, isLoading: isProfileLoading } = useRole()

  const queries = useQueries({
    queries: [
      { queryKey: ["publications"], queryFn: () => api.get("/api/v1/publications/me").then(res => res.data) },
      { queryKey: ["education"], queryFn: () => api.get("/api/v1/education/me").then(res => res.data) },
      { queryKey: ["experience"], queryFn: () => api.get("/api/v1/experience/me").then(res => res.data) },
      { queryKey: ["projects"], queryFn: () => api.get("/api/v1/projects/me").then(res => res.data) },
    ],
  })

  const isLoading = isProfileLoading || queries.some(q => q.isLoading)
  const [pubs, edu, exp, proj] = queries.map(q => q.data || [])

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )

  if (!profile) return (
    <div className="text-center py-24">
      <h2 className="text-xl font-semibold">Profile Not Found</h2>
      <p className="text-muted-foreground mt-2">Please create your profile first.</p>
    </div>
  )

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex items-center gap-5">
          <Avatar className="size-24 md:size-32 border-4 border-background shadow-lg">
            <AvatarImage src={profile.profile_image_url} />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {profile.first_name[0]}{profile.last_name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile.first_name} {profile.last_name}</h1>
            <p className="text-lg text-muted-foreground font-medium mt-1">{profile.designation}</p>
            {profile.department && <p className="text-muted-foreground text-sm">{profile.department}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
        {profile.email && <span className="flex items-center gap-1.5"><Mail className="size-4" /> {profile.email}</span>}
        {profile.office_location && <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {profile.office_location}</span>}
        {profile.website && <span className="flex items-center gap-1.5"><Globe className="size-4" /> {profile.website}</span>}
      </div>

      {profile.bio && (
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
          <p>{profile.bio}</p>
        </div>
      )}

      {profile.skills && (
        <div className="flex flex-wrap gap-2">
          {profile.skills.split(",").map((s: string) => (
            <Badge key={s} variant="secondary" className="font-normal">{s.trim()}</Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Experience Section */}
      {exp.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2"><Briefcase className="size-5 text-primary" /> Experience</h2>
          <div className="space-y-4">
            {exp.map((item: any) => (
              <Card key={item.id} className="border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-base">{item.job_title}</h3>
                      <p className="text-muted-foreground">{item.organization}</p>
                      {item.description && <p className="text-sm mt-2 text-muted-foreground/80">{item.description}</p>}
                    </div>
                    <Badge variant="outline" className="shrink-0">{item.start_date.slice(0, 4)} - {item.is_current ? 'Present' : item.end_date?.slice(0, 4)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Education Section */}
      {edu.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2"><GraduationCap className="size-5 text-primary" /> Education</h2>
          <div className="space-y-4">
            {edu.map((item: any) => (
              <Card key={item.id} className="border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-base">{item.degree} in {item.field_of_study}</h3>
                      <p className="text-muted-foreground">{item.institution}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{item.start_date.slice(0, 4)} - {item.end_date?.slice(0, 4)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Publications Section */}
      {pubs.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2"><BookOpen className="size-5 text-primary" /> Selected Publications</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pubs.slice(0, 6).map((item: any) => (
              <Card key={item.id} className="border-border/50 shadow-sm">
                <CardContent className="p-5 flex flex-col h-full">
                  <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.journal} • {item.publication_year}</p>
                  {item.doi && (
                    <div className="mt-auto pt-4 flex items-center">
                      <a href={`https://doi.org/${item.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Link2 className="size-3" /> DOI: {item.doi}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Projects Section */}
      {proj.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2"><FlaskConical className="size-5 text-primary" /> Research Projects</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {proj.map((item: any) => (
              <Card key={item.id} className="border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px]">{item.role}</Badge>
                    <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                  </div>
                  {item.funding_agency && <p className="text-xs text-muted-foreground mt-3">Funded by: {item.funding_agency}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

    </PageTransition>
  )
}
