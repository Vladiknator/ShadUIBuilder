import { BlockLayout, BLOCK_TYPES } from '../types/blocks'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { ChartDataForm } from './ui/chart-data-form'
import { DataTableForm } from './ui/data-table-form'

interface PropertiesPanelProps {
  selectedBlock: BlockLayout | null
  width: number
  onResize: (e: React.MouseEvent) => void
  onUpdateBlock: (blockId: string, updates: Partial<BlockLayout>) => void
}

export function PropertiesPanel({ selectedBlock, width, onResize, onUpdateBlock }: PropertiesPanelProps) {
  const renderPropertiesContent = () => {
    if (!selectedBlock) return null;

    const data = selectedBlock.data ? JSON.parse(selectedBlock.data) : null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={selectedBlock.title || ''}
            onChange={(e) => onUpdateBlock(selectedBlock.i, { title: e.target.value })}
          />
        </div>

        {selectedBlock.type === 'text' && (
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={data?.content || ''}
              onChange={(e) => onUpdateBlock(selectedBlock.i, { 
                data: JSON.stringify({ content: e.target.value }) 
              })}
            />
          </div>
        )}

        {(selectedBlock.type === 'pie-chart' || selectedBlock.type === 'line-chart' || selectedBlock.type === 'bar-chart') && (
          <div className="space-y-2">
            <Label>Chart Data</Label>
            <ChartDataForm
              data={data || []}
              onChange={(newData) => onUpdateBlock(selectedBlock.i, { 
                data: JSON.stringify(newData) 
              })}
              showColorPicker={selectedBlock.type === 'pie-chart'}
            />
          </div>
        )}

        {selectedBlock.type === 'data-table' && (
          <div className="space-y-2">
            <Label>Table Data</Label>
            <DataTableForm
              data={data || []}
              onChange={(newData) => onUpdateBlock(selectedBlock.i, { 
                data: JSON.stringify(newData) 
              })}
            />
          </div>
        )}
      </div>
    );
  };

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
        {selectedBlock ? (
          <div className="space-y-2">
            <div className="rounded-md border bg-card text-card-foreground p-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <div className="text-sm text-muted-foreground">
                  {BLOCK_TYPES.find(b => b.id === selectedBlock.type)?.label}
                </div>
              </div>
            </div>
            {renderPropertiesContent()}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a block to edit its properties
          </div>
        )}
      </div>
    </div>
  )
} 