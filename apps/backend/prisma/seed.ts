import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { name: 'users:read', displayName: 'View Users', module: 'users', action: 'read' },
  { name: 'users:write', displayName: 'Manage Users', module: 'users', action: 'write' },
  { name: 'users:delete', displayName: 'Delete Users', module: 'users', action: 'delete' },
  { name: 'roles:read', displayName: 'View Roles', module: 'roles', action: 'read' },
  { name: 'roles:write', displayName: 'Manage Roles', module: 'roles', action: 'write' },
  { name: 'audit:read', displayName: 'View Audit Logs', module: 'audit', action: 'read' },
  { name: 'leads:read', displayName: 'View Leads', module: 'leads', action: 'read' },
  { name: 'leads:write', displayName: 'Manage Leads', module: 'leads', action: 'write' },
  { name: 'leads:delete', displayName: 'Delete Leads', module: 'leads', action: 'delete' },
  { name: 'leads:assign', displayName: 'Assign Leads', module: 'leads', action: 'assign' },
  { name: 'customers:read', displayName: 'View Customers', module: 'customers', action: 'read' },
  { name: 'customers:write', displayName: 'Manage Customers', module: 'customers', action: 'write' },
  { name: 'customers:delete', displayName: 'Delete Customers', module: 'customers', action: 'delete' },
  { name: 'deals:read', displayName: 'View Deals', module: 'deals', action: 'read' },
  { name: 'deals:write', displayName: 'Manage Deals', module: 'deals', action: 'write' },
  { name: 'deals:delete', displayName: 'Delete Deals', module: 'deals', action: 'delete' },
  { name: 'tasks:read', displayName: 'View Tasks', module: 'tasks', action: 'read' },
  { name: 'tasks:write', displayName: 'Manage Tasks', module: 'tasks', action: 'write' },
  { name: 'tasks:delete', displayName: 'Delete Tasks', module: 'tasks', action: 'delete' },
  { name: 'reports:read', displayName: 'View Reports', module: 'reports', action: 'read' },
  { name: 'settings:read', displayName: 'View Settings', module: 'settings', action: 'read' },
  { name: 'settings:write', displayName: 'Manage Settings', module: 'settings', action: 'write' },
];

const ROLES = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full system access',
    isSystem: true,
    permissions: PERMISSIONS.map((p) => p.name),
  },
  {
    name: 'manager',
    displayName: 'Manager',
    description: 'Manage team and CRM data',
    isSystem: true,
    permissions: PERMISSIONS.filter((p) => !p.name.startsWith('users:') && !p.name.startsWith('roles:')).map((p) => p.name),
  },
  {
    name: 'sales_rep',
    displayName: 'Sales Rep',
    description: 'Manage assigned leads and deals',
    isSystem: true,
    permissions: [
      'leads:read', 'leads:write', 'leads:assign',
      'customers:read', 'customers:write',
      'deals:read', 'deals:write',
      'tasks:read', 'tasks:write',
      'reports:read',
      'settings:read',
    ],
  },
  {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access',
    isSystem: true,
    permissions: PERMISSIONS.filter((p) => p.action === 'read').map((p) => p.name),
  },
];

