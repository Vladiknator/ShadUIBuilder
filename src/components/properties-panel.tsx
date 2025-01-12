import { Node } from 'reactflow'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Slider } from './ui/slider'
import { ChartDataForm } from './ui/chart-data-form'

interface PropertiesPanelProps {
  selectedNode: Node | null
  width: number
  onResize: () => void
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void
}

export function FlowPropertiesPanel({ selectedNode, width, onResize, onUpdateNode }: PropertiesPanelProps) {
  if (!selectedNode) return null

  const showFontSize = selectedNode.type === 'button' || selectedNode.type === 'label'
  const isChart = selectedNode.type === 'pieChart' || selectedNode.type === 'lineChart' || selectedNode.type === 'barChart'

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
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={selectedNode.data.title || selectedNode.data.label || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { 
                ...selectedNode.data,
                title: e.target.value 
              })}
            />
          </div>

          {showFontSize && (
            <div className="space-y-2">
              <Label>Font Size</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[selectedNode.data.fontSize || 14]}
                  min={8}
                  max={72}
                  step={1}
                  onValueChange={([value]) => onUpdateNode(selectedNode.id, {
                    ...selectedNode.data,
                    fontSize: value
                  })}
                />
                <span className="text-sm w-8">{selectedNode.data.fontSize || 14}px</span>
              </div>
            </div>
          )}

          {isChart && (
            <div className="space-y-2">
              <Label>Chart Data</Label>
              <ChartDataForm
                data={selectedNode.data.data || []}
                onChange={(newData) => onUpdateNode(selectedNode.id, { 
                  ...selectedNode.data,
                  data: newData
                })}
                showColorPicker={selectedNode.type === 'pieChart'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 