import { useState, useEffect, useRef, useCallback } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Connection,
  useNodesState,
  useEdgesState,
  ReactFlowInstance,
  addEdge,
  ConnectionMode,
  DefaultEdgeOptions,
  MarkerType,
  SelectionMode
} from 'reactflow'
import 'reactflow/dist/style.css'
import '../App.css'
import { Sidebar } from './sidebar'
import { FlowPropertiesPanel } from './properties-panel'
import { FlowContent } from './sidebar-flow-content'
import { HtmlNode } from './nodes/html-node'
import { EquipmentNode } from './nodes/equipment-node'

// Define custom node types
const nodeTypes = {
  button: HtmlNode,
  input: HtmlNode,
  label: HtmlNode,
  oilJack: EquipmentNode,
  pump: EquipmentNode,
  tank: EquipmentNode
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  animated: true,
  type: 'smoothstep',
  style: { strokeWidth: 4 },
  markerEnd: {
    type: MarkerType.Arrow,
    width: 10,
    height: 10,
    color: '#999'
  }
}

export function FlowDashboard() {
  // Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [blockCount, setBlockCount] = useState(1)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)

  // Properties panel state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [propertiesPanelWidth, setPropertiesPanelWidth] = useState(256)
  const [isResizing, setIsResizing] = useState(false)
  const [isPanelVisible, setIsPanelVisible] = useState(true)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Handle properties panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX
        setPropertiesPanelWidth(Math.max(200, Math.min(600, newWidth)))
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Handle node selection
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }

  // Handle edge updates
  const onConnect = useCallback((params: Connection) => {
    setEdges(edges => addEdge(params, edges))
  }, [setEdges])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })

      const newNode: Node = {
        id: `node-${blockCount}`,
        type,
        position,
        data: { 
          label: `${type} ${blockCount}`,
          type
        }
      }

      setNodes(nodes => [...nodes, newNode])
      setBlockCount(prev => prev + 1)
    },
    [reactFlowInstance, blockCount, setNodes]
  )

  // Add a new node to the flow
  const addNewNode = (type: string) => {
    const isEquipment = type.startsWith('oil') || type === 'pump' || type === 'tank'
    const newNode: Node = {
      id: `node-${blockCount}`,
      type: type,
      position: { x: 100, y: 100 * blockCount },
      data: { 
        label: `${type} ${blockCount}`,
        type: type
      },
      style: isEquipment ? { width: 50, height: 50 } : undefined
    }

    setNodes(nodes => [...nodes, newNode])
    setBlockCount(blockCount + 1)
  }

  // Handle node updates from properties panel
  const handleUpdateNode = (nodeId: string, updates: Partial<Node['data']>) => {
    setNodes(nodes => nodes.map(node => 
      node.id === nodeId 
        ? { 
            ...node,
            data: updates
          }
        : node
    ))
    // Update selected node to reflect changes immediately
    setSelectedNode(prev => 
      prev?.id === nodeId 
        ? { ...prev, data: updates }
        : prev
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar title="Flow Dashboard" isPanelVisible={isPanelVisible} onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}>
        <FlowContent onAddNode={addNewNode} />
      </Sidebar>

      <div ref={reactFlowWrapper} className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          connectionMode={ConnectionMode.Loose}
          selectionMode={SelectionMode.Partial}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {isPanelVisible && selectedNode && (
        <>
          <div
            className="w-1 h-full cursor-col-resize bg-border hover:bg-primary/50"
            onMouseDown={() => setIsResizing(true)}
          />
          <FlowPropertiesPanel
            width={propertiesPanelWidth}
            selectedNode={selectedNode}
            onResize={() => setIsResizing(true)}
            onUpdateNode={handleUpdateNode}
          />
        </>
      )}
    </div>
  )
} 