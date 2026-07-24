import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { studentGuidanceApi } from '@/services/api'
import { StudentGuidance } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Users, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const EMPTY = { student_name: '', topic: '', degree_type: 'M.Tech', status: 'Ongoing', year: new Date().getFullYear() }
const statusColors: Record<string, 'success' | 'info' | 'warning'> = { Ongoing: 'info', Completed: 'success', Dropped: 'warning' }

export function StudentGuidancePage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<StudentGuidance>>(EMPTY)

  const { data: guidance = [], isLoading } = useQuery<StudentGuidance[]>({
    queryKey: ['student-guidance', 'mine'],
    queryFn: () => studentGuidanceApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<StudentGuidance>) => studentGuidanceApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-guidance'] }); setOpen(false); setForm(EMPTY); toast.success('Student record added!') },
    onError: () => toast.error('Failed to add record.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentGuidanceApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['student-guidance'] }); toast.success('Record removed') },
  })

  const f = (key: keyof StudentGuidance) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <PageHeader title="Student Guidance" description="PhD, M.Tech thesis supervision and mentoring" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Student</Button>} />
      {isLoading ? (<div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>) : guidance.length === 0 ? (
        <EmptyState icon={Users} title="No student records" description="Add your PhD/thesis supervision records." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Student</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {guidance.map((student, i) => (
            <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Users size={16} className="text-blue-600" /></div>
                    <div>
                      <h3 className="font-semibold text-sm">{student.student_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{student.topic}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {student.degree_type && <Badge variant="secondary" className="text-xs">{student.degree_type}</Badge>}
                        {student.status && <Badge variant={statusColors[student.status] || 'secondary'} className="text-xs">{student.status}</Badge>}
                        {student.year && <Badge variant="outline" className="text-xs">{student.year}</Badge>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(student.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Student Guidance</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Student Name *" value={form.student_name || ''} onChange={f('student_name')} />
            <Input label="Topic / Thesis Title *" value={form.topic || ''} onChange={f('topic')} />
            <div className="space-y-1.5"><label className="text-sm font-medium">Degree Type</label><Select value={form.degree_type || 'M.Tech'} onValueChange={v => setForm(p => ({ ...p, degree_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Ph.D.','M.Tech','M.E.','M.Phil','M.Sc','B.Tech'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-1.5"><label className="text-sm font-medium">Status</label><Select value={form.status || 'Ongoing'} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Ongoing','Completed','Dropped'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <Input label="Year" type="number" value={String(form.year || '')} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
