import { Handle, Position, NodeResizer, NodeProps } from 'reactflow'
import oilJackSvg from '../../assets/oiljack_2.svg'
import pumpSvg from '../../assets/pump2.svg'
import tankSvg from '../../assets/tank_sublike.svg'

interface EquipmentNodeData {
  label: string
  type: string
}

const equipmentIcons: { [key: string]: string } = {
  oilJack: oilJackSvg,
  pump: pumpSvg,
  tank: tankSvg
}

export function EquipmentNode({ data, selected }: NodeProps<EquipmentNodeData>) {
  const icon = equipmentIcons[data.type]

  return (
    <div className="relative">
      <NodeResizer 
        isVisible={selected} 
        minWidth={30} 
        minHeight={30}
        keepAspectRatio
      />
      <Handle 
        type="source" 
        position={Position.Top} 
        id="t"
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="l"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="r"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="b"
      />
      <img src={icon} alt={data.label} className="w-full h-full object-contain" />
    </div>
  )
} 