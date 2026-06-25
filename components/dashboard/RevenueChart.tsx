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
import { BarChart3 } from "lucide-react";

export type RevenuePoint = { date: string; revenue: number };

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

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Payments Received
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            From your Khatabook ledger — real entries only
          </p>
        </div>
        {data.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-0.5 bg-blue-500 rounded-full inline-block" />
            Payments
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <BarChart3 size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No payment data yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Record &ldquo;You Got&rdquo; entries in the Khatabook ledger to see this chart fill in.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#colorRevenue)"
              dot={{ fill: "#3b82f6", r: 3, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
