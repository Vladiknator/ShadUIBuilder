import { NodeProps, NodeResizer, Handle, Position } from 'reactflow'
import { PieChart, LineChartComponent, BarChartComponent } from '../ui/charts'

interface ChartNodeData {
  label: string
  type: string
  data?: {
    name: string
    value: number
    color?: string
  }[]
}

const handleStyle = {
  width: 15,
  height: 15,
  background: '#fff',
  border: '2px solid #778899',
  top: '-5px',
  left: '50%',
  transform: 'translate(-50%, 0)'
}

export function ChartNode({ data, selected }: NodeProps<ChartNodeData>) {
  const content = (() => {
    switch (data.type) {
      case 'pieChart':
        return (
          <div className="w-full h-full">
            <PieChart data={data.data} />
          </div>
        )
      case 'lineChart':
        return (
          <div className="w-full h-full">
            <LineChartComponent data={data.data} />
          </div>
        )
      case 'barChart':
        return (
          <div className="w-full h-full">
            <BarChartComponent data={data.data} />
          </div>
        )
      default:
        return <div>Invalid chart type</div>
    }
  })()

  return (
    <>
      <Handle
        type="source"
        position={Position.Top}
        id="t"
        style={handleStyle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={{
          ...handleStyle,
          top: 'auto',
          bottom: '-5px'
        }}
      />
      <NodeResizer 
        isVisible={selected}
        minWidth={200}
        minHeight={200}
        handleStyle={{width: '10px', height: '10px', borderWidth: '1px' }} 
        lineStyle={{borderWidth: '2px' }}
      />
      <div className="w-full h-full p-2 min-w-[200px] min-h-[200px]">
        {content}
      </div>
    </>
  )
} 