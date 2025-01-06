import { Button } from './ui/button'
import { Moon, Sun, PanelRightClose, PanelRight } from 'lucide-react'
import { BLOCK_TYPES } from '../types/blocks'
import { useTheme } from './theme-provider'

interface SidebarProps {
  onAddBlock: (type: string) => void
  isPanelVisible: boolean
  onTogglePanel: () => void
}

export function Sidebar({ onAddBlock, isPanelVisible, onTogglePanel }: SidebarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="w-64 border-r bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Add Blocks</h2>
        <div className="flex gap-1">
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
          >
            <blockType.icon className="h-4 w-4" />
            {blockType.label}
          </Button>
        ))}
      </div>
    </div>
  )
} 