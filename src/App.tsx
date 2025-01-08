import { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import './App.css'
import { BlockLayout, BLOCK_TYPES, defaultTableData } from './types/blocks'
import { Sidebar } from './components/sidebar'
import { PropertiesPanel } from './components/properties-panel'
import { GridBlock } from './components/grid-block'

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define size constraints for each block type
// This ensures blocks maintain appropriate dimensions based on their content
export const BLOCK_CONSTRAINTS = {
  'data-table': {
    defaultW: 6,    // Default width in grid units
    defaultH: 5,    // Default height in grid units
    minW: 3,        // Minimum allowed width
    minH: 5,        // Minimum allowed height
    maxW: 12,       // Maximum allowed width
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
  // Grid and layout state
  const [width, setWidth] = useState(1200)                    // Width of the grid container
  const [layouts, setLayouts] = useState<{ [key: string]: BlockLayout[] }>({ lg: [] })   // Responsive layouts
  const [blockCount, setBlockCount] = useState(1)             // Counter for generating unique block IDs
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg')
  const [mounted, setMounted] = useState(false)
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(null)

  // Properties panel state
  const [selectedBlock, setSelectedBlock] = useState<BlockLayout | null>(null)  // Currently selected block
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256)        // Width of properties panel
  const [isResizing, setIsResizing] = useState(false)                          // Whether panel is being resized
  const [isPanelVisible, setIsPanelVisible] = useState(true)                   // Whether panel is visible

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update grid width when panel visibility or width changes
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.layout-container')
      if (container) {
        const sidebarWidth = 256;                // Width of the sidebar
        const containerPadding = 32;             // Total padding of the container
        // Calculate available width accounting for sidebar and properties panel
        const availableWidth = window.innerWidth - sidebarWidth - (isPanelVisible ? propertiesPanelWidth : 0);
        // Set width with minimum of 400px
        const containerWidth = Math.max(400, availableWidth - containerPadding - 16);
        setWidth(containerWidth);
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [isPanelVisible, propertiesPanelWidth])

  // Handle properties panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        // Calculate new panel width based on mouse position
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

  // Add a new block to the grid
  const addNewBlock = (type: string) => {
    const constraints = BLOCK_CONSTRAINTS[type as keyof typeof BLOCK_CONSTRAINTS];
    
    // Create new block with default data
    const newBlock: BlockLayout = {
      i: `block-${blockCount}`,
      x: 0,
      y: 0,
      w: constraints.defaultW,
      h: constraints.defaultH,
      minW: constraints.minW,
      minH: constraints.minH,
      maxW: constraints.maxW,
      type,
      title: `${BLOCK_TYPES.find(b => b.id === type)?.label || 'Chart'} ${blockCount + 1}`,
    };

    // Initialize default data based on block type
    switch (type) {
      case 'pie-chart':
        newBlock.data = JSON.stringify([
          { name: 'A', value: 400, color: '#0088FE' },
          { name: 'B', value: 300, color: '#00C49F' },
          { name: 'C', value: 200, color: '#FFBB28' },
        ]);
        break;
      case 'line-chart':
      case 'bar-chart':
        newBlock.data = JSON.stringify([
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 200 },
        ]);
        break;
      case 'text':
        newBlock.data = JSON.stringify({ content: 'Enter your text here...' });
        break;
      case 'data-table':
        newBlock.data = JSON.stringify(defaultTableData);
        break;
    }

    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: [...(prev[currentBreakpoint] || []), newBlock]
    }));
    setBlockCount(blockCount + 1);
  };

  // Update layout when blocks are moved or resized
  const handleLayoutChange = (currentLayout: BlockLayout[], allLayouts: { [key: string]: BlockLayout[] }) => {
    // Filter out any placeholder items (they have a special 'i' property that starts with '__dropping-elem')
    const filteredLayout = currentLayout.filter(item => !item.i.startsWith('__dropping-elem'));
    const currentBlocks = layouts[currentBreakpoint] || [];
    
    const updatedLayout = filteredLayout.map(item => ({
      ...currentBlocks.find(l => l.i === item.i),
      ...item,
    }));
    
    setLayouts({
      ...allLayouts,
      [currentBreakpoint]: updatedLayout as BlockLayout[]
    });
  };

  // Update block properties (title, data, etc.)
  const updateBlockProperties = (blockId: string, updates: Partial<BlockLayout>) => {
    setLayouts(prev => {
      const currentBlocks = prev[currentBreakpoint] || [];
      const updatedBlocks = currentBlocks.map(block => {
        if (block.i === blockId) {
          const updatedBlock = { ...block, ...updates };
          if (selectedBlock?.i === blockId) {
            setSelectedBlock(updatedBlock);
          }
          return updatedBlock;
        }
        return block;
      });
      
      return {
        ...prev,
        [currentBreakpoint]: updatedBlocks
      };
    });
  };

  // Delete a block from the grid
  const deleteBlock = (blockId: string) => {
    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: (prev[currentBreakpoint] || []).filter(l => l.i !== blockId)
    }));
    setSelectedBlock(null);
  };

  // Handle drag over to update dropping item dimensions
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drag start from sidebar
  const handleDragStart = (blockType: string) => {
    setDraggingBlockType(blockType);
  };

  // Get dropping item dimensions based on block type
  const getDroppingItem = (blockType: string | null) => {
    if (!blockType) return undefined;
    const constraints = BLOCK_CONSTRAINTS[blockType as keyof typeof BLOCK_CONSTRAINTS];
    return {
      i: "__dropping-elem__",
      w: constraints.defaultW,
      h: constraints.defaultH
    };
  };

  // Handle drop from outside
  const handleDrop = (_layout: BlockLayout[], layoutItem: BlockLayout) => {
    const type = draggingBlockType;
    setDraggingBlockType(null);
    if (!type) return;

    const constraints = BLOCK_CONSTRAINTS[type as keyof typeof BLOCK_CONSTRAINTS];
    
    // Create new block at drop position
    const newBlock: BlockLayout = {
      i: `block-${blockCount}`,
      x: layoutItem.x,
      y: layoutItem.y,
      w: constraints.defaultW,
      h: constraints.defaultH,
      minW: constraints.minW,
      minH: constraints.minH,
      maxW: constraints.maxW,
      type,
      title: `${BLOCK_TYPES.find(b => b.id === type)?.label || 'Chart'} ${blockCount + 1}`,
    };

    // Initialize default data based on block type
    switch (type) {
      case 'pie-chart':
        newBlock.data = JSON.stringify([
          { name: 'A', value: 400, color: '#0088FE' },
          { name: 'B', value: 300, color: '#00C49F' },
          { name: 'C', value: 200, color: '#FFBB28' },
        ]);
        break;
      case 'line-chart':
      case 'bar-chart':
        newBlock.data = JSON.stringify([
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 200 },
        ]);
        break;
      case 'text':
        newBlock.data = JSON.stringify({ content: 'Enter your text here...' });
        break;
      case 'data-table':
        newBlock.data = JSON.stringify(defaultTableData);
        break;
    }

    // Get the current blocks and their updated positions from the layout
    const currentBlocks = layouts[currentBreakpoint] || [];
    const updatedPositions = _layout.filter(item => !item.i.startsWith('__dropping-elem__'));
    
    // Create new blocks array with updated positions for existing blocks
    const updatedBlocks = currentBlocks.map(block => {
      const updatedPosition = updatedPositions.find(pos => pos.i === block.i);
      return updatedPosition ? { ...block, ...updatedPosition } : block;
    });

    // Add the new block
    updatedBlocks.push(newBlock);
    
    // Update the layout with all blocks in their correct positions
    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: updatedBlocks
    }));
    setBlockCount(blockCount + 1);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with block types and controls */}
      <Sidebar
        onAddBlock={addNewBlock}
        isPanelVisible={isPanelVisible}
        onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
        onDragStart={handleDragStart}
      />

      {/* Main grid area */}
      <div className="flex-1 overflow-auto p-4">
        <div 
          className="layout-container bg-muted rounded-lg p-0"
          onDragOver={handleDragOver}
        >
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            width={width}
            onLayoutChange={handleLayoutChange}
            onBreakpointChange={setCurrentBreakpoint}
            compactType="vertical"
            preventCollision={false}
            resizeHandles={['se']}
            margin={[16, 16]}
            containerPadding={[16, 16]}
            isDroppable={true}
            onDrop={handleDrop}
            droppingItem={getDroppingItem(draggingBlockType)}
            useCSSTransforms={mounted}
          >
            {(layouts[currentBreakpoint] || []).map((layout) => (
              <div key={layout.i}>
                <GridBlock
                  layout={layout}
                  onSelect={setSelectedBlock}
                  onDelete={deleteBlock}
                  selected={selectedBlock?.i === layout.i}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>

      {/* Properties panel */}
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
