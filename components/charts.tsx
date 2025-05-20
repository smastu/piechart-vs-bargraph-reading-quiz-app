"use client"

import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart as ReChartsBar, Bar, XAxis, YAxis } from "recharts"
import type { DataItem } from "@/types/quiz"

const COLORS = [
  "#FF6384", // ピンク
  "#36A2EB", // 青
  "#FFCE56", // 黄色
  "#4BC0C0", // ターコイズ
  "#9966FF", // 紫
  "#FF9F40", // オレンジ
  "#8AC926", // ライムグリーン
  "#1982C4", // スカイブルー
  "#6A4C93", // インディゴ
  "#FF595E", // コーラル
]

interface ChartProps {
  data: DataItem[]
}

export function PieChart({ data }: ChartProps) {
  return (
    <div className="w-full max-w-md h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ReChartsPie>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            labelLine={true}
            animationBegin={200}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value.toFixed(1)}%`}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              border: "1px solid #eee"
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-sm">{value}</span>}
          />
        </ReChartsPie>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChart({ data }: ChartProps) {
  // 合計を計算
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  // パーセンテージに変換したデータを作成
  const percentageData = data.map(item => ({
    name: item.name,
    value: (item.value / total) * 100
  }))

  return (
    <div className="w-full max-w-md">
      <ResponsiveContainer width="100%" height={120}>
        <ReChartsBar
          data={[{ ...percentageData }]}
          layout="vertical"
          barSize={40}
          className="mt-4"
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" hide />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "8px",
              padding: "8px 12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              border: "1px solid #eee"
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {percentageData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Bar>
        </ReChartsBar>
      </ResponsiveContainer>

      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-4 h-4 mr-2 rounded-sm" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }} 
            />
            <span className="text-sm font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}