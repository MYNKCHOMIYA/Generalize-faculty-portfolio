import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { achievementApi } from '@/services/api'
import { Achievement } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Award, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/utils'

const EMPTY = { title: '', description: '', date_received: '' }

export function AchievementsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Achievement>>(EMPTY)

  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ['achievements', 'mine'],
    queryFn: () => achievementApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Achievement>) => achievementApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['achievements'] }); setOpen(false); setForm(EMPTY); toast.success('Achievement added!') },
    onError: () => toast.error('Failed to add achievement.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => achievementApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['achievements'] }); toast.success('Achievement removed') },
  })

  return (
    <div>
      <PageHeader title="Achievements" description="Awards, honors, and recognitions" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Achievement</Button>} />
      {isLoading ? (<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>) : achievements.length === 0 ? (
        <EmptyState icon={Award} title="No achievements yet" description="Add your awards and recognitions." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Achievement</Button>} />
      ) : (
        <div className="grid gap-4">
          {achievements.map((ach, i) => (
            <motion.div key={ach.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0"><Award size={18} className="text-amber-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{ach.title}</h3>
                      <button onClick={() => deleteMutation.mutate(ach.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                    {ach.date_received && <Badge variant="outline" className="mt-2 text-xs">{formatDate(ach.date_received)}</Badge>}
                    {ach.description && <p className="text-xs text-muted-foreground mt-2">{ach.description}</p>}
                  </div>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Achievement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Title *" value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <Input label="Date Received" type="date" value={form.date_received || ''} onChange={e => setForm(p => ({ ...p, date_received: e.target.value }))} />
            <Textarea label="Description" rows={3} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
