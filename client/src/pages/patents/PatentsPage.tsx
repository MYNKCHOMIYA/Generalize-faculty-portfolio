import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { patentApi } from '@/services/api'
import { Patent } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Shield, ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/utils'

const EMPTY = { title: '', patent_number: '', filing_date: '', status: 'Filed', inventors: '', link_url: '' }
const statusColors: Record<string, 'info' | 'success' | 'warning'> = { Filed: 'info', Granted: 'success', Published: 'warning' }

export function PatentsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Patent>>(EMPTY)

  const { data: patents = [], isLoading } = useQuery<Patent[]>({
    queryKey: ['patents', 'mine'],
    queryFn: () => patentApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Patent>) => patentApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patents'] }); setOpen(false); setForm(EMPTY); toast.success('Patent added!') },
    onError: () => toast.error('Failed to add patent.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patentApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patents'] }); toast.success('Patent removed') },
  })

  const f = (key: keyof Patent) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <PageHeader title="Patents" description="Intellectual property and innovation" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Patent</Button>} />
      {isLoading ? (<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>) : patents.length === 0 ? (
        <EmptyState icon={Shield} title="No patents yet" description="Add your patents and inventions." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Patent</Button>} />
      ) : (
        <div className="grid gap-4">
          {patents.map((pat, i) => (
            <motion.div key={pat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0"><Shield size={18} className="text-violet-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm">{pat.title}</h3>
                      <button onClick={() => deleteMutation.mutate(pat.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={statusColors[pat.status] || 'secondary'}>{pat.status}</Badge>
                      <Badge variant="outline">#{pat.patent_number}</Badge>
                      <Badge variant="outline">{formatDate(pat.filing_date)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Inventors: {pat.inventors}</p>
                    {pat.link_url && <a href={pat.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"><ExternalLink size={12} /> View Patent</a>}
                  </div>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Patent</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Title *" value={form.title || ''} onChange={f('title')} />
            <Input label="Patent Number *" value={form.patent_number || ''} onChange={f('patent_number')} />
            <Input label="Filing Date *" type="date" value={form.filing_date || ''} onChange={f('filing_date')} />
            <div className="space-y-1.5"><label className="text-sm font-medium">Status</label><Select value={form.status || 'Filed'} onValueChange={v => setForm(p => ({ ...p, status: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Filed','Granted','Published','Abandoned'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <Input label="Inventors *" placeholder="Name 1, Name 2" value={form.inventors || ''} onChange={f('inventors')} />
            <Input label="Link URL" value={form.link_url || ''} onChange={f('link_url')} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add Patent</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
