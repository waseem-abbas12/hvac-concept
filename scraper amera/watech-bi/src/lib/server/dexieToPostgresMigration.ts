import { prisma, isDatabaseConfigured } from './db';

export interface MigrationSummary {
  dryRun: boolean;
  totalRecordsProcessed: number;
  tenantsImported: number;
  projectsImported: number;
  businessesImported: number;
  proposalsImported: number;
  invoicesImported: number;
  rejectedRows: Array<{ entity: string; id: string; reason: string }>;
  errors: string[];
}

/**
 * Migrates exported Dexie JSON data to production PostgreSQL database.
 * Supports dry-run validation, idempotent batch upserts, and rejection reporting.
 */
export async function migrateDexieToPostgreSql(
  jsonData: string,
  options: { dryRun?: boolean; defaultTenantId?: string } = {}
): Promise<MigrationSummary> {
  const dryRun = options.dryRun ?? true;
  const defaultTenantId = options.defaultTenantId || 'tenant-watech-hq';

  const summary: MigrationSummary = {
    dryRun,
    totalRecordsProcessed: 0,
    tenantsImported: 0,
    projectsImported: 0,
    businessesImported: 0,
    proposalsImported: 0,
    invoicesImported: 0,
    rejectedRows: [],
    errors: [],
  };

  let parsed: any;
  try {
    parsed = JSON.parse(jsonData);
  } catch (err: any) {
    summary.errors.push(`JSON parse error: ${err.message}`);
    return summary;
  }

  if (!isDatabaseConfigured && !dryRun) {
    summary.errors.push('PostgreSQL database is not configured (missing DATABASE_URL).');
    return summary;
  }

  // 1. Migrate Tenants
  const tenants = parsed.tenants || [];
  for (const t of tenants) {
    summary.totalRecordsProcessed++;
    if (!t.id || !t.slug || !t.name) {
      summary.rejectedRows.push({ entity: 'tenants', id: t.id || 'unknown', reason: 'Missing required tenant fields' });
      continue;
    }

    if (!dryRun) {
      await prisma.tenant.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
          slug: t.slug,
          name: t.name,
          planId: t.planId || 'plan-growth',
          status: t.status || 'active',
          customDomain: t.customDomain || null,
          contactEmail: t.contactEmail || 'admin@watech.agency',
          isPlatformSuperAdminTenant: Boolean(t.isPlatformSuperAdminTenant),
        },
        update: {
          name: t.name,
          status: t.status,
          contactEmail: t.contactEmail,
        },
      });
    }
    summary.tenantsImported++;
  }

  // 2. Ensure default tenant exists
  if (!dryRun) {
    await prisma.tenant.upsert({
      where: { id: defaultTenantId },
      create: {
        id: defaultTenantId,
        slug: 'watech-hq',
        name: 'Watech Intelligence HQ',
        planId: 'plan-enterprise',
        status: 'active',
        contactEmail: 'admin@watech.agency',
        isPlatformSuperAdminTenant: true,
      },
      update: {},
    });
  }

  // 3. Migrate Projects
  const projects = parsed.projects || [];
  for (const p of projects) {
    summary.totalRecordsProcessed++;
    if (!p.id || !p.name) {
      summary.rejectedRows.push({ entity: 'projects', id: p.id || 'unknown', reason: 'Missing project id or name' });
      continue;
    }

    const tenantId = p.tenantId || defaultTenantId;
    if (!dryRun) {
      await prisma.researchProject.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          tenantId,
          name: p.name,
          industryNiche: p.industryNiche || null,
          cityArea: p.cityArea || null,
          status: p.status || 'active',
        },
        update: {
          name: p.name,
          status: p.status,
        },
      });
    }
    summary.projectsImported++;
  }

  // 4. Migrate Businesses
  const businesses = parsed.businesses || [];
  for (const b of businesses) {
    summary.totalRecordsProcessed++;
    if (!b.id || !b.officialName || !b.projectId) {
      summary.rejectedRows.push({ entity: 'businesses', id: b.id || 'unknown', reason: 'Missing business id, name, or projectId' });
      continue;
    }

    const tenantId = b.tenantId || defaultTenantId;
    if (!dryRun) {
      await prisma.business.upsert({
        where: { id: b.id },
        create: {
          id: b.id,
          tenantId,
          projectId: b.projectId,
          officialName: b.officialName,
          brandName: b.brandName || null,
          domain: b.domain || null,
          websiteUrl: b.websiteUrl || null,
          phone: b.phone || null,
          email: b.email || null,
          city: b.city || null,
          state: b.state || null,
          status: b.status || 'discovered',
          opportunityScore: b.opportunityScore || 0,
        },
        update: {
          officialName: b.officialName,
          status: b.status,
          opportunityScore: b.opportunityScore,
        },
      });
    }
    summary.businessesImported++;
  }

  return summary;
}