import { useState, useEffect } from 'react'
import GridLayout, { Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './App.css'
import { BlockLayout, BLOCK_TYPES, defaultTableData } from './types/blocks'
import { Sidebar } from './components/sidebar'
import { PropertiesPanel } from './components/properties-panel'
import { GridBlock } from './components/grid-block'

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
  const [gridColumns, setGridColumns] = useState(getGridColumns())

  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.layout-container')
      if (container) {
        const sidebarWidth = 256;
        const containerPadding = 32;
        const availableWidth = window.innerWidth - sidebarWidth - (isPanelVisible ? propertiesPanelWidth : 0);
        const containerWidth = Math.max(400, availableWidth - containerPadding - 16);
        setWidth(containerWidth);
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [isPanelVisible, propertiesPanelWidth])

  function getGridColumns() {
    const sidebarWidth = 256;
    const containerPadding = 32;
    const screenWidth = window.innerWidth - sidebarWidth;
    return Math.max(6, Math.floor((screenWidth - containerPadding - 16) / 150));
  }

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

  const addNewBlock = (type: string) => {
    const cols = Math.max(12, Math.floor(width / 150));
    const constraints = BLOCK_CONSTRAINTS[type as keyof typeof BLOCK_CONSTRAINTS];
    
    const grid: boolean[][] = [];
    for (let y = 0; y < 100; y++) {
      grid[y] = new Array(cols).fill(false);
    }

    layouts.forEach(layout => {
      for (let y = layout.y; y < layout.y + layout.h; y++) {
        for (let x = layout.x; x < layout.x + layout.w; x++) {
          if (grid[y]) grid[y][x] = true;
        }
      }
    });

    let position = { x: 0, y: 0 };
    outerLoop: for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= cols - constraints.defaultW; x++) {
        let spaceAvailable = true;
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

    let defaultData;
    switch (type) {
      case 'pie-chart':
        defaultData = [
          { name: 'A', value: 400, color: '#0088FE' },
          { name: 'B', value: 300, color: '#00C49F' },
          { name: 'C', value: 200, color: '#FFBB28' },
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
      title: `${BLOCK_TYPES.find(b => b.id === type)?.label || 'Chart'} ${blockCount + 1}`,
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

  return (
    <div className="flex h-screen">
      <Sidebar
        onAddBlock={addNewBlock}
        isPanelVisible={isPanelVisible}
        onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
      />

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
                <GridBlock
                  layout={layout}
                  onSelect={setSelectedBlock}
                  onDelete={deleteBlock}
                  selected={selectedBlock?.i === layout.i}
                />
              </div>
            ))}
          </GridLayout>
        </div>
      </div>

      {isPanelVisible && (
        <PropertiesPanel
          selectedBlock={selectedBlock}
          width={propertiesPanelWidth}
          onResize={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          onUpdateBlock={updateBlockProperties}
        />
      )}
    </div>
  )
}

export default App
