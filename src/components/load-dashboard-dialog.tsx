import { useState, useEffect } from 'react'
import { StoredDashboard } from '../types/storage'
import { getAllDashboards, deleteDashboard } from '../utils/storage'

interface LoadDashboardDialogProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (id: string) => void
  currentType: 'flow' | 'grid'
}

export function LoadDashboardDialog({ isOpen, onClose, onLoad, currentType }: LoadDashboardDialogProps) {
  const [dashboards, setDashboards] = useState<StoredDashboard[]>([])

  useEffect(() => {
    if (isOpen) {
      const stored = getAllDashboards()
      setDashboards(stored.filter(d => d.type === currentType))
    }
  }, [isOpen, currentType])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this dashboard?')) {
      deleteDashboard(id)
      setDashboards(prev => prev.filter(d => d.id !== id))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-lg shadow-lg w-[500px] max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Load Dashboard</h2>
        
        <div className="flex-1 overflow-y-auto">
          {dashboards.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No saved dashboards found
            </p>
          ) : (
            <div className="space-y-2">
              {dashboards.map(dashboard => (
                <div
                  key={dashboard.id}
                  onClick={() => onLoad(dashboard.id)}
                  className="flex items-center justify-between p-3 rounded border border-border 
                           hover:bg-muted/50 cursor-pointer group"
                >
                  <div>
                    <h3 className="font-medium">{dashboard.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last modified: {new Date(dashboard.lastModified).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(dashboard.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-destructive/10 
                             text-destructive rounded transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-border rounded hover:bg-muted/50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 