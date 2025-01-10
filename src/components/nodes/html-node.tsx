import { NodeProps, NodeResizer } from 'reactflow'

interface HtmlNodeData {
  label: string
  type: string
  title?: string
}

export function HtmlNode({ data, selected }: NodeProps<HtmlNodeData>) {
  const displayText = data.title || data.label

  const content = (() => {
    switch (data.type) {
      case 'button':
        return <button className="w-full h-full px-4 py-2 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground rounded-md transition-colors break-words">{displayText}</button>
      case 'input':
        return <div className="w-full flex justify-center">
          <input className="w-full px-2 py-1 bg-transparent text-left" placeholder={displayText} />
        </div>
      case 'label':
        return <div className="w-full h-full flex items-center">
          <label className="text-sm font-medium break-words">{displayText}</label>
        </div>
      default:
        return <div>{displayText}</div>
    }
  })()

  return (
    <>
      <NodeResizer 
        isVisible={selected}
        minWidth={data.type === 'input' ? 100 : 50}
        minHeight={data.type === 'input' ? 48 : 30}
        maxHeight={data.type === 'input' ? 48 : undefined}
        handleStyle={data.type === 'input' ? { height: 0 } : undefined}
        lineStyle={data.type === 'input' ? { height: 0 } : undefined}
      />
      <div className={`relative ${data.type === 'input' ? 'p-0 h-[auto]' : 'p-2 h-full'}`}>
        {content}
      </div>
    </>
  )
} 