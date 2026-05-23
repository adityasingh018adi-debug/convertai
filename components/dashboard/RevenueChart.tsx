"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "01 May", revenue: 42000, target: 50000 },
  { date: "04 May", revenue: 58000, target: 52000 },
  { date: "07 May", revenue: 51000, target: 55000 },
  { date: "10 May", revenue: 72000, target: 60000 },
  { date: "13 May", revenue: 68000, target: 65000 },
  { date: "16 May", revenue: 89000, target: 70000 },
  { date: "19 May", revenue: 78000, target: 72000 },
  { date: "22 May", revenue: 95000, target: 80000 },
  { date: "25 May", revenue: 112000, target: 85000 },
  { date: "28 May", revenue: 104000, target: 88000 },
  { date: "31 May", revenue: 127000, target: 95000 },
];

function formatINR(value: number) {
  if (value >= 100000)
    return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000)
    return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-blue-600">
          ₹{new Intl.NumberFormat("en-IN").format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function RevenueChart() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Revenue Overview
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            May 2025 — daily revenue trend
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-0.5 bg-purple-400 rounded-full inline-block" />
            Target
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatINR}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="url(#colorTarget)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#colorRevenue)"
            dot={{ fill: "#3b82f6", r: 3, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
