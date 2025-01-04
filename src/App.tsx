import { useState, useEffect } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { GripVertical, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart as BarChartIcon, Type, Table as TableIcon, X } from 'lucide-react'
import { PieChart, LineChartComponent, BarChartComponent } from './components/ui/charts'
import { TextBlock } from './components/ui/text-block'
import { DataTable } from './components/ui/data-table'
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
  { id: 'data-table', icon: TableIcon, label: 'Data Table', component: DataTable },
]

function App() {
  const [width, setWidth] = useState(1200)
  const [layouts, setLayouts] = useState<BlockLayout[]>([])
  const [blockCount, setBlockCount] = useState(1)
  const [selectedBlock, setSelectedBlock] = useState<BlockLayout | null>(null)
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.layout-container')
      if (container) {
        const containerWidth = container.clientWidth - 32
        setWidth(containerWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX
        setPropertiesPanelWidth(Math.max(200, Math.min(600, newWidth)))
        
        const container = document.querySelector('.layout-container')
        if (container) {
          const containerWidth = container.clientWidth - 32
          setWidth(containerWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

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

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-muted/30 p-4">
        <h2 className="mb-4 font-semibold">Add Blocks</h2>
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
                  <div 
                    className="flex items-center justify-between p-3 border-b bg-muted/50 drag-handle cursor-move"
                    onMouseDown={(e) => {
                      if (e.button === 0) {
                        setSelectedBlock(layout);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {layout.title || `${BLOCK_TYPES.find(b => b.id === layout.type)?.label || 'Chart'} ${layout.i}`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(layout.i);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div 
                    className="p-4 h-[calc(100%-48px)] cursor-pointer"
                    onClick={() => setSelectedBlock(layout)}
                  >
                    {renderBlockContent(layout)}
                  </div>
                </Card>
              </div>
            ))}
          </GridLayout>
        </div>
      </div>

      <div 
        className="relative bg-muted/30 flex"
        style={{ width: propertiesPanelWidth }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-accent"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizing(true)
          }}
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
              <div className="rounded-md border bg-card text-card-foreground p-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={selectedBlock.title}
                    onChange={(e) => {
                      const newBlock = {
                        ...selectedBlock,
                        title: e.target.value
                      };
                      setSelectedBlock(newBlock);
                      updateBlockProperties(newBlock, e.target.value, newBlock.data || '');
                    }}
                  />
                </div>
              </div>
              {selectedBlock.type === 'text' ? (
                <div className="rounded-md border bg-card text-card-foreground p-4">
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={selectedBlock.data ? JSON.parse(selectedBlock.data).content : ''}
                      rows={10}
                      onChange={(e) => {
                        const newData = JSON.stringify({ content: e.target.value });
                        const newBlock = {
                          ...selectedBlock,
                          data: newData
                        };
                        setSelectedBlock(newBlock);
                        updateBlockProperties(newBlock, newBlock.title || '', newData);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-md border bg-card text-card-foreground p-4">
                  <div className="grid gap-2">
                    <Label htmlFor="data">Chart Data</Label>
                    <ChartDataForm
                      data={selectedBlock.data ? JSON.parse(selectedBlock.data) : []}
                      onChange={(chartData) => {
                        const newData = JSON.stringify(chartData);
                        const newBlock = {
                          ...selectedBlock,
                          data: newData
                        };
                        setSelectedBlock(newBlock);
                        updateBlockProperties(newBlock, newBlock.title || '', newData);
                      }}
                      showColorPicker={selectedBlock.type === 'pie-chart'}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select a block to edit its properties
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
