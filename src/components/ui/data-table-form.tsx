import { Button } from "./button"
import { Input } from "./input"
import { Plus, Trash2 } from "lucide-react"

interface DataTableEntry {
  date: string;
  temperature: number;
  pressure: number;
}

interface DataTableFormProps {
  data: DataTableEntry[];
  onChange: (data: DataTableEntry[]) => void;
}

export function DataTableForm({ data, onChange }: DataTableFormProps) {
  const addNewEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    onChange([...data, { 
      date: today,
      temperature: 20,
      pressure: 1013
    }])
  }

  const updateEntry = (index: number, field: keyof DataTableEntry, value: string | number) => {
    const newData = [...data]
    newData[index] = {
      ...newData[index],
      [field]: field === 'date' ? value : Number(value) || 0
    }
    onChange(newData)
  }

  const removeEntry = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {data.map((entry, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="grid gap-2 flex-1">
            <Input
              type="date"
              value={entry.date}
              onChange={(e) => updateEntry(index, 'date', e.target.value)}
            />
          </div>
          <div className="grid gap-2 flex-1">
            <Input
              type="number"
              placeholder="Temperature"
              value={entry.temperature}
              onChange={(e) => updateEntry(index, 'temperature', e.target.value)}
            />
          </div>
          <div className="grid gap-2 flex-1">
            <Input
              type="number"
              placeholder="Pressure"
              value={entry.pressure}
              onChange={(e) => updateEntry(index, 'pressure', e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => removeEntry(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={addNewEntry}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Entry
      </Button>
    </div>
  )
} 