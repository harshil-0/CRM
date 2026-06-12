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
  DataTable,
} from '@crm/ui';
import { useReportsSummary, useDealsReport, useActivityReport } from '@/hooks/use-reports';
import { LEAD_STATUS_LABELS, LEAD_STATUS_VARIANT } from '@/lib/crm-labels';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';
import { formatDateTime } from '@crm/utils';
import type { LeadStatus } from '@crm/shared-types';

export default function ReportsPage() {
  const { data: summary, isLoading: summaryLoading } = useReportsSummary();
  const { data: dealsReport, isLoading: dealsLoading } = useDealsReport();
  const { data: activity, isLoading: activityLoading } = useActivityReport();

  const leadsChart = summary?.leadsByStatus.map((item) => ({
    name: LEAD_STATUS_LABELS[item.status as LeadStatus] ?? item.status,
    value: item.count,
  })) ?? [];

  const dealsChart = dealsReport?.byStage.map((item) => ({
    name: item.stageName,
    value: item.value,
  })) ?? [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader title="Reports" description="Analytics and performance insights" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <MetricCard label="Total Leads" value={String(summary?.totals.leads ?? 0)} />
            <MetricCard label="Customers" value={String(summary?.totals.customers ?? 0)} />
            <MetricCard label="Active Deals" value={String(summary?.totals.deals ?? 0)} />
            <MetricCard label="Pipeline Value" value={formatCompactCurrency(summary?.totals.pipelineValue ?? 0)} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base">Leads by Status</CardTitle></CardHeader>
          <CardContent>
            {summaryLoading ? <Skeleton className="h-[280px]" /> : (
              leadsChart.length ? <BarChart data={leadsChart} /> : <EmptyChart />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Pipeline Stage</CardTitle></CardHeader>
          <CardContent>
            {dealsLoading ? <Skeleton className="h-[280px]" /> : (
              dealsChart.length ? <AreaChart data={dealsChart} /> : <EmptyChart />
            )}
          </CardContent>
        </Card>
      </div>

      {dealsReport && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pipeline Breakdown</CardTitle>
              <div className="text-sm text-muted-foreground">
                Weighted forecast: <span className="font-medium text-foreground">{formatCurrency(dealsReport.weightedValue)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dealsReport.byStage.map((stage) => (
                <div key={stage.stageId} className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {stage.color && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />}
                    <span className="text-sm font-medium">{stage.stageName}</span>
                  </div>
                  <p className="text-xl font-semibold">{stage.count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatCompactCurrency(stage.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <DataTable
              columns={[
                { key: 'action', header: 'Action', cell: (row) => <Badge variant="outline">{row.action}</Badge> },
                { key: 'entity', header: 'Entity', cell: (row) => row.entity },
                { key: 'user', header: 'User', cell: (row) =>
                  row.user ? `${row.user.firstName} ${row.user.lastName}` : 'System'
                },
                { key: 'createdAt', header: 'When', cell: (row) => formatDateTime(row.createdAt) },
              ]}
              data={activity?.recentActivity.map((a) => ({ ...a, id: a.id })) ?? []}
              emptyMessage="No activity recorded yet"
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return <p className="text-sm text-muted-foreground text-center py-16">No data available</p>;
}
