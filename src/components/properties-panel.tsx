import { Node } from 'reactflow'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useState, useEffect } from 'react'

interface PropertiesPanelProps {
  selectedNode: Node | null
  width: number
  onResize: (e: React.MouseEvent) => void
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void
}

export function PropertiesPanel({ selectedNode, width, onResize, onUpdateNode }: PropertiesPanelProps) {
  const [labelValue, setLabelValue] = useState('')

  useEffect(() => {
    if (selectedNode) {
      setLabelValue(selectedNode.data.title || selectedNode.data.label || '')
    }
  }, [selectedNode?.id])

  if (!selectedNode) {
    return null
  }

  return (
    <div 
      className="relative bg-muted/30 flex"
      style={{ width }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent"
        onMouseDown={onResize}
      />
      <div className="flex-1 p-4 border-l">
        <h2 className="mb-4 font-semibold">Properties</h2>
        <div className="space-y-4">
          <div>
            <Label>Type</Label>
            <div className="text-sm text-muted-foreground capitalize">
              {selectedNode.type}
            </div>
          </div>

          <div>
            <Label>Label</Label>
            <Input
              value={labelValue}
              onChange={(e) => {
                const newValue = e.target.value
                setLabelValue(newValue)
                onUpdateNode(selectedNode.id, { 
                  ...selectedNode.data,
                  title: newValue 
                })
              }}
            />
          </div>

          <div>
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={selectedNode.position.x}
                  onChange={(e) => {
                    const x = parseFloat(e.target.value)
                    if (!isNaN(x)) {
                      selectedNode.position.x = x
                      onUpdateNode(selectedNode.id, selectedNode.data)
                    }
                  }}
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={selectedNode.position.y}
                  onChange={(e) => {
                    const y = parseFloat(e.target.value)
                    if (!isNaN(y)) {
                      selectedNode.position.y = y
                      onUpdateNode(selectedNode.id, selectedNode.data)
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 