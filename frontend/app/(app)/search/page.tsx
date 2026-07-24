"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Loader2, User, FileDown, BookOpen, ExternalLink, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageTransition } from "@/components/motion"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { toast } from "sonner"

export default function SearchPage() {
  const [params, setParams] = useState({
    department: "",
    designation: "",
    skill: "",
    min_publications: "",
  })

  // To trigger search only on form submit
  const [searchQuery, setSearchQuery] = useState(params)

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (searchQuery.department) searchParams.append("department", searchQuery.department)
      if (searchQuery.designation) searchParams.append("designation", searchQuery.designation)
      if (searchQuery.skill) searchParams.append("skill", searchQuery.skill)
      if (searchQuery.min_publications) searchParams.append("min_publications", searchQuery.min_publications)
      
      const res = await api.get(`/api/search/?${searchParams.toString()}`)
      return res.data
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(params)
  }

  const handleDownloadCV = async (id: string) => {
    try {
      const res = await api.get(`/api/v1/export/cv/${id}`, { responseType: 'blob' })
      const blob = res.data
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Faculty_CV_${id.slice(0,8)}.pdf` // Backend normally provides filename in headers, but this is a safe fallback
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error("Failed to download CV. Please try again.")
    }
  }

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Faculty Search</h1>
        <p className="text-muted-foreground mt-1">Discover faculty members by department, skills, or expertise.</p>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input 
                id="department" 
                placeholder="e.g. Computer Science" 
                value={params.department} 
                onChange={(e) => setParams(p => ({...p, department: e.target.value}))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input 
                id="designation" 
                placeholder="e.g. Professor" 
                value={params.designation} 
                onChange={(e) => setParams(p => ({...p, designation: e.target.value}))} 
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="skill">Skill / Interest</Label>
              <Input 
                id="skill" 
                placeholder="e.g. Machine Learning" 
                value={params.skill} 
                onChange={(e) => setParams(p => ({...p, skill: e.target.value}))} 
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFetching}>
              {isFetching ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Search className="size-4 mr-2" />}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : results?.length === 0 ? (
        <div className="text-center py-12 px-4 border rounded-2xl bg-muted/20 border-dashed">
          <div className="mx-auto size-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Filter className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No matches found</h3>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results?.map((faculty: any) => (
            <Card key={faculty.id} className="rounded-2xl border-border/70 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300">
              <div className="h-12 bg-gradient-to-r from-primary/10 to-transparent" />
              <CardContent className="p-5 pt-0 flex-1 flex flex-col -mt-6">
                <div className="size-12 rounded-xl bg-background border flex items-center justify-center shadow-sm mb-3">
                  <User className="size-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold leading-tight line-clamp-1">{faculty.first_name} {faculty.last_name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{faculty.designation}</p>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Badge variant="secondary" className="font-normal">{faculty.department || "No Department"}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs mt-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="size-3.5" /> {faculty.total_publications} Publications
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-xs -ml-2" onClick={() => handleDownloadCV(faculty.id)}>
                    <FileDown className="size-3.5 mr-1.5" /> Download CV
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageTransition>
  )
}
