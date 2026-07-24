import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { experienceApi } from '@/services/api'
import { Experience } from '@/types'
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
import { Plus, GlobeIcon, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/utils'

const EMPTY = { job_title: '', organization: '', start_date: '', end_date: '', is_current: false, description: '', employment_type: 'Full-time' }

export function ExperiencePage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Experience>>(EMPTY)

  const { data: experience = [], isLoading } = useQuery<Experience[]>({
    queryKey: ['experience', 'mine'],
    queryFn: () => experienceApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Experience>) => experienceApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experience'] }); setOpen(false); setForm(EMPTY); toast.success('Experience added!') },
    onError: () => toast.error('Failed to add experience.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => experienceApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experience'] }); toast.success('Experience removed') },
  })

  const f = (key: keyof Experience) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <PageHeader title="Experience" description="Academic and professional work experience" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Experience</Button>} />
      {isLoading ? (<div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>) : experience.length === 0 ? (
        <EmptyState icon={GlobeIcon} title="No experience yet" description="Add your work and academic experience." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Experience</Button>} />
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
          {experience.map((exp, i) => (
            <motion.div key={exp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative mb-6">
              <div className="absolute -left-4 w-3 h-3 rounded-full bg-blue-600 border-2 border-background top-3" />
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{exp.job_title}</h3>
                    <p className="text-muted-foreground text-sm">{exp.organization}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant="outline" className="text-xs">{formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}</Badge>
                      {exp.employment_type && <Badge variant="info" className="text-xs">{exp.employment_type}</Badge>}
                      {exp.is_current && <Badge variant="success" className="text-xs">Current</Badge>}
                    </div>
                    {exp.description && <p className="text-xs text-muted-foreground mt-2">{exp.description}</p>}
                  </div>
                  <button onClick={() => deleteMutation.mutate(exp.id)} className="text-muted-foreground hover:text-destructive flex-shrink-0"><Trash2 size={14} /></button>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Experience</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Job Title *" value={form.job_title || ''} onChange={f('job_title')} />
            <Input label="Organization *" value={form.organization || ''} onChange={f('organization')} />
            <div className="space-y-1.5"><label className="text-sm font-medium">Employment Type</label><Select value={form.employment_type || 'Full-time'} onValueChange={v => setForm(p => ({ ...p, employment_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Full-time','Part-time','Contract','Visiting','Adjunct','Emeritus'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3"><Input label="Start Date *" type="date" value={form.start_date || ''} onChange={f('start_date')} /><Input label="End Date" type="date" value={form.end_date || ''} onChange={f('end_date')} /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={!!form.is_current} onChange={e => setForm(p => ({ ...p, is_current: e.target.checked }))} className="rounded" />Currently working here</label>
            <Textarea label="Description" rows={3} value={form.description || ''} onChange={f('description')} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add Experience</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
