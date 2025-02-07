import { Node, Edge } from 'reactflow'
import { BlockLayout } from './blocks'

export interface StoredDashboard {
  id: string
  title: string
  lastModified: number
  type: 'flow' | 'grid'
}

export interface StoredFlowDashboard extends StoredDashboard {
  type: 'flow'
  nodes: Node[]
  edges: Edge[]
}

export interface StoredGridDashboard extends StoredDashboard {
  type: 'grid'
  layouts: { [key: string]: BlockLayout[] }
}

export type StoredDashboards = StoredFlowDashboard | StoredGridDashboard 