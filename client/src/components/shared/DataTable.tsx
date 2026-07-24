import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onDelete?: (id: string) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  columns, data, isLoading, onDelete, emptyMessage = 'No records found.'
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data.length) {
    return <p className="text-center text-muted-foreground py-10 text-sm">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th key={String(col.accessor)} className={`text-left px-4 py-3 font-semibold text-foreground ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
            {onDelete && <th className="text-right px-4 py-3 font-semibold text-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <motion.tr
              key={row.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border-b last:border-0 hover:bg-muted/30 transition-colors"
            >
              {columns.map((col) => (
                <td key={String(col.accessor)} className={`px-4 py-3 ${col.className || ''}`}>
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : String(row[col.accessor] ?? '—')}
                </td>
              ))}
              {onDelete && (
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost" size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(row.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
