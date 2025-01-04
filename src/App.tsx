import { useState, useEffect } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { GripVertical, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart as BarChartIcon, Settings2, Trash2, Type } from 'lucide-react'
import { PieChart, LineChartComponent, BarChartComponent } from './components/ui/charts'
import { TextBlock } from './components/ui/text-block'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import { ChartDataForm } from './components/ui/chart-data-form'

interface BlockLayout extends Layout {
  type: string;
  title?: string;
  data?: string;
}

const BLOCK_TYPES = [
  { id: 'text', icon: Type, label: 'Text Block', component: TextBlock },
  { id: 'pie-chart', icon: PieChartIcon, label: 'Pie Chart', component: PieChart },
  { id: 'line-chart', icon: LineChartIcon, label: 'Line Chart', component: LineChartComponent },
  { id: 'bar-chart', icon: BarChartIcon, label: 'Bar Chart', component: BarChartComponent },
]

function App() {
  const [width, setWidth] = useState(1200)
  const [layouts, setLayouts] = useState<BlockLayout[]>([])
  const [blockCount, setBlockCount] = useState(1)
  const [selectedBlock, setSelectedBlock] = useState<BlockLayout | null>(null)

  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.layout-container')
      if (container) {
        setWidth(container.clientWidth - 32)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

  const addNewBlock = (type: string) => {
    const newBlock: BlockLayout = {
      i: `block${blockCount}`,
      x: (layouts.length * 2) % (Math.floor(width / 150)),
      y: Infinity,
      w: 4,
      h: type === 'text' ? 3 : 5,
      type,
      title: `${BLOCK_TYPES.find(b => b.id === type)?.label || 'Block'} ${blockCount}`,
      data: type === 'text' ? 
        JSON.stringify({ content: 'Enter your text here...' }) :
        type === 'line-chart' ? 
          JSON.stringify([
            { name: 'Jan', value: 400 },
            { name: 'Feb', value: 300 },
            { name: 'Mar', value: 600 },
          ], null, 2) :
          JSON.stringify([
            { name: 'A', value: 400, color: defaultColors[0] },
            { name: 'B', value: 300, color: defaultColors[1] },
            { name: 'C', value: 300, color: defaultColors[2] },
          ], null, 2)
    }
    setLayouts([...layouts, newBlock])
    setBlockCount(blockCount + 1)
  }

  const handleLayoutChange = (newLayout: Layout[]) => {
    const updatedLayout = newLayout.map(item => ({
      ...layouts.find(l => l.i === item.i),
      ...item,
    }))
    setLayouts(updatedLayout as BlockLayout[])
  }

  const updateBlockProperties = (block: BlockLayout, newTitle: string, newData: string) => {
    const updatedLayouts = layouts.map(l => 
      l.i === block.i ? { ...l, title: newTitle, data: newData } : l
    )
    setLayouts(updatedLayouts)
    setSelectedBlock(null)
  }

  const deleteBlock = (blockId: string) => {
    setLayouts(layouts.filter(l => l.i !== blockId))
    setSelectedBlock(null)
  }

  const renderBlockContent = (layout: BlockLayout) => {
    const blockType = BLOCK_TYPES.find(b => b.id === layout.type)
    if (blockType?.component) {
      const Component = blockType.component
      try {
        const data = layout.data ? JSON.parse(layout.data) : null
        return <Component data={data} />
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        return <div className="text-destructive">Invalid data format: {message}</div>
      }
    }
    return null
  }

  const handleChartDataChange = (data: Array<{ name: string; value: number; color?: string }>) => {
    if (selectedBlock) {
      setSelectedBlock({
        ...selectedBlock,
        data: JSON.stringify(data, null, 2)
      })
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-muted/30 p-4">
        <h2 className="mb-4 font-semibold">Chart Types</h2>
        <div className="space-y-2">
          {BLOCK_TYPES.map((blockType) => (
            <Button
              key={blockType.id}
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => addNewBlock(blockType.id)}
            >
              <blockType.icon className="h-4 w-4" />
              {blockType.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="layout-container bg-muted rounded-lg p-4">
          <GridLayout
            className="layout"
            layout={layouts.map(l => ({
              ...l,
              minH: l.type !== 'text' ? 3 : 2,
              minW: 3
            }))}
            cols={Math.max(6, Math.floor(width / 150))}
            rowHeight={80}
            width={width}
            maxRows={100}
            compactType="vertical"
            preventCollision={false}
            margin={[12, 12]}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            resizeHandles={['se']}
          >
            {layouts.map((layout) => (
              <div key={layout.i}>
                <Card className="h-full">
                  <div className="flex items-center justify-between p-3 border-b bg-muted/50">
                    <div className="drag-handle flex items-center gap-2 cursor-move">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {layout.title || `${BLOCK_TYPES.find(b => b.id === layout.type)?.label || 'Chart'} ${layout.i}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedBlock(layout)}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                          <DialogHeader>
                            <DialogTitle>Block Properties</DialogTitle>
                          </DialogHeader>
                          {selectedBlock && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                  id="title"
                                  value={selectedBlock.title}
                                  onChange={(e) => {
                                    setSelectedBlock({
                                      ...selectedBlock,
                                      title: e.target.value
                                    })
                                  }}
                                />
                              </div>
                              {selectedBlock.type === 'text' ? (
                                <div className="grid gap-2">
                                  <Label htmlFor="content">Content</Label>
                                  <Textarea
                                    id="content"
                                    value={selectedBlock.data ? JSON.parse(selectedBlock.data).content : ''}
                                    rows={10}
                                    onChange={(e) => {
                                      setSelectedBlock({
                                        ...selectedBlock,
                                        data: JSON.stringify({ content: e.target.value })
                                      })
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="grid gap-2">
                                  <Label htmlFor="data">Chart Data</Label>
                                  <ChartDataForm
                                    data={selectedBlock.data ? JSON.parse(selectedBlock.data) : []}
                                    onChange={handleChartDataChange}
                                    showColorPicker={selectedBlock.type === 'pie-chart'}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          <DialogFooter className="gap-2">
                            <Button
                              variant="destructive"
                              onClick={() => deleteBlock(selectedBlock?.i || '')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                            <DialogClose asChild>
                              <Button
                                type="submit"
                                onClick={() => {
                                  if (selectedBlock) {
                                    updateBlockProperties(
                                      selectedBlock,
                                      selectedBlock.title || '',
                                      selectedBlock.data || ''
                                    )
                                  }
                                }}
                              >
                                Save changes
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="p-4 h-[calc(100%-48px)]">
                    {renderBlockContent(layout)}
                  </div>
                </Card>
              </div>
            ))}
          </GridLayout>
        </div>
      </div>
    </div>
  )
}

export default App
