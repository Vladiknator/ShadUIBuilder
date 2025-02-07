import { useState, useEffect, useCallback } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import '../App.css'
import { BlockLayout, BLOCK_TYPES, defaultTableData } from '../types/blocks'
import { BLOCK_CONSTRAINTS } from '../types/constraints'
import { Sidebar } from './sidebar'
import { GridPropertiesPanel } from './grid-properties-panel'
import { GridBlock } from './grid-block'
import { BlockTypesContent } from './sidebar-block-types'
import { v4 as uuidv4 } from 'uuid'
import { LoadDashboardDialog } from './load-dashboard-dialog'
import { saveDashboard, getDashboard, exportGridToFile, parseGridData } from '../utils/storage'
import { StoredGridDashboard } from '../types/storage'

const ResponsiveGridLayout = WidthProvider(Responsive);

export function GridDashboard() {
  // Grid and layout state
  const [width, setWidth] = useState(1200)                    // Width of the grid container
  const [layouts, setLayouts] = useState<{ [key: string]: BlockLayout[] }>({ lg: [] })   // Responsive layouts
  const [blockCount, setBlockCount] = useState(1)             // Counter for generating unique block IDs
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg')
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(null)

  // Properties panel state
  const [selectedBlock, setSelectedBlock] = useState<BlockLayout | null>(null)  // Currently selected block
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256)        // Width of properties panel
  const [isResizing, setIsResizing] = useState(false)                          // Whether panel is being resized
  const [isPanelVisible, setIsPanelVisible] = useState(true)                   // Whether panel is visible

  // Add dashboard title state with existing state declarations
  const [dashboardTitle, setDashboardTitle] = useState('My Grid Dashboard')
  const [dashboardId, setDashboardId] = useState<string>(uuidv4())
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)

  // Update grid width when panel visibility or width changes
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.layout-container')
      if (container) {
        const sidebarWidth = 256;                // Width of the sidebar
        const containerPadding = 32;             // Total padding of the container
        // Calculate available width accounting for sidebar and properties panel
        const availableWidth = window.innerWidth - sidebarWidth - (isPanelVisible ? propertiesPanelWidth : 0);
        // Set width with minimum of 400px and remove the extra padding to prevent horizontal scroll
        const containerWidth = Math.max(400, availableWidth - containerPadding);
        
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
    const currentLayout = layouts[currentBreakpoint] || [];
    
    // Find first available position
    const occupiedSpaces = new Set<string>();
    currentLayout.forEach(block => {
      for (let x = block.x; x < block.x + block.w; x++) {
        for (let y = block.y; y < block.y + block.h; y++) {
          occupiedSpaces.add(`${x},${y}`);
        }
      }
    });

    // Find first position that can fit the new block
    let position = { x: 0, y: 0 };
    const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }[currentBreakpoint] || 12;

    // Search row by row until we find a space
    searchLoop:
    for (let y = 0; y < 1000; y++) { // Limit search to prevent infinite loop
      for (let x = 0; x <= cols - constraints.defaultW; x++) {
        // Check if this position can fit the block
        let canFit = true;
        for (let dx = 0; dx < constraints.defaultW; dx++) {
          for (let dy = 0; dy < constraints.defaultH; dy++) {
            if (occupiedSpaces.has(`${x + dx},${y + dy}`)) {
              canFit = false;
              break;
            }
          }
          if (!canFit) break;
        }
        if (canFit) {
          position = { x, y };
          break searchLoop;
        }
      }
    }

    // Create new block with default data
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
      [currentBreakpoint]: [...currentLayout, newBlock]
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

    setLayouts(prev => ({
      ...prev,
      [currentBreakpoint]: [...(prev[currentBreakpoint] || []), newBlock]
    }));
    setBlockCount(blockCount + 1);
  };

  // Update export function to use the new utility
  const exportGrid = useCallback(() => {
    exportGridToFile(dashboardTitle, layouts)
  }, [layouts, dashboardTitle])

  // Update import function to use the new utility
  const importGrid = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const file = event.target.files?.[0]
    
    if (!file) return

    fileReader.onload = (e) => {
      const content = e.target?.result as string
      const result = parseGridData(content)
      
      if (result) {
        setDashboardId(uuidv4())
        setLayouts(result.layouts)
        setDashboardTitle(result.title)
        setBlockCount(result.maxBlockId + 1)
      } else {
        alert('Error importing grid. Please check the file format.')
      }
    }

    fileReader.readAsText(file)
  }, [])

  // Update save function to use the new utility
  const saveToLocalStorage = useCallback(() => {
    const gridData: StoredGridDashboard = {
      id: dashboardId,
      title: dashboardTitle,
      type: 'grid',
      lastModified: Date.now(),
      layouts
    }
    
    saveDashboard(gridData)
    alert('Dashboard saved successfully!')
  }, [dashboardId, dashboardTitle, layouts])

  // Update load function to use the new utility
  const handleLoad = useCallback((id: string) => {
    const dashboard = getDashboard(id)
    if (dashboard && dashboard.type === 'grid') {
      const result = parseGridData(dashboard)
      if (result) {
        setDashboardId(dashboard.id)
        setDashboardTitle(result.title)
        setLayouts(result.layouts)
        setBlockCount(result.maxBlockId + 1)
      }
      setIsLoadDialogOpen(false)
    }
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        title="Add Blocks"
        isPanelVisible={isPanelVisible}
        onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
      >
        <div className="flex flex-col gap-2 p-2">
          <div className="px-2">
            <input
              type="text"
              value={dashboardTitle}
              onChange={(e) => setDashboardTitle(e.target.value)}
              placeholder="Dashboard Title"
              className="w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                       bg-transparent
                       text-gray-700 dark:text-gray-300
                       focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500"
            />
          </div>
          <div className="flex gap-1 px-2 w-full">
            <button
              onClick={exportGrid}
              className="flex-1 text-center text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-700 dark:text-gray-300
                       transition-colors"
            >
              Export
            </button>
            <label className="flex-1 text-center text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                            hover:bg-gray-100 dark:hover:bg-gray-700 
                            text-gray-700 dark:text-gray-300
                            transition-colors cursor-pointer"
            >
              Import
              <input
                type="file"
                accept=".json"
                onChange={importGrid}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex gap-1 px-2 w-full">
            <button
              onClick={saveToLocalStorage}
              className="flex-1 text-center text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-700 dark:text-gray-300
                       transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsLoadDialogOpen(true)}
              className="flex-1 text-center text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded 
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-700 dark:text-gray-300
                       transition-colors"
            >
              Load
            </button>
          </div>
          <BlockTypesContent 
            onDragStart={handleDragStart}
            onAddBlock={addNewBlock}
          />
        </div>
      </Sidebar>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="layout-container flex-1 p-4 overflow-y-auto overflow-x-hidden">
          <div className="bg-muted/30 rounded-lg min-h-full" onDragOver={handleDragOver}>
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
              rowHeight={100}
              width={width}
              onLayoutChange={handleLayoutChange}
              onBreakpointChange={setCurrentBreakpoint}
              onDrop={handleDrop}
              isDroppable={true}
              droppingItem={getDroppingItem(draggingBlockType)}
              compactType="vertical"
              preventCollision={false}
              resizeHandles={['se']}
              margin={[16, 16]}
              containerPadding={[16, 16]}
              autoSize={true}
            >
              {layouts[currentBreakpoint]?.map((block) => (
                <div key={block.i} data-grid={{
                  ...block,
                  minW: BLOCK_CONSTRAINTS[block.type as keyof typeof BLOCK_CONSTRAINTS].minW,
                  minH: BLOCK_CONSTRAINTS[block.type as keyof typeof BLOCK_CONSTRAINTS].minH,
                  maxW: BLOCK_CONSTRAINTS[block.type as keyof typeof BLOCK_CONSTRAINTS].maxW,
                }}>
                  <GridBlock
                    layout={block}
                    onSelect={() => setSelectedBlock(block)}
                    onDelete={() => deleteBlock(block.i)}
                    selected={selectedBlock?.i === block.i}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        </div>
      </div>

      {isPanelVisible && (
        <GridPropertiesPanel
          selectedBlock={selectedBlock}
          width={propertiesPanelWidth}
          onResize={(e: React.MouseEvent) => {
            e.preventDefault();
            setIsResizing(true);
          }}
          onUpdateBlock={updateBlockProperties}
        />
      )}

      <LoadDashboardDialog
        isOpen={isLoadDialogOpen}
        onClose={() => setIsLoadDialogOpen(false)}
        onLoad={handleLoad}
        currentType="grid"
      />
    </div>
  );
} 