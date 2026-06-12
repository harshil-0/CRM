// ─── API Response Envelope ───────────────────────────────

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

// ─── Auth ────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ─── User ────────────────────────────────────────────────

export interface RoleSummary {
  id: string;
  name: string;
  displayName: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phone: string | null;
  isActive: boolean;
  role: RoleSummary;
  permissions: string[];
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  isActive?: boolean;
  avatarUrl?: string;
}

// ─── Roles & Permissions ─────────────────────────────────

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  module: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  permissions?: Permission[];
  createdAt: string;
}

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  displayName?: string;
  description?: string;
}

export interface UpdateRolePermissionsRequest {
  permissionIds: string[];
}

// ─── Audit Logs ──────────────────────────────────────────

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET';

export interface AuditLog {
  id: string;
  userId: string | null;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  action: AuditAction;
  entity: string;
  entityId: string | null;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogQuery extends PaginationQuery {
  userId?: string;
  entity?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
}

// ─── CRM Shared ──────────────────────────────────────────

export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  title: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  score: number;
  notes: string | null;
  convertedAt: string | null;
  customerId: string | null;
  assignedTo: UserSummary | null;
  createdBy?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  title: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status?: LeadStatus;
  score?: number;
  notes?: string;
  assignedToId?: string;
}

export interface UpdateLeadRequest {
  title?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status?: LeadStatus;
  score?: number;
  notes?: string;
  assignedToId?: string;
}

export interface LeadQuery extends PaginationQuery {
  status?: LeadStatus;
  assignedToId?: string;
  source?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  tags: string[];
  assignedTo: UserSummary | null;
  createdBy?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  tags?: string[];
  assignedToId?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  tags?: string[];
  assignedToId?: string;
}

export interface CustomerQuery extends PaginationQuery {
  assignedToId?: string;
  tag?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  relatedEntity: string | null;
  relatedEntityId: string | null;
  assignedTo: UserSummary | null;
  createdBy?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
}

export interface TaskQuery extends PaginationQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  relatedEntity?: string;
}

export interface ReportsSummary {
  totals: {
    leads: number;
    customers: number;
    tasks: number;
    tasksDue: number;
    leadsThisMonth: number;
    conversionRate: number;
    deals: number;
    pipelineValue: number;
  };
  leadsByStatus: { status: string; count: number }[];
  tasksByStatus: { status: string; count: number }[];
  dealsByStage: { stage: string; count: number; value: number }[];
  recentLeads: {
    id: string;
    title: string;
    company: string | null;
    status: string;
    score: number;
    createdAt: string;
  }[];
}

export interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  order: number;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
  dealCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  pipelineId: string;
  pipeline?: { id: string; name: string; stages: PipelineStage[] };
  customerId: string | null;
  customer: { id: string; name: string; company: string | null } | null;
  expectedCloseDate: string | null;
  probability: number;
  notes: string | null;
  assignedTo: UserSummary | null;
  createdBy?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDealRequest {
  title: string;
  value: number;
  currency?: string;
  stage: string;
  pipelineId: string;
  customerId?: string;
  assignedToId?: string;
  expectedCloseDate?: string;
  probability?: number;
  notes?: string;
}

export interface UpdateDealRequest {
  title?: string;
  value?: number;
  currency?: string;
  stage?: string;
  customerId?: string;
  assignedToId?: string;
  expectedCloseDate?: string;
  probability?: number;
  notes?: string;
}

export interface DealQuery extends PaginationQuery {
  pipelineId?: string;
  stage?: string;
  assignedToId?: string;
  customerId?: string;
}

export interface PipelineBoard {
  pipeline: { id: string; name: string; stages: PipelineStage[] };
  deals: Deal[];
}

export interface FollowUp {
  id: string;
  notes: string | null;
  scheduledAt: string;
  completedAt: string | null;
  leadId: string | null;
  customerId: string | null;
  taskId: string | null;
  lead: { id: string; title: string } | null;
  customer: { id: string; name: string } | null;
  createdBy?: UserSummary;
  createdAt: string;
}

export interface CreateFollowUpRequest {
  scheduledAt: string;
  notes?: string;
  leadId?: string;
  customerId?: string;
  taskId?: string;
}

export interface FollowUpQuery extends PaginationQuery {
  leadId?: string;
  customerId?: string;
  status?: 'pending' | 'completed';
}

export interface DealsReport {
  totalDeals: number;
  totalValue: number;
  weightedValue: number;
  byStage: {
    stageId: string;
    stageName: string;
    color?: string;
    count: number;
    value: number;
    deals: { id: string; title: string; value: number; currency: string; customer: string | null; probability: number }[];
  }[];
}

export interface ActivityReport {
  recentActivity: {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    user: { firstName: string; lastName: string; email: string } | null;
    createdAt: string;
  }[];
  activityByEntity: { entity: string; count: number }[];
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ─── Notifications (Week 4) ──────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'lead' | 'task' | 'import';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

// ─── Attachments (Week 4) ────────────────────────────────

export type AttachmentEntity = 'leads' | 'customers' | 'deals' | 'tasks';

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  entity: AttachmentEntity;
  entityId: string;
  uploadedBy: UserSummary;
  createdAt: string;
}

// ─── Import / Export (Week 4) ────────────────────────────

export type ImportEntity = 'leads' | 'customers';
export type ImportJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImportJob {
  id: string;
  entity: ImportEntity;
  status: ImportJobStatus;
  filename: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[] | null;
  createdAt: string;
  completedAt: string | null;
}

// ─── Client Config ───────────────────────────────────────

export interface ClientConfig {
  appName: string;
  logoUrl: string | null;
  primaryColor: string;
  enabledModules: string[];
}