async function main() {
  console.log('Seeding database...');

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  const allPermissions = await prisma.permission.findMany();
  const permMap = new Map(allPermissions.map((p) => [p.name, p.id]));

  for (const role of ROLES) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { displayName: role.displayName, description: role.description },
      create: {
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        isSystem: role.isSystem,
      },
    });

    await prisma.rolePermission.deleteMany({ where: { roleId: createdRole.id } });
    await prisma.rolePermission.createMany({
      data: role.permissions
        .map((name) => ({ roleId: createdRole.id, permissionId: permMap.get(name)! }))
        .filter((rp) => rp.permissionId),
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  if (!adminRole) throw new Error('Admin role not found');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@crm.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      roleId: adminRole.id,
      emailVerified: true,
      isActive: true,
    },
  });

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) throw new Error('Admin user not found');

  const existingLeads = await prisma.lead.count();
  if (existingLeads === 0) {
    const sampleLeads = [
      { title: 'Rajesh Kumar', company: 'SolarTech India', email: 'rajesh@solartech.in', source: 'Website', status: 'new', score: 85 },
      { title: 'Priya Sharma', company: 'EduCoach Academy', email: 'priya@educoach.com', source: 'Referral', status: 'contacted', score: 72 },
      { title: 'Amit Patel', company: 'GreenHomes Realty', email: 'amit@greenhomes.in', source: 'LinkedIn', status: 'qualified', score: 90 },
      { title: 'Sneha Reddy', company: 'TravelWise Tours', email: 'sneha@travelwise.com', source: 'Exhibition', status: 'proposal', score: 68 },
      { title: 'Vikram Singh', company: 'FitLife Gym', email: 'vikram@fitlife.in', source: 'Cold Call', status: 'new', score: 45 },
      { title: 'Anita Desai', company: 'CloudServe IT', email: 'anita@cloudserve.com', source: 'Website', status: 'negotiation', score: 88 },
    ];

    for (const lead of sampleLeads) {
      await prisma.lead.create({
        data: { ...lead, createdById: admin.id, assignedToId: admin.id },
      });
    }

    const sampleTasks = [
      { title: 'Follow up with Rajesh Kumar', priority: 'high', status: 'pending', dueDate: new Date(Date.now() + 86400000) },
      { title: 'Send proposal to Sneha Reddy', priority: 'urgent', status: 'in_progress', dueDate: new Date(Date.now() + 172800000) },
      { title: 'Schedule demo for Amit Patel', priority: 'medium', status: 'pending', dueDate: new Date(Date.now() + 259200000) },
      { title: 'Review contract with Anita Desai', priority: 'high', status: 'pending', dueDate: new Date(Date.now() + 432000000) },
    ];

    for (const task of sampleTasks) {
      await prisma.task.create({
        data: { ...task, createdById: admin.id, assignedToId: admin.id },
      });
    }

    console.log(`Seeded ${sampleLeads.length} leads and ${sampleTasks.length} tasks`);
  }

  const existingPipeline = await prisma.pipeline.count();
  if (existingPipeline === 0) {
    const defaultStages = [
      { id: 'lead', name: 'Lead', color: '#6366f1', order: 0 },
      { id: 'qualified', name: 'Qualified', color: '#8b5cf6', order: 1 },
      { id: 'proposal', name: 'Proposal', color: '#f59e0b', order: 2 },
      { id: 'negotiation', name: 'Negotiation', color: '#f97316', order: 3 },
      { id: 'won', name: 'Won', color: '#10b981', order: 4 },
      { id: 'lost', name: 'Lost', color: '#ef4444', order: 5 },
    ];

    const pipeline = await prisma.pipeline.create({
      data: {
        name: 'Sales Pipeline',
        stages: defaultStages,
        isDefault: true,
      },
    });

    const sampleDeals = [
      { title: 'SolarTech 50kW Installation', value: 2500000, stage: 'proposal', probability: 60, company: 'SolarTech India' },
      { title: 'EduCoach Annual License', value: 180000, stage: 'qualified', probability: 40, company: 'EduCoach Academy' },
      { title: 'GreenHomes Premium Package', value: 5200000, stage: 'negotiation', probability: 80, company: 'GreenHomes Realty' },
      { title: 'TravelWise Corporate Booking', value: 310000, stage: 'lead', probability: 20, company: 'TravelWise Tours' },
      { title: 'CloudServe Enterprise Plan', value: 890000, stage: 'won', probability: 100, company: 'CloudServe IT' },
    ];

    for (const deal of sampleDeals) {
      await prisma.deal.create({
        data: {
          title: deal.title,
          value: deal.value,
          currency: 'INR',
          stage: deal.stage,
          pipelineId: pipeline.id,
          probability: deal.probability,
          assignedToId: admin.id,
          createdById: admin.id,
          notes: deal.company,
        },
      });
    }

    const leads = await prisma.lead.findMany({ take: 2 });
    if (leads.length > 0) {
      await prisma.followUp.create({
        data: {
          scheduledAt: new Date(Date.now() + 86400000),
          notes: 'Initial discovery call',
          leadId: leads[0].id,
          createdById: admin.id,
        },
      });
    }

    console.log(`Seeded pipeline with ${sampleDeals.length} deals`);
  }

  const existingNotifications = await prisma.notification.count();
  if (existingNotifications === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: admin.id,
          type: 'info',
          title: 'Welcome to CRM Platform',
          message: 'Your workspace is ready. Start by importing leads or creating your first deal.',
          link: '/dashboard',
        },
        {
          userId: admin.id,
          type: 'task',
          title: 'Tasks due this week',
          message: 'You have follow-ups scheduled. Check your tasks page.',
          link: '/tasks',
        },
        {
          userId: admin.id,
          type: 'lead',
          title: 'New lead assigned',
          message: 'Rajesh Kumar from SolarTech India has been assigned to you.',
          link: '/leads',
        },
      ],
    });
    console.log('Seeded sample notifications');
  }

  console.log(`Seeded admin user: ${adminEmail}`);
  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
