"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { ZodSchema } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"

export type FieldDef = {
  name: string
  label: string
  type?: "text" | "textarea" | "date" | "number" | "select" | "url"
  options?: string[]
  placeholder?: string
  required?: boolean
}

interface CrudModuleProps<T extends Record<string, any>> {
  title: string
  description: string
  apiPath: string           // e.g. "/v1/publications/me"
  createPath: string        // e.g. "/v1/publications/"
  deletePath: string        // (id: string) => path, e.g. "/v1/publications/"
  queryKey: string
  schema: ZodSchema
  fields: FieldDef[]
  renderCard: (item: T, onEdit: (item: T) => void, onDelete: (id: string) => void) => React.ReactNode
  emptyMessage?: string
}

export function CrudModule<T extends Record<string, any>>({
  title,
  description,
  apiPath,
  createPath,
  deletePath,
  queryKey,
  schema,
  fields,
  renderCard,
  emptyMessage = "No items found. Add your first one.",
}: CrudModuleProps<T>) {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)

  const { data: items = [], isLoading, error } = useQuery<T[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await api.get(apiPath)
      return res.data
    },
  })

  const form = useForm({
    resolver: zodResolver(schema as any),
  })

  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editingItem) {
        const id = editingItem.id
        const res = await api.put(`${deletePath}${id}`, values)
        return res.data
      } else {
        const res = await api.post(createPath, values)
        return res.data
      }
    },
    onSuccess: () => {
      toast.success(editingItem ? `${title} updated` : `${title} added`)
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      setDialogOpen(false)
      setEditingItem(null)
      form.reset()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Operation failed")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`${deletePath}${id}`)
    },
    onSuccess: () => {
      toast.success("Item deleted")
      queryClient.invalidateQueries({ queryKey: [queryKey] })
    },
    onError: () => toast.error("Delete failed"),
  })

  function openAdd() {
    setEditingItem(null)
    form.reset({})
    setDialogOpen(true)
  }

  function openEdit(item: T) {
    setEditingItem(item)
    const defaults: any = {}
    for (const f of fields) {
      defaults[f.name] = item[f.name] ?? ""
    }
    form.reset(defaults)
    setDialogOpen(true)
  }

  const onSubmit = (values: any) => saveMutation.mutate(values)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="size-4" />
          Add New
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {error && (
        <Card className="flex items-center gap-3 p-6 border-destructive/30 bg-destructive/5">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load data</p>
            <p className="text-xs text-muted-foreground">Please make sure your backend is running and you are logged in.</p>
          </div>
        </Card>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border-dashed">
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 gap-2">
            <Plus className="size-4" />
            Add First Entry
          </Button>
        </Card>
      )}

      {!isLoading && items.length > 0 && (
        <AnimatePresence>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                {renderCard(item, openEdit, (id) => deleteMutation.mutate(id))}
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingItem(null); form.reset({}) } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the details below." : "Fill in the details to add a new entry."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <form id="crud-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-2">
              {fields.map((field) => {
                const err = form.formState.errors[field.name] as any
                const registration = form.register(field.name, {
                  valueAsNumber: field.type === "number",
                })
                return (
                  <div key={field.name} className="space-y-1.5">
                    <Label htmlFor={field.name}>{field.label}{field.required && " *"}</Label>
                    {field.type === "select" ? (
                      <Select
                        value={(form.watch(field.name) as string) ?? ""}
                        onValueChange={(v) => form.setValue(field.name, v as any, { shouldValidate: true })}
                      >
                        <SelectTrigger id={field.name}>
                          <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "textarea" ? (
                      <Textarea id={field.name} rows={3} placeholder={field.placeholder} {...registration} />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type || "text"}
                        placeholder={field.placeholder}
                        {...registration}
                      />
                    )}
                    {err && <p className="text-xs text-destructive">{err.message}</p>}
                  </div>
                )
              })}
            </form>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="crud-form" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingItem ? "Save Changes" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
