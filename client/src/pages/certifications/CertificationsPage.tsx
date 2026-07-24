import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { certificationApi } from '@/services/api'
import { Certification } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, BadgeCheck, ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/utils'

const EMPTY = { name: '', organization: '', issue_date: '', expiry_date: '', certificate_url: '' }

export function CertificationsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Certification>>(EMPTY)

  const { data: certifications = [], isLoading } = useQuery<Certification[]>({
    queryKey: ['certifications', 'mine'],
    queryFn: () => certificationApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Certification>) => certificationApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); setOpen(false); setForm(EMPTY); toast.success('Certification added!') },
    onError: () => toast.error('Failed to add certification.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => certificationApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['certifications'] }); toast.success('Certification removed') },
  })

  const f = (key: keyof Certification) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const isExpired = (expiry?: string) => expiry && new Date(expiry) < new Date()

  return (
    <div>
      <PageHeader title="Certifications" description="Professional certifications and credentials" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Certification</Button>} />
      {isLoading ? (<div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>) : certifications.length === 0 ? (
        <EmptyState icon={BadgeCheck} title="No certifications yet" description="Add your professional certifications." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Certification</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certifications.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0"><BadgeCheck size={17} className="text-emerald-600" /></div>
                    <div>
                      <h3 className="font-semibold text-sm">{cert.name}</h3>
                      <p className="text-xs text-muted-foreground">{cert.organization}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-xs">Issued: {formatDate(cert.issue_date)}</Badge>
                        {cert.expiry_date && <Badge variant={isExpired(cert.expiry_date) ? 'destructive' : 'success'} className="text-xs">{isExpired(cert.expiry_date) ? 'Expired' : `Expires: ${formatDate(cert.expiry_date)}`}</Badge>}
                      </div>
                      {cert.certificate_url && <a href={cert.certificate_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"><ExternalLink size={11} /> View Certificate</a>}
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(cert.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Certification</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Certification Name *" value={form.name || ''} onChange={f('name')} />
            <Input label="Issuing Organization *" value={form.organization || ''} onChange={f('organization')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Issue Date *" type="date" value={form.issue_date || ''} onChange={f('issue_date')} />
              <Input label="Expiry Date" type="date" value={form.expiry_date || ''} onChange={f('expiry_date')} />
            </div>
            <Input label="Certificate URL" value={form.certificate_url || ''} onChange={f('certificate_url')} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
