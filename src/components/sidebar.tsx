import { Button } from './ui/button'
import { Moon, Sun, PanelRightClose, PanelRight, Home } from 'lucide-react'
import { BLOCK_TYPES } from '../types/blocks'
import { BLOCK_CONSTRAINTS } from '../types/constraints'
import { useTheme } from './theme-provider'
import { useNavigate } from 'react-router-dom'

interface SidebarProps {
  onAddBlock: (type: string) => void
  isPanelVisible: boolean
  onTogglePanel: () => void
  onDragStart: (type: string) => void
}

export function Sidebar({ onAddBlock, isPanelVisible, onTogglePanel, onDragStart }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, blockType: string) => {
    const constraints = BLOCK_CONSTRAINTS[blockType as keyof typeof BLOCK_CONSTRAINTS];
    
    // Store block type for drop handling
    e.dataTransfer.setData('text/plain', blockType);
    
    // Calculate grid cell size including margin
    const gridContainer = document.querySelector('.layout-container');
    const columns = 12;
    const margin = 16;
    const containerPadding = 16;
    
    // Get actual grid width from DOM
    const totalGridWidth = gridContainer ? 
      gridContainer.clientWidth - (containerPadding * 2) : // Subtract container padding
      1200; // Fallback width
    
    const cellWidth = (totalGridWidth - (margin * (columns - 1))) / columns; // Account for margins between cells
    const cellHeight = 100 + margin; // 100px cell + margin
    
    // Create a drag preview element
    const preview = document.createElement('div');
    preview.className = 'drag-preview';
    preview.style.width = `${(constraints.defaultW * cellWidth) + (margin * (constraints.defaultW - 1))}px`;
    preview.style.height = `${(constraints.defaultH * cellHeight) - margin}px`;
    document.body.appendChild(preview);

    // Hide the default drag image
    e.dataTransfer.setDragImage(new Image(), 0, 0);

    // Update preview position during drag
    const handleDrag = (e: DragEvent) => {
      if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid positions
      preview.style.left = `${e.clientX}px`;
      preview.style.top = `${e.clientY}px`;
      preview.style.display = 'block';
    };

    // Clean up on drag end
    const cleanup = () => {
      preview.remove();
      document.removeEventListener('drag', handleDrag);
      e.currentTarget.removeEventListener('dragend', cleanup);
    };

    document.addEventListener('drag', handleDrag);
    e.currentTarget.addEventListener('dragend', cleanup);

    // Notify parent of drag start
    onDragStart(blockType);
  };

  return (
    <div className="w-64 border-r bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Add Blocks</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            title="Return to Home"
          >
            <Home className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePanel}
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
            onClick={() => onAddBlock(blockType.id)}
            draggable
            onDragStart={(e) => handleDragStart(e, blockType.id)}
          >
            <blockType.icon className="h-4 w-4" />
            {blockType.label}
          </Button>
        ))}
      </div>
    </div>
  )
} 