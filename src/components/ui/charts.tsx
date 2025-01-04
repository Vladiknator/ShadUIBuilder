import { PieChart as RePieChart, Pie, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface ChartProps {
  data?: ChartDataItem[];
}

const defaultData: ChartDataItem[] = [
  { name: 'A', value: 400, color: '#0088FE' },
  { name: 'B', value: 300, color: '#00C49F' },
  { name: 'C', value: 300, color: '#FFBB28' },
  { name: 'D', value: 200, color: '#FF8042' },
];

const defaultLineData: ChartDataItem[] = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 400 },
  { name: 'May', value: 500 },
];

const defaultColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

function getColor(index: number, color?: string): string {
  return color || defaultColors[index % defaultColors.length];
}

export function PieChart({ data = defaultData }: ChartProps) {
  return (
    <div className="w-full h-full min-h-[100px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={100}>
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index, entry.color)} />
            ))}
          </Pie>
          <Tooltip />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChartComponent({ data = defaultLineData }: ChartProps) {
  return (
    <div className="w-full h-full min-h-[100px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={100}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartComponent({ data = defaultData }: ChartProps) {
  return (
    <div className="w-full h-full min-h-[100px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={100}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index, entry.color)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 