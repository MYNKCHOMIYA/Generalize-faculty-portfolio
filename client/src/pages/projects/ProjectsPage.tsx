import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { projectApi } from '@/services/api'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Briefcase, ExternalLink, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/utils'

const EMPTY = { title: '', funding_agency: '', status: 'Ongoing', start_date: '', end_date: '', description: '', team_members: '', project_documents_url: '' }
const statusColors: Record<string, 'success' | 'info' | 'warning' | 'secondary'> = { Ongoing: 'success', Completed: 'info', Pending: 'warning' }

export function ProjectsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Project>>(EMPTY)

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects', 'mine'],
    queryFn: () => projectApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => projectApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setOpen(false); setForm(EMPTY); toast.success('Project added!') },
    onError: () => toast.error('Failed to add project.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project removed') },
  })

  const f = (key: keyof Project) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <PageHeader title="Projects" description="Research projects, funded initiatives, and collaborations" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Project</Button>} />
      {isLoading ? (<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36" />)}</div>) : projects.length === 0 ? (<EmptyState icon={Briefcase} title="No projects yet" description="Add your research projects." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Project</Button>} />) : (
        <div className="grid gap-4">
          {projects.map((proj, i) => (
            <motion.div key={proj.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0"><Briefcase size={18} className="text-emerald-600" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-sm">{proj.title}</h3><button onClick={() => deleteMutation.mutate(proj.id)} className="text-muted-foreground hover:text-destructive flex-shrink-0"><Trash2 size={15} /></button></div>
                    <div className="flex flex-wrap gap-2 mt-2"><Badge variant={statusColors[proj.status] || 'secondary'}>{proj.status}</Badge>{proj.funding_agency && <Badge variant="outline">{proj.funding_agency}</Badge>}</div>
                    <div className="mt-2 space-y-0.5">{proj.team_members && <p className="text-xs text-muted-foreground flex items-center gap-1"><Users size={11} /> {proj.team_members}</p>}{proj.description && <p className="text-xs text-muted-foreground">{proj.description}</p>}<p className="text-xs text-muted-foreground">{formatDate(proj.start_date)} — {proj.end_date ? formatDate(proj.end_date) : 'Present'}</p></div>
                    {proj.project_documents_url && (<a href={proj.project_documents_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"><ExternalLink size={12} /> Project Documents</a>)}
                  </div>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Project</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Title *" value={form.title || ''} onChange={f('title')} />
            <div className="space-y-1.5"><label className="text-sm font-medium">Status</label><Select value={form.status || 'Ongoing'} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Ongoing','Completed','Pending','On Hold'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <Input label="Funding Agency" value={form.funding_agency || ''} onChange={f('funding_agency')} />
            <div className="grid grid-cols-2 gap-3"><Input label="Start Date" type="date" value={form.start_date || ''} onChange={f('start_date')} /><Input label="End Date" type="date" value={form.end_date || ''} onChange={f('end_date')} /></div>
            <Input label="Team Members" placeholder="Name 1, Name 2" value={form.team_members || ''} onChange={f('team_members')} />
            <Textarea label="Description" rows={3} value={form.description || ''} onChange={f('description')} />
            <Input label="Project Documents URL" value={form.project_documents_url || ''} onChange={f('project_documents_url')} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add Project</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
