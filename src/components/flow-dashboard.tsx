import { useState } from 'react'

export function FlowDashboard() {
  const [nodes] = useState([])
  const [edges] = useState([])

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Flow Dashboard</h1>
        <p className="text-muted-foreground">Coming soon! This will be a flow-based dashboard builder.</p>
      </div>
    </div>
  )
} 