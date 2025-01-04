import { Button } from "./button"
import { Input } from "./input"
import { Plus, Trash2 } from "lucide-react"

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface ChartDataFormProps {
  data: ChartDataItem[];
  onChange: (data: ChartDataItem[]) => void;
  showColorPicker?: boolean;
}

const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export function ChartDataForm({ data, onChange, showColorPicker = false }: ChartDataFormProps) {
  const addNewPair = () => {
    const newIndex = data.length;
    onChange([...data, { 
      name: '', 
      value: 0, 
      color: defaultColors[newIndex % defaultColors.length]
    }])
  }

  const updatePair = (index: number, field: keyof ChartDataItem, value: string | number) => {
    const newData = [...data]
    newData[index] = {
      ...newData[index],
      [field]: field === 'value' ? Number(value) || 0 : value
    }
    onChange(newData)
  }

  const removePair = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="grid gap-2 flex-1">
            <Input
              placeholder="Label"
              value={item.name}
              onChange={(e) => updatePair(index, 'name', e.target.value)}
            />
          </div>
          <div className="grid gap-2 flex-1">
            <Input
              type="number"
              placeholder="Value"
              value={item.value}
              onChange={(e) => updatePair(index, 'value', e.target.value)}
            />
          </div>
          {showColorPicker && (
            <div className="grid gap-2 w-20">
              <Input
                type="color"
                value={item.color || '#000000'}
                onChange={(e) => updatePair(index, 'color', e.target.value)}
                className="h-10 p-1 cursor-pointer"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => removePair(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={addNewPair}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Data Point
      </Button>
    </div>
  )
} 