import { Button } from './ui/button'
import { Moon, Sun, PanelRightClose, PanelRight, Home } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useNavigate } from 'react-router-dom'
import { ReactNode } from 'react'

interface SidebarProps {
  title: string
  children: ReactNode
  isPanelVisible: boolean
  onTogglePanel: () => void
}

export function Sidebar({ title, children, isPanelVisible, onTogglePanel }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="w-64 border-r bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">{title}</h2>
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
      {children}
    </div>
  )
} 