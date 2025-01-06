import { useState, useEffect } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './App.css'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { GripVertical, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart as BarChartIcon, Type, Table as TableIcon, X, Moon, Sun, PanelRightClose, PanelRight } from 'lucide-react'
import { PieChart, LineChartComponent, BarChartComponent } from './components/ui/charts'
import { TextBlock } from './components/ui/text-block'
import { DataTable } from './components/ui/data-table'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Textarea } from './components/ui/textarea'
import { ChartDataForm } from './components/ui/chart-data-form'
import { useTheme } from './components/theme-provider'
import { DataTableForm } from './components/ui/data-table-form'

interface BlockLayout extends Layout {
  type: string;
  title?: string;
  data?: string;
  minH?: number;
  minW?: number;
  maxW?: number;
}

const BLOCK_TYPES = [
  { id: 'text', icon: Type, label: 'Text Block', component: TextBlock },
  { id: 'pie-chart', icon: PieChartIcon, label: 'Pie Chart', component: PieChart },
  { id: 'line-chart', icon: LineChartIcon, label: 'Line Chart', component: LineChartComponent },
  { id: 'bar-chart', icon: BarChartIcon, label: 'Bar Chart', component: BarChartComponent },
  { id: 'data-table', icon: TableIcon, label: 'Data Table', component: DataTable },
]

const defaultTableData = [
  { date: '2024-01-01', temperature: 20, pressure: 1013 },
  { date: '2024-01-02', temperature: 22, pressure: 1012 },
  { date: '2024-01-03', temperature: 19, pressure: 1014 },
  { date: '2024-01-04', temperature: 21, pressure: 1015 },
  { date: '2024-01-05', temperature: 23, pressure: 1011 },
];

// Block type constraints
const BLOCK_CONSTRAINTS = {
  'data-table': {
    defaultW: 6,
    defaultH: 5,
    minW: 3,
    minH: 5,
    maxW: 12,
  },
  'pie-chart': {
    defaultW: 4,
    defaultH: 4,
    minW: 3,
    minH: 3,
    maxW: 8,
  },
  'line-chart': {
    defaultW: 6,
    defaultH: 4,
    minW: 4,
    minH: 3,
    maxW: 12,
  },
  'bar-chart': {
    defaultW: 6,
    defaultH: 4,
    minW: 4,
    minH: 3,
    maxW: 12,
  },
  'text': {
    defaultW: 4,
    defaultH: 3,
    minW: 1,
    minH: 2,
    maxW: 12,
  },
} as const;

