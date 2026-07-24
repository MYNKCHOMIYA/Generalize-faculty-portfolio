import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { educationApi } from '@/services/api'
import { Education } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, GraduationCap, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const EMPTY = { degree: '', institution: '', year_of_passing: new Date().getFullYear(), field_of_study: '', grade: '' }

export function EducationPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Education>>(EMPTY)

  const { data: education = [], isLoading } = useQuery<Education[]>({
    queryKey: ['education', 'mine'],
    queryFn: () => educationApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Education>) => educationApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['education'] }); setOpen(false); setForm(EMPTY); toast.success('Education added!') },
    onError: () => toast.error('Failed to add education.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => educationApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['education'] }); toast.success('Record removed') },
  })

  const f = (key: keyof Education) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <PageHeader title="Education" description="Academic qualifications and degrees" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Education</Button>} />
      {isLoading ? (<div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>) : education.length === 0 ? (
        <EmptyState icon={GraduationCap} title="No education records" description="Add your academic qualifications." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Education</Button>} />
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
          {education.map((edu, i) => (
            <motion.div key={edu.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative mb-5">
              <div className="absolute -left-4 w-3 h-3 rounded-full bg-violet-600 border-2 border-background top-3" />
              <Card><CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{edu.degree}</h3>
                    <p className="text-muted-foreground text-sm">{edu.institution}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{edu.year_of_passing}</Badge>
                      {edu.field_of_study && <Badge variant="secondary">{edu.field_of_study}</Badge>}
                      {edu.grade && <Badge variant="success">{edu.grade}</Badge>}
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(edu.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Education</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Degree *" placeholder="e.g. Ph.D., M.Tech" value={form.degree || ''} onChange={f('degree')} />
            <Input label="Institution *" value={form.institution || ''} onChange={f('institution')} />
            <Input label="Field of Study" value={form.field_of_study || ''} onChange={f('field_of_study')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Year of Passing" type="number" value={String(form.year_of_passing || '')} onChange={e => setForm(p => ({ ...p, year_of_passing: parseInt(e.target.value) }))} />
              <Input label="Grade / CGPA" value={form.grade || ''} onChange={f('grade')} />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
