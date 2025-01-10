import { NodeProps } from 'reactflow'

interface HtmlNodeData {
  label: string
  type: string
  title?: string
}

export function HtmlNode({ data }: NodeProps<HtmlNodeData>) {
  const displayText = data.title || data.label

  switch (data.type) {
    case 'button':
      return <button className="px-4 py-2 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground rounded-md transition-colors">{displayText}</button>
    case 'input':
      return <input className="w-32 px-2 py-1 bg-transparent" placeholder={displayText} />
    case 'label':
      return <label className="text-sm font-medium">{displayText}</label>
    default:
      return <div>{displayText}</div>
  }
} 