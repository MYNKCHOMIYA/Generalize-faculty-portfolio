"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  User, Mail, Phone, Building2, MapPin, Globe,
  Loader2, AlertCircle, UploadCloud, FileDown,
  X
} from "lucide-react"
import { toast } from "sonner"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageTransition } from "@/components/motion"
import { ProfileSheet } from "@/components/dashboard/profile-sheet"
import { ImageCropperModal } from "@/components/image-cropper"
import { AnimatePresence, motion } from "framer-motion"
import api from "@/lib/api"

// Custom standard SVGs for academic/professional platforms
const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const ScholarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M12 24a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm0-24L0 9.5l4.838 3.911L12 18l7.162-4.589L24 9.5z"/>
  </svg>
)

const OrcidIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h4.543c3.481 0 5.385 2.158 5.385 5.013 0 2.923-1.956 5.028-5.467 5.028H10.21V7.416zm1.443 1.25v7.54h2.898c1.941 0 3.655-1.025 3.655-3.791 0-2.616-1.579-3.749-3.749-3.749h-2.804z"/>
  </svg>
)

function ProfileField({ icon: Icon, label, value, href }: { icon: any; label: string; value?: string | null; href?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 mt-0.5">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {href ? (
          <a href={href.startsWith("http") ? href : `https://${href}`} target="_blank" rel="noopener noreferrer"
            className="text-sm font-medium hover:text-primary transition-colors hover:underline break-all block mt-0.5">{value}</a>
        ) : (
          <p className="text-sm font-medium break-all mt-0.5">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading, error } = useQuery({
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
  })

  const handleDownloadCV = async () => {
    if (!profile?.id) return
    try {
      const res = await api.get(`/api/v1/export/cv/${profile.id}`, { responseType: 'blob' })
      const blob = res.data
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${profile.first_name}_${profile.last_name}_CV.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error("Failed to download CV. Please try again.")
    }
  }

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await api.post("/api/v1/profile/me/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("Profile image updated")
      queryClient.invalidateQueries({ queryKey: ["profile-me"] })
      setSelectedFileUrl(null)
    },
    onError: () => toast.error("Failed to upload image")
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setSelectedFileUrl(imageUrl)
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCropComplete = (croppedFile: File) => {
    uploadImageMutation.mutate(croppedFile)
  }

  if (isLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )

  if (error) return (
    <Card className="mx-auto max-w-xl p-8 flex gap-3 items-start border-destructive/30 bg-destructive/5">
      <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-destructive">Failed to load profile</p>
        <p className="text-sm text-muted-foreground">Please ensure the backend is running.</p>
      </div>
    </Card>
  )

  if (!profile) return (
    <div className="mx-auto max-w-xl text-center py-24">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted mb-4">
        <User className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold">No Profile Found</h2>
      <p className="text-muted-foreground text-sm mt-1 mb-6">You haven't created your faculty profile yet.</p>
      <ProfileSheet />
    </div>
  )

  const fullName = `${profile.first_name} ${profile.last_name}`
  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
  const areas = profile.areas_of_interest ? profile.areas_of_interest.split(",").map((s: string) => s.trim()) : []
  const hasAvatar = !!profile.profile_image_url

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-6">
      
      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && hasAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="size-6" />
            </Button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={profile.profile_image_url}
              alt={fullName}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Cropper */}
      {selectedFileUrl && (
        <ImageCropperModal
          imageSrc={selectedFileUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setSelectedFileUrl(null)}
          isLoading={uploadImageMutation.isPending}
        />
      )}
      
      {/* Centered Minimal Hero Card with Blurred Background */}
      <Card className="rounded-3xl border-border/70 overflow-hidden relative shadow-sm">
        
        {/* Cinematic Video Background Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-70 scale-105 blur-sm"
            src="/background_avatar.mp4"
          />
          {/* Smooth linear gradient (bottom to top) to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        </div>
        
        <CardContent className="px-6 py-14 flex flex-col items-center text-center relative z-10">
          
          {/* Avatar Block */}
          <div className="relative mb-6 group mt-4">
            <Avatar 
              className={`size-40 sm:size-52 border-[6px] border-background shadow-2xl transition-all duration-300 ${hasAvatar ? "cursor-pointer group-hover:scale-[1.03] group-hover:shadow-primary/20" : ""}`}
              onClick={() => { if (hasAvatar) setIsLightboxOpen(true) }}
            >
              <AvatarImage src={profile.profile_image_url} alt={fullName} className="object-cover" />
              <AvatarFallback className="text-5xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
            
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute bottom-2 right-2 rounded-full shadow-xl size-12 bg-background border-2 border-border hover:bg-muted transition-colors opacity-90 hover:opacity-100"
              onClick={() => fileInputRef.current?.click()} 
            >
              <UploadCloud className="size-5 text-foreground/80" />
            </Button>
          </div>
          
          {/* Name & Titles */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 drop-shadow-sm">{fullName}</h1>
          <p className="text-lg text-muted-foreground font-medium mb-1 drop-shadow-sm">{profile.designation}</p>
          {profile.department && <p className="text-sm text-muted-foreground/80 drop-shadow-sm">{profile.department}</p>}
          
          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button variant="default" className="rounded-full shadow-sm" onClick={handleDownloadCV}>
              <FileDown className="size-4 mr-2" />
              Download CV
            </Button>
            <ProfileSheet />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm">Contact & Identity</h3>
              <div className="space-y-4">
                <ProfileField icon={Mail} label="Email" value={profile.email} href={`mailto:${profile.email}`} />
                <ProfileField icon={Phone} label="Phone" value={profile.phone_number} />
                <ProfileField icon={Building2} label="Employee ID" value={profile.employee_id} />
                <ProfileField icon={MapPin} label="Office" value={profile.office_location} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-sm">Online Presence</h3>
              <div className="space-y-4">
                <ProfileField icon={Globe} label="Website" value={profile.website} href={profile.website} />
                <ProfileField icon={LinkedinIcon} label="LinkedIn" value={profile.linkedin ? "View Profile" : null} href={profile.linkedin} />
                <ProfileField icon={ScholarIcon} label="Google Scholar" value={profile.google_scholar ? "View Publications" : null} href={profile.google_scholar} />
                <ProfileField icon={OrcidIcon} label="ORCID" value={profile.orcid} href={profile.orcid ? `https://orcid.org/${profile.orcid}` : undefined} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-4">
          {profile.bio && (
            <Card className="rounded-2xl border-border/70 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-sm mb-3">Biography</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-border/70 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-semibold text-sm border-b border-border/40 pb-2">Academic Information</h3>
              
              {profile.specialization && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Specialization</p>
                  <p className="text-sm font-medium">{profile.specialization}</p>
                </div>
              )}
              
              {areas.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5">Areas of Interest</p>
                  <div className="flex flex-wrap gap-2">
                    {areas.map((area: string) => (
                      <Badge key={area} variant="secondary" className="rounded-md font-medium text-xs px-2.5 py-1 bg-secondary/60 hover:bg-secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {!profile.specialization && areas.length === 0 && (
                <p className="text-sm text-muted-foreground">No academic information provided yet.</p>
              )}
              
              {profile.skills && (
                <div className="pt-2">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.split(",").map((s: string) => (
                      <Badge key={s} variant="outline" className="rounded-md font-medium text-xs px-2.5 py-1 bg-transparent border-border hover:bg-muted/50 transition-colors">
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
