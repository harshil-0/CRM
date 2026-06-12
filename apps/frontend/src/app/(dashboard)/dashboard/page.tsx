'use client';

import { motion } from 'framer-motion';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  AreaChart,
  BarChart,
  Badge,
  Skeleton,
} from '@crm/ui';
import { TrendingUp, Users, UserCheck, CheckSquare, Handshake } from 'lucide-react';
import { formatCompactCurrency } from '@/lib/format';
import { useReportsSummary } from '@/hooks/use-reports';
import { LEAD_STATUS_LABELS, LEAD_STATUS_VARIANT } from '@/lib/crm-labels';
import type { LeadStatus } from '@crm/shared-types';

export default function DashboardPage() {
  const { data: summary, isLoading } = useReportsSummary();

  const chartData = summary?.leadsByStatus.map((item) => ({
    name: LEAD_STATUS_LABELS[item.status as LeadStatus] ?? item.status,
    value: item.count,
  })) ?? [];

  const metrics = summary
    ? [
        { label: 'Total Leads', value: String(summary.totals.leads), change: `+${summary.totals.leadsThisMonth} this month`, icon: Users },
        { label: 'Pipeline Value', value: formatCompactCurrency(summary.totals.pipelineValue ?? 0), change: `${summary.totals.deals ?? 0} active deals`, icon: Handshake },
        { label: 'Tasks Due', value: String(summary.totals.tasksDue), change: 'Next 7 days', icon: CheckSquare },
        { label: 'Conversion Rate', value: `${summary.totals.conversionRate}%`, change: `${summary.totals.customers} customers`, icon: TrendingUp },
      ]
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader title="Dashboard" description="Overview of your CRM performance" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          : metrics.map((metric, i) => (
              <motion.div key={metric.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                      <metric.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-semibold mt-2">{metric.value}</p>
                    <p className="text-xs mt-1 text-muted-foreground">{metric.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base">Leads by Status</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
              chartData.length > 0 ? <AreaChart data={chartData} /> : <p className="text-sm text-muted-foreground text-center py-12">No lead data yet</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Lead Distribution</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
              chartData.length > 0 ? <BarChart data={chartData} /> : <p className="text-sm text-muted-foreground text-center py-12">No lead data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Leads</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : summary?.recentLeads.length ? (
            <div className="space-y-3">
              {summary.recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{lead.title}</p>
                    <p className="text-xs text-muted-foreground">{lead.company ?? 'No company'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={LEAD_STATUS_VARIANT[lead.status as LeadStatus] ?? 'secondary'}>
                      {LEAD_STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Score: {lead.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No leads yet. Head to Leads to create your first one.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
