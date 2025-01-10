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
        return <button className="px-4 py-2 bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground rounded-md transition-colors">{displayText}</button>
      case 'input':
        return <div className="flex justify-center">
          <input className="w-32 px-2 py-1 bg-transparent text-left" placeholder={displayText} />
        </div>
      case 'label':
        return <label className="text-sm font-medium">{displayText}</label>
      default:
        return <div>{displayText}</div>
    }
  })()

  return (
    <>
      {data.type !== 'input' && (
        <NodeResizer 
          isVisible={selected}
          minWidth={50}
          minHeight={30}
        />
      )}
      <div className={`relative ${data.type === 'input' ? 'p-0' : 'p-2'}`}>
        {content}
      </div>
    </>
  )
} 