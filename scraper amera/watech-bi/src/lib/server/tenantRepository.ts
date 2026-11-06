import { prisma, isDatabaseConfigured } from './db';
import type { Prisma } from '@prisma/client';

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Server-side tenant-isolated data repository.
 * Every query strictly enforces tenant isolation and handles session scoping.
 */
export class ServerTenantRepository {
  private tenantId: string;
  private isSuperAdmin: boolean;

  constructor(tenantId: string, isSuperAdmin: boolean = false) {
    if (!tenantId && !isSuperAdmin) {
      throw new Error('Tenant context is required for database operations.');
    }
    this.tenantId = tenantId;
    this.isSuperAdmin = isSuperAdmin;
  }

  /**
   * Sets the PostgreSQL session variables for transaction-level RLS policies.
   */
  async withTenantContext<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    if (!isDatabaseConfigured) {
      throw new Error('PostgreSQL database is not configured (missing DATABASE_URL).');
    }

    return await prisma.$transaction(async (tx) => {
      // Set PostgreSQL session setting for current transaction RLS
      await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant_id = '${this.tenantId}'`);
      if (this.isSuperAdmin) {
        await tx.$executeRawUnsafe(`SET LOCAL app.is_super_admin = 'true'`);
      }
      return await callback(tx);
    });
  }

  // --------------------------------------------------------------------------
  // PROJECTS
  // --------------------------------------------------------------------------

  async getProjects(options: PaginationOptions = {}) {
    if (!isDatabaseConfigured) return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const [total, data] = await Promise.all([
      prisma.researchProject.count({ where: { tenantId: this.tenantId } }),
      prisma.researchProject.findMany({
        where: { tenantId: this.tenantId },
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getProjectById(id: string) {
    if (!isDatabaseConfigured) return null;
    return await prisma.researchProject.findFirst({
      where: { id, tenantId: this.tenantId },
    });
  }

  async createProject(data: { name: string; industryNiche?: string; cityArea?: string }) {
    if (!isDatabaseConfigured) throw new Error('Database not configured');
    return await prisma.researchProject.create({
      data: {
        ...data,
        tenantId: this.tenantId,
      },
    });
  }

  // --------------------------------------------------------------------------
  // BUSINESSES & LEADS
  // --------------------------------------------------------------------------

  async getBusinesses(projectId?: string, options: PaginationOptions = {}) {
    if (!isDatabaseConfigured) return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const where: Prisma.BusinessWhereInput = {
      tenantId: this.tenantId,
      ...(projectId ? { projectId } : {}),
    };

    const [total, data] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async getBusinessById(id: string) {
    if (!isDatabaseConfigured) return null;
    return await prisma.business.findFirst({
      where: { id, tenantId: this.tenantId },
    });
  }

  async upsertBusiness(id: string, data: Prisma.BusinessCreateWithoutTenantInput) {
    if (!isDatabaseConfigured) throw new Error('Database not configured');
    return await prisma.business.upsert({
      where: { id },
      create: {
        ...data,
        id,
        tenant: { connect: { id: this.tenantId } },
      },
      update: {
        ...data,
      },
    });
  }

  // --------------------------------------------------------------------------
  // PROPOSALS
  // --------------------------------------------------------------------------

  async getProposals(options: PaginationOptions = {}) {
    if (!isDatabaseConfigured) return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const [total, data] = await Promise.all([
      prisma.businessProposal.count({ where: { tenantId: this.tenantId } }),
      prisma.businessProposal.findMany({
        where: { tenantId: this.tenantId },
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // --------------------------------------------------------------------------
  // INVOICES & FINANCIALS
  // --------------------------------------------------------------------------

  async getInvoices(options: PaginationOptions = {}) {
    if (!isDatabaseConfigured) return { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const skip = (page - 1) * pageSize;

    const [total, data] = await Promise.all([
      prisma.agencyInvoice.count({ where: { tenantId: this.tenantId } }),
      prisma.agencyInvoice.findMany({
        where: { tenantId: this.tenantId },
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  // --------------------------------------------------------------------------
  // AUDIT LOGS
  // --------------------------------------------------------------------------

  async createAuditLog(params: {
    actorUserId: string;
    actorEmail: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details: string;
    ipAddress?: string;
  }) {
    if (!isDatabaseConfigured) return null;
    return await prisma.tenantAuditLog.create({
      data: {
        tenantId: this.tenantId,
        actorUserId: params.actorUserId,
        actorEmail: params.actorEmail,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
  }
}