function App() {
  const [width, setWidth] = useState(1200)
  const [layouts, setLayouts] = useState<BlockLayout[]>([])
  const [blockCount, setBlockCount] = useState(1)
  const [selectedBlock, setSelectedBlock] = useState<BlockLayout | null>(null)
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256)
  const [isResizing, setIsResizing] = useState(false)
  const [isPanelVisible, setIsPanelVisible] = useState(true)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.layout-container')
      if (container) {
        // Calculate available width based on sidebar and properties panel
        const sidebarWidth = 256; // w-64 = 16rem = 256px
        const availableWidth = window.innerWidth - sidebarWidth - (isPanelVisible ? propertiesPanelWidth : 0);
        // Set width to available space minus outer padding
        const containerWidth = Math.max(400, availableWidth - 32); // 32px for outer container padding (16px each side)
        setWidth(containerWidth);
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [isPanelVisible, propertiesPanelWidth])

  // Calculate columns based on screen size only
  const getGridColumns = () => {
    const sidebarWidth = 256; // w-64 = 16rem = 256px
    const screenWidth = window.innerWidth - sidebarWidth;
    // Use screen width to determine number of columns
    return Math.max(6, Math.floor((screenWidth - 32) / 150)); // 32px for outer container padding
  }

  const [gridColumns, setGridColumns] = useState(getGridColumns());

  useEffect(() => {
    const updateColumns = () => {
      setGridColumns(getGridColumns());
    }

    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX
        setPropertiesPanelWidth(Math.max(200, Math.min(600, newWidth)))
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
    // Calculate number of columns based on width
    const cols = Math.max(12, Math.floor(width / 150));
    
    // Get block constraints
    const constraints = BLOCK_CONSTRAINTS[type as keyof typeof BLOCK_CONSTRAINTS];
    
    // Create a 2D grid to track occupied spaces
    const grid: boolean[][] = [];
    for (let y = 0; y < 100; y++) {
      grid[y] = new Array(cols).fill(false);
    }

    // Mark occupied spaces
    layouts.forEach(layout => {
      for (let y = layout.y; y < layout.y + layout.h; y++) {
        for (let x = layout.x; x < layout.x + layout.w; x++) {
          if (grid[y]) grid[y][x] = true;
        }
      }
    });

    // Find first available space
    let position = { x: 0, y: 0 };
    outerLoop: for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= cols - constraints.defaultW; x++) {
        let spaceAvailable = true;
        // Check if there's enough space for the block
        for (let dy = 0; dy < constraints.defaultH; dy++) {
          for (let dx = 0; dx < constraints.defaultW; dx++) {
            if (grid[y + dy]?.[x + dx]) {
              spaceAvailable = false;
              break;
            }
          }
          if (!spaceAvailable) break;
        }
        if (spaceAvailable) {
          position = { x, y };
          break outerLoop;
        }
      }
    }

    // Initialize default data based on block type
    let defaultData;
    switch (type) {
      case 'pie-chart':
        defaultData = [
          { name: 'A', value: 400, color: defaultColors[0] },
          { name: 'B', value: 300, color: defaultColors[1] },
          { name: 'C', value: 200, color: defaultColors[2] },
        ];
        break;
      case 'line-chart':
      case 'bar-chart':
        defaultData = [
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 200 },
        ];
        break;
      case 'text':
        defaultData = { content: 'Enter your text here...' };
        break;
      case 'data-table':
        defaultData = defaultTableData;
        break;
      default:
        defaultData = null;
    }

    const newBlock: BlockLayout = {
      i: `block-${blockCount}`,
      x: position.x,
      y: position.y,
      w: constraints.defaultW,
      h: constraints.defaultH,
      minW: constraints.minW,
      minH: constraints.minH,
      maxW: constraints.maxW,
      type,
      title: `${type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${blockCount + 1}`,
      data: defaultData ? JSON.stringify(defaultData) : undefined,
    };

    setLayouts([...layouts, newBlock]);
    setBlockCount(blockCount + 1);
  };

  const handleLayoutChange = (newLayout: Layout[]) => {
    const updatedLayout = newLayout.map(item => ({
      ...layouts.find(l => l.i === item.i),
      ...item,
    }))
    setLayouts(updatedLayout as BlockLayout[])
  }

  const updateBlockProperties = (blockId: string, updates: Partial<BlockLayout>) => {
    const updatedLayouts = layouts.map(block => {
      if (block.i === blockId) {
        const updatedBlock = { ...block, ...updates };
        // Update selectedBlock if this is the currently selected block
        if (selectedBlock?.i === blockId) {
          setSelectedBlock(updatedBlock);
        }
        return updatedBlock;
      }
      return block;
    });
    setLayouts(updatedLayouts);
  };

  const deleteBlock = (blockId: string) => {
    setLayouts(layouts.filter(l => l.i !== blockId))
    setSelectedBlock(null)
  }

  const renderBlockContent = (layout: BlockLayout) => {
    try {
      const data = layout.data ? JSON.parse(layout.data) : undefined;
      
      switch (layout.type) {
        case 'pie-chart':
          return <PieChart data={data} />;
        case 'line-chart':
          return <LineChartComponent data={data} />;
        case 'bar-chart':
          return <BarChartComponent data={data} />;
        case 'text':
          return <TextBlock data={data} />;
        case 'data-table':
          return <DataTable data={data} />;
        default:
          return null;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return <div className="text-destructive">Invalid data format: {message}</div>;
    }
  }

  const renderPropertiesContent = () => {
    if (!selectedBlock) return null;

    const data = selectedBlock.data ? JSON.parse(selectedBlock.data) : null;

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={selectedBlock.title || ''}
            onChange={(e) => updateBlockProperties(selectedBlock.i, { title: e.target.value })}
          />
        </div>

        {selectedBlock.type === 'text' && (
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={data?.content || ''}
              onChange={(e) => updateBlockProperties(selectedBlock.i, { 
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
              onChange={(newData) => updateBlockProperties(selectedBlock.i, { 
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
              onChange={(newData) => updateBlockProperties(selectedBlock.i, { 
                data: JSON.stringify(newData) 
              })}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-muted/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Add Blocks</h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPanelVisible(!isPanelVisible)}
              title={isPanelVisible ? "Hide Properties Panel" : "Show Properties Panel"}
            >
              {isPanelVisible ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRight className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
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
        <div className="layout-container bg-muted rounded-lg p-0">
          <GridLayout
            className="layout"
            layout={layouts}
            cols={gridColumns}
            rowHeight={100}
            width={width}
            onLayoutChange={handleLayoutChange}
            compactType="vertical"
            preventCollision={false}
            resizeHandles={['se']}
            margin={[16, 16]}
            containerPadding={[16, 16]}
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

      {isPanelVisible && (
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
                {renderPropertiesContent()}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Select a block to edit its properties
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
