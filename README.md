# ShadUI Builder

A React-based dashboard builder using ShadcnUI components. Build beautiful dashboards with a drag-and-drop interface.

Live demo Availible at: https://vladiknator.github.io/ShadUIBuilder/

## Features

### Grid Dashboard

- Drag and drop blocks from the sidebar
- Resize and reposition blocks in a responsive grid
- Multiple block types:
  - Charts (Line, Bar, Pie)
  - Text blocks
  - Data tables
- Properties panel for customizing blocks
- Responsive layout with breakpoints

### Flow Dashboard

- Create flow diagrams with connected nodes
- Multiple node types:
  - HTML Elements (Button, Input, Label)
  - Equipment (Oil Jack, Pump, Tank)
- Node features:
  - Drag and drop from sidebar
  - Resize equipment nodes while maintaining aspect ratio
  - Connect nodes with animated directional edges
  - Edit node properties in the properties panel
- Connection features:
  - Loose connection mode for flexible edge routing
  - Animated edges with directional arrows
  - Connect from any node to any other node

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

## Built With

- React
- TypeScript
- Vite
- ShadcnUI
- React Grid Layout
- React Flow
- Recharts
