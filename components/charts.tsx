"use client"

import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { DataItem } from "@/types/quiz"

// カラーパレット
const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#8AC926",
  "#1982C4",
  "#6A4C93",
  "#FF595E",
]

interface ChartProps {
  data: DataItem[]
}

export function PieChart({ data }: ChartProps) {
  return (
    <div className="w-full max-w-md h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ReChartsPie data={data} cx="50%" cy="50%" outerRadius={80}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label={({ name }) => `${name}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={() => ""} />
          <Legend />
        </ReChartsPie>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChart({ data }: ChartProps) {
  // 合計を計算
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <div className="flex h-16 w-full rounded-md overflow-hidden">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100
            return (
              <div
                key={index}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
                className="h-full relative group"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                  <span className="text-xs font-medium text-white drop-shadow-md">{item.name}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item, index) => {
          return (
            <div key={index} className="flex items-center">
              <div className="w-4 h-4 mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-sm">{item.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
