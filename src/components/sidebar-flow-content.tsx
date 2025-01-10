import { Button } from './ui/button'
import { Plus, ArrowRight } from 'lucide-react'

interface FlowContentProps {
  onAddNode: () => void
  onAddEdge: () => void
}

export function FlowContent({ onAddNode, onAddEdge }: FlowContentProps) {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={onAddNode}
      >
        <Plus className="h-4 w-4" />
        Add Node
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start gap-2"
        onClick={onAddEdge}
      >
        <ArrowRight className="h-4 w-4" />
        Add Edge
      </Button>
    </div>
  );
} 