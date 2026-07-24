import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { teachingApi } from '@/services/api'
import { Teaching } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, BookMarked, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const EMPTY = { course_name: '', course_code: '', level: '', semester: '', year: new Date().getFullYear() }

export function TeachingPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Partial<Teaching>>(EMPTY)

  const { data: teaching = [], isLoading } = useQuery<Teaching[]>({
    queryKey: ['teaching', 'mine'],
    queryFn: () => teachingApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Teaching>) => teachingApi.create(data as Record<string, unknown>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teaching'] }); setOpen(false); setForm(EMPTY); toast.success('Course added!') },
    onError: () => toast.error('Failed to add course.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teachingApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teaching'] }); toast.success('Course removed') },
  })

  const f = (key: keyof Teaching) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  return (
    <div>
      <PageHeader title="Teaching" description="Courses taught and academic instruction" action={<Button onClick={() => { setForm(EMPTY); setOpen(true) }}><Plus size={16} /> Add Course</Button>} />
      {isLoading ? (<div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>) : teaching.length === 0 ? (
        <EmptyState icon={BookMarked} title="No courses yet" description="Add your teaching assignments." action={<Button onClick={() => setOpen(true)}><Plus size={16} /> Add Course</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {teaching.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="hover:shadow-card-hover transition-all"><CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><BookMarked size={16} className="text-blue-600" /></div>
                    <div>
                      <h3 className="font-semibold text-sm">{course.course_name}</h3>
                      <div className="flex gap-1.5 mt-1">
                        {course.course_code && <Badge variant="outline" className="text-xs">{course.course_code}</Badge>}
                        {course.level && <Badge variant="secondary" className="text-xs">{course.level}</Badge>}
                        {course.semester && <Badge variant="info" className="text-xs">{course.semester}</Badge>}
                        {course.year && <Badge variant="outline" className="text-xs">{course.year}</Badge>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => deleteMutation.mutate(course.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Course</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input label="Course Name *" value={form.course_name || ''} onChange={f('course_name')} />
            <Input label="Course Code" value={form.course_code || ''} onChange={f('course_code')} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Level" placeholder="UG / PG" value={form.level || ''} onChange={f('level')} />
              <Input label="Semester" placeholder="1st / 2nd" value={form.semester || ''} onChange={f('semester')} />
            </div>
            <Input label="Year" type="number" value={String(form.year || '')} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={createMutation.isPending} onClick={() => createMutation.mutate(form)}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
