import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalLeads,
      totalCustomers,
      totalTasks,
      tasksDue,
      leadsByStatus,
      tasksByStatus,
      recentLeads,
      leadsThisMonth,
    ] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.customer.count(),
      this.prisma.task.count(),
      this.prisma.task.count({
        where: {
          status: { in: ['pending', 'in_progress'] },
          dueDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.lead.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, company: true, status: true, score: true, createdAt: true },
      }),
      this.prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    const convertedLeads = await this.prisma.lead.count({ where: { convertedAt: { not: null } } });
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 1000) / 10 : 0;

    const [totalDeals, dealsByStage, pipelineValue] = await Promise.all([
      this.prisma.deal.count(),
      this.prisma.deal.groupBy({ by: ['stage'], _count: { id: true }, _sum: { value: true } }),
      this.prisma.deal.aggregate({ _sum: { value: true } }),
    ]);

    return {
      totals: {
        leads: totalLeads,
        customers: totalCustomers,
        tasks: totalTasks,
        tasksDue,
        leadsThisMonth,
        conversionRate,
        deals: totalDeals,
        pipelineValue: Number(pipelineValue._sum.value ?? 0),
      },
      leadsByStatus: leadsByStatus.map((g) => ({ status: g.status, count: g._count.id })),
      tasksByStatus: tasksByStatus.map((g) => ({ status: g.status, count: g._count.id })),
      dealsByStage: dealsByStage.map((g) => ({
        stage: g.stage,
        count: g._count.id,
        value: Number(g._sum.value ?? 0),
      })),
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        title: l.title,
        company: l.company,
        status: l.status,
        score: l.score,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  }

  async getDealsReport() {
    const [deals, pipelines] = await Promise.all([
      this.prisma.deal.findMany({
        include: {
          customer: { select: { name: true } },
          pipeline: { select: { name: true, stages: true } },
        },
        orderBy: { value: 'desc' },
      }),
      this.prisma.pipeline.findMany({ where: { isDefault: true } }),
    ]);

    const defaultPipeline = pipelines[0];
    const stages = defaultPipeline
      ? (defaultPipeline.stages as { id: string; name: string; color?: string }[])
      : [];

    const byStage = stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage.id);
      return {
        stageId: stage.id,
        stageName: stage.name,
        color: stage.color,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + Number(d.value), 0),
        deals: stageDeals.map((d) => ({
          id: d.id,
          title: d.title,
          value: Number(d.value),
          currency: d.currency,
          customer: d.customer?.name ?? null,
          probability: d.probability,
        })),
      };
    });

    const totalValue = deals.reduce((sum, d) => sum + Number(d.value), 0);
    const weightedValue = deals.reduce(
      (sum, d) => sum + Number(d.value) * (d.probability / 100),
      0,
    );

    return {
      totalDeals: deals.length,
      totalValue,
      weightedValue: Math.round(weightedValue),
      byStage,
    };
  }

  async getActivityReport() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [recentActivity, activityByEntity] = await Promise.all([
      this.prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['entity'],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
    ]);

    return {
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        user: log.user
          ? { firstName: log.user.firstName, lastName: log.user.lastName, email: log.user.email }
          : null,
        createdAt: log.createdAt.toISOString(),
      })),
      activityByEntity: activityByEntity.map((g) => ({
        entity: g.entity,
        count: g._count.id,
      })),
    };
  }
}
