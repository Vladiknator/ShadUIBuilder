import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { Button } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface DataTableProps {
  data?: Array<{
    date: string;
    temperature: number;
    pressure: number;
  }>;
}

const defaultData = [
  { date: '2024-01-01', temperature: 20, pressure: 1013 },
  { date: '2024-01-02', temperature: 22, pressure: 1012 },
  { date: '2024-01-03', temperature: 19, pressure: 1014 },
  { date: '2024-01-04', temperature: 21, pressure: 1015 },
  { date: '2024-01-05', temperature: 23, pressure: 1011 },
  { date: '2024-01-06', temperature: 20, pressure: 1013 },
  { date: '2024-01-07', temperature: 18, pressure: 1016 },
  { date: '2024-01-08', temperature: 19, pressure: 1014 },
  { date: '2024-01-09', temperature: 21, pressure: 1012 },
  { date: '2024-01-10', temperature: 22, pressure: 1013 },
];

export function DataTable({ data = defaultData }: DataTableProps) {
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(0)

  const startIndex = currentPage * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const currentData = data.slice(startIndex, endIndex)
  const totalPages = Math.ceil(data.length / pageSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(0)
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Temperature (°C)</TableHead>
              <TableHead>Pressure (hPa)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.temperature}</TableCell>
                <TableCell>{row.pressure}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {endIndex} of {data.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}