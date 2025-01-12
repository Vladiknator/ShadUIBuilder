import { Button } from './ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import oilJackSvg from '../assets/oiljack_2.svg'
import pumpSvg from '../assets/pump2.svg'
import tankSvg from '../assets/tank_sublike.svg'
import { BarChart, LineChart, PieChart } from 'lucide-react'

interface FlowContentProps {
  onAddNode: (type: string) => void
}

interface Category {
  name: string
  items: {
    type: string
    label: string
    icon?: string | React.ReactNode
  }[]
}

const categories: Category[] = [
  {
    name: 'HTML',
    items: [
      { type: 'button', label: 'Button' },
      { type: 'input', label: 'Input' },
      { type: 'label', label: 'Label' }
    ]
  },
  {
    name: 'Equipment',
    items: [
      { type: 'oilJack', label: 'Oil Jack', icon: oilJackSvg },
      { type: 'pump', label: 'Pump', icon: pumpSvg },
      { type: 'tank', label: 'Tank', icon: tankSvg }
    ]
  },
  {
    name: 'Charts',
    items: [
      { type: 'pieChart', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
      { type: 'lineChart', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
      { type: 'barChart', label: 'Bar Chart', icon: <BarChart className="h-4 w-4" /> }
    ]
  }
]

export function FlowContent({ onAddNode }: FlowContentProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['HTML', 'Equipment', 'Charts'])

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="space-y-4">
      {categories.map(category => (
        <div key={category.name} className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between px-2"
            onClick={() => toggleCategory(category.name)}
          >
            <span>{category.name}</span>
            {expandedCategories.includes(category.name) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          {expandedCategories.includes(category.name) && (
            <div className="pl-4 space-y-1">
              {category.items.map(item => (
                <Button
                  key={item.type}
                  variant="ghost"
                  className="w-full justify-start gap-2 text-sm cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type)}
                  onClick={() => onAddNode(item.type)}
                >
                  {typeof item.icon === 'string' ? (
                    <img src={item.icon} className="h-4 w-4" alt={item.label} />
                  ) : item.icon ? (
                    item.icon
                  ) : (
                    <div className="h-4 w-4 rounded border border-border flex items-center justify-center text-xs">
                      {item.label[0]}
                    </div>
                  )}
                  {item.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 