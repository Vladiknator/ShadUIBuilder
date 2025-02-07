import { StoredDashboard, StoredDashboards } from '../types/storage'
import { BlockLayout } from '../types/blocks'
import { Node, Edge } from 'reactflow'

const STORAGE_KEY = 'shadui-builder-dashboards'

export function getAllDashboards(): StoredDashboard[] {
  const storedData = localStorage.getItem(STORAGE_KEY)
  if (!storedData) return []
  
  try {
    return JSON.parse(storedData)
  } catch (error) {
    console.error('Error parsing stored dashboards:', error)
    return []
  }
}

export function getDashboard(id: string): StoredDashboards | null {
  const dashboards = getAllDashboards() as StoredDashboards[]
  const dashboard = dashboards.find(d => d.id === id)
  return dashboard || null
}

export function saveDashboard(dashboard: StoredDashboards) {
  const dashboards = getAllDashboards()
  const existingIndex = dashboards.findIndex(d => d.id === dashboard.id)
  
  if (existingIndex >= 0) {
    dashboards[existingIndex] = dashboard
  } else {
    dashboards.push(dashboard)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards))
}

export function deleteDashboard(id: string) {
  const dashboards = getAllDashboards()
  const filteredDashboards = dashboards.filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDashboards))
}

interface GridData {
  title: string
  layouts: { [key: string]: BlockLayout[] }
}

export function getMaxBlockId(layouts: { [key: string]: BlockLayout[] }): number {
  const allBlocks = Object.values(layouts).flat()
  return Math.max(...allBlocks.map(block => {
    const idNum = parseInt(block.i.replace('block-', ''))
    return isNaN(idNum) ? 0 : idNum
  }))
}

export function exportGridToFile(title: string, layouts: { [key: string]: BlockLayout[] }) {
  const gridData: GridData = { title, layouts }
  const jsonString = JSON.stringify(gridData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  const filename = title.trim() || 'grid-export'
  link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface GridDataResult {
  title: string
  layouts: { [key: string]: BlockLayout[] }
  maxBlockId: number
}

export function parseGridData(data: string | GridData): GridDataResult | null {
  try {
    const gridData: GridData = typeof data === 'string' ? JSON.parse(data) : data
    return {
      title: gridData.title,
      layouts: gridData.layouts,
      maxBlockId: getMaxBlockId(gridData.layouts)
    }
  } catch (error) {
    console.error('Error parsing grid data:', error)
    return null
  }
}

interface FlowData {
  title: string
  nodes: Node[]
  edges: Edge[]
}

export function getMaxNodeId(nodes: Node[]): number {
  return Math.max(...nodes.map(node => {
    const idNum = parseInt(node.id.replace('node-', ''))
    return isNaN(idNum) ? 0 : idNum
  }))
}

export function exportFlowToFile(title: string, nodes: Node[], edges: Edge[]) {
  const flowData: FlowData = { title, nodes, edges }
  const jsonString = JSON.stringify(flowData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  const filename = title.trim() || 'flow-export'
  link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export interface FlowDataResult {
  title: string
  nodes: Node[]
  edges: Edge[]
  maxNodeId: number
}

export function parseFlowData(data: string | FlowData): FlowDataResult | null {
  try {
    const flowData: FlowData = typeof data === 'string' ? JSON.parse(data) : data
    return {
      title: flowData.title,
      nodes: flowData.nodes,
      edges: flowData.edges,
      maxNodeId: getMaxNodeId(flowData.nodes)
    }
  } catch (error) {
    console.error('Error parsing flow data:', error)
    return null
  }
} 