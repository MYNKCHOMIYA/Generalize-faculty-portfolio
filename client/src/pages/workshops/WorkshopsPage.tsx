import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { workshopApi } from '@/services/api'
import { Workshop } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Presentation, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/utils'

const EMPTY = { title: '', role: 'Participant', organizer: '', date: '', duration_days: 1 }

export function WorkshopsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Workshop>>(EMPTY)

  const { data: workshops = [], isLoading } = useQuery<Workshop[]>({
    queryKey: ['workshops', 'mine'],
    queryFn: () => workshopApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Workshop>) => workshopApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workshops'] }); setOpen(false); setForm(EMPTY); toast.success('Workshop added!') },
    onError: () => toast.error('Failed to add workshop.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workshopApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workshops'] }); toast.success('Workshop removed') },
  })

  const f = (key: keyof Workshop) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  const roleColors: Record<string, 'success' | 'info' | 'warning'> = { Speaker: 'success', Organizer: 'info', Participant: 'warning' }

  return (
    <div>
      <PageHeader title="Workshops & FDP" description="Faculty development programs, workshops, and seminars" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Workshop</Button>} />
      {isLoading ? (<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>) : workshops.length === 0 ? (
        <EmptyState icon={Presentation} title="No workshops yet" description="Add workshops and FDP programs you attended or organized." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Workshop</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {workshops.map((ws, i) => (
            <motion.div key={ws.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><Presentation size={16} className="text-indigo-600" /></div>
                    <div>
                      <h3 className="font-semibold text-sm">{ws.title}</h3>
                      {ws.organizer && <p className="text-xs text-muted-foreground">{ws.organizer}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {ws.role && <Badge variant={roleColors[ws.role] || 'secondary'} className="text-xs">{ws.role}</Badge>}
                        {ws.date && <Badge variant="outline" className="text-xs">{formatDate(ws.date)}</Badge>}
                        {ws.duration_days && <Badge variant="secondary" className="text-xs">{ws.duration_days} day{ws.duration_days > 1 ? 's' : ''}</Badge>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(ws.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Workshop / FDP</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Title *" value={form.title || ''} onChange={f('title')} />
            <div className="space-y-1.5"><label className="text-sm font-medium">Your Role</label><Select value={form.role || 'Participant'} onValueChange={v => setForm(p => ({ ...p, role: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Participant','Speaker','Organizer','Coordinator','Resource Person'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
            <Input label="Organizer" value={form.organizer || ''} onChange={f('organizer')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Date" type="date" value={form.date || ''} onChange={f('date')} />
              <Input label="Duration (days)" type="number" value={String(form.duration_days || 1)} onChange={e => setForm(p => ({ ...p, duration_days: parseInt(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
