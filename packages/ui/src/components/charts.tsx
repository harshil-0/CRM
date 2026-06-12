'use client';

import * as React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AreaChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  height?: number;
  color?: string;
}

export function AreaChart({ data, dataKey = 'value', height = 300, color = 'hsl(var(--primary))' }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
        <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} fill="url(#colorValue)" strokeWidth={2} />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}

export interface BarChartProps {
  data: ChartDataPoint[];
  dataKey?: string;
  height?: number;
  color?: string;
}

export function BarChart({ data, dataKey = 'value', height = 300, color = 'hsl(var(--primary))' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="name" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
        <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
