import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { publicationApi } from '@/services/api'
import { Publication } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, BookOpen, ExternalLink, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatYear } from '@/utils'

const EMPTY_PUB = { title: '', publication_type: 'Journal', publication_year: new Date().getFullYear(), doi: '', citations: 0, authors: '', journal: '', issn: '', indexed_in: '', pdf_url: '', publisher: '' }

export function PublicationsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Publication>>(EMPTY_PUB)

  const { data: publications = [], isLoading } = useQuery<Publication[]>({
    queryKey: ['publications', 'mine'],
    queryFn: () => publicationApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Publication>) => publicationApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['publications'] }); setOpen(false); setForm(EMPTY_PUB); toast.success('Publication added!') },
    onError: () => toast.error('Failed to add publication. Create a faculty profile first.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => publicationApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['publications'] }); toast.success('Publication removed') },
  })

  const f = (key: keyof Publication) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))
  const typeColors: Record<string, 'info' | 'success' | 'warning' | 'secondary'> = { Journal: 'info', Conference: 'success', Book: 'warning', default: 'secondary' }

  return (
    <div>
      <PageHeader title="Publications" description="Manage your research publications and academic papers" action={<Button onClick={() => { setForm(EMPTY_PUB); setOpen(true) }}><Plus size={16} /> Add Publication</Button>} />
      {isLoading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : publications.length === 0 ? (
        <EmptyState icon={BookOpen} title="No publications yet" description="Add your research papers, journals, and conference proceedings." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add First Publication</Button>} />
      ) : (
        <div className="grid gap-4">
          {publications.map((pub, i) => (
            <motion.div key={pub.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-card-hover transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"><BookOpen size={18} className="text-blue-600" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm leading-snug">{pub.title}</h3>
                        <button onClick={() => deleteMutation.mutate(pub.id)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"><Trash2 size={15} /></button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant={typeColors[pub.publication_type] || 'secondary'}>{pub.publication_type}</Badge>
                        <Badge variant="outline">{formatYear(pub.publication_year)}</Badge>
                        {pub.indexed_in && <Badge variant="success">{pub.indexed_in}</Badge>}
                        {pub.citations > 0 && <Badge variant="warning">{pub.citations} citations</Badge>}
                      </div>
                      <div className="mt-2 space-y-0.5">
                        {pub.authors && <p className="text-xs text-muted-foreground"><span className="font-medium">Authors:</span> {pub.authors}</p>}
                        {pub.journal && <p className="text-xs text-muted-foreground"><span className="font-medium">Journal:</span> {pub.journal}</p>}
                        {pub.issn && <p className="text-xs text-muted-foreground"><span className="font-medium">ISSN:</span> {pub.issn}</p>}
                      </div>
                      {pub.pdf_url && (<a href={pub.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline"><ExternalLink size={12} /> View PDF</a>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Publication</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Title *" value={form.title || ''} onChange={f('title')} />
            <div className="space-y-1.5"><label className="text-sm font-medium">Type *</label><Select value={form.publication_type || 'Journal'} onValueChange={v => setForm(p => ({ ...p, publication_type: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['Journal','Conference','Book','Book Chapter','Thesis'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <Input label="Authors" placeholder="Author 1, Author 2" value={form.authors || ''} onChange={f('authors')} />
            <Input label="Journal / Conference Name" value={form.journal || ''} onChange={f('journal')} />
            <div className="grid grid-cols-2 gap-3"><Input label="Year" type="number" value={String(form.publication_year || '')} onChange={e => setForm(p => ({ ...p, publication_year: parseInt(e.target.value) }))} /><Input label="ISSN" value={form.issn || ''} onChange={f('issn')} /></div>
            <Input label="Indexed In" value={form.indexed_in || ''} onChange={f('indexed_in')} />
            <Input label="DOI" value={form.doi || ''} onChange={f('doi')} />
            <Input label="PDF URL" value={form.pdf_url || ''} onChange={f('pdf_url')} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add Publication</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
