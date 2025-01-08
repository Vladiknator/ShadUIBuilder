# ShadUI Builder

A prototype layout builder that allows users to create dynamic dashboards with draggable and resizable components. Built with React, TypeScript, and Shadcn UI components.

Live demo Availible at: https://vladiknator.github.io/ShadUIBuilder/

## Features

- Drag-and-drop interface for arranging components
- Resizable blocks with minimum size constraints
- Multiple chart types:
  - Pie Charts with customizable colors
  - Line Charts
  - Bar Charts
- Text blocks with markdown support
- Properties panel for each component
- Real-time data editing
- Modern, clean UI using Shadcn components

## Technologies Used

- **React** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and development server
- **Shadcn UI** - Component library and styling
- **Tailwind CSS** - Utility-first CSS framework
- **React Grid Layout** - Drag-and-drop grid system
- **Recharts** - Chart library
- **Radix UI** - Primitive UI components
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ShadUIBuilder.git
cd ShadUIBuilder
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Add blocks using the sidebar buttons
2. Drag blocks by their headers to rearrange
3. Resize blocks using the bottom-right handle
4. Click the settings icon to edit block properties
5. Edit chart data using the properties panel
6. Customize colors for pie charts
7. Add and remove data points as needed

## Project Structure

- `/src/components/ui` - Shadcn UI components
- `/src/components/ui/charts.tsx` - Chart components
- `/src/App.tsx` - Main application logic
- `/src/lib` - Utility functions
