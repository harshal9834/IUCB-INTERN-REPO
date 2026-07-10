// ============================================================
// Audit Mapper – converts DB models → AuditLogDTO
// Only this file + the repository change when AuditLog table
// is introduced later.
// ============================================================

import type {
  AuditLogDTO,
  RawOrganization,
  RawAuditor,
  RawCredential,
  RawAdvisoryApplication,
  RawAdvisor,
  RawNews,
  RawResource,
} from '../types/audit.types.js';
import {
  generateDummyIp,
  generateDummyUserAgent,
  generateRemarks,
  pickAdmin,
} from './audit.helpers.js';

// ---- Organizations ------------------------------------------

export function mapOrganization(org: RawOrganization, adminName: string, adminId: string): AuditLogDTO {
  const newData: Record<string, unknown> = {
    name: org.organizationName,
    status: org.accreditationStatus,
  };
  return {
    id: `org_${org.id}`,
    timestamp: org.createdAt.toISOString(),
    action: 'CREATED',
    entityType: 'Organization',
    entityName: org.organizationName,
    entityId: org.id,
    details: `Organization "${org.organizationName}" registered in the system`,
    adminName,
    adminId,
    ipAddress: generateDummyIp(),
    userAgent: generateDummyUserAgent(),
    oldData: null,
    newData,
    remarks: null,
    status: 'SUCCESS',
  };
}

// ---- Auditors -----------------------------------------------

export function mapAuditor(auditor: RawAuditor, adminName: string, adminId: string): AuditLogDTO {
  const newData: Record<string, unknown> = {
    fullName: auditor.fullName,
    tier: auditor.tier,
    status: auditor.status,
  };
  return {
    id: `aud_${auditor.id}`,
    timestamp: auditor.createdAt.toISOString(),
    action: 'CREATED',
    entityType: 'Auditor',
    entityName: auditor.fullName,
    entityId: auditor.id,
    details: `Auditor profile created for ${auditor.fullName}`,
    adminName,
    adminId,
    ipAddress: generateDummyIp(),
    userAgent: generateDummyUserAgent(),
    oldData: null,
    newData,
    remarks: null,
    status: 'SUCCESS',
  };
}

// ---- Credentials --------------------------------------------

export function mapCredential(cred: RawCredential, adminName: string, adminId: string): AuditLogDTO {
  const newData: Record<string, unknown> = {
    credentialId: cred.credentialId,
    standard: cred.standard,
    status: cred.status,
  };
  return {
    id: `cred_${cred.id}`,
    timestamp: cred.createdAt.toISOString(),
    action: 'ISSUED',
    entityType: 'Credential',
    entityName: cred.credentialId,
    entityId: cred.id,
    details: `Credential ${cred.credentialId} issued for ${cred.standard}`,
    adminName,
    adminId,
    ipAddress: generateDummyIp(),
    userAgent: generateDummyUserAgent(),
    oldData: null,
    newData,
    remarks: null,
    status: 'SUCCESS',
  };
}

// ---- Advisory Applications ----------------------------------

function mapApplicationStatus(status: string): AuditLogDTO['action'] {
  switch (status) {
    case 'APPROVED': return 'APPROVED';
    case 'REJECTED': return 'REJECTED';
    default:         return 'CREATED';
  }
}

export function mapApplication(app: RawAdvisoryApplication, adminName: string, adminId: string): AuditLogDTO {
  const action = mapApplicationStatus(app.applicationStatus);
  const newData: Record<string, unknown> = { applicationStatus: app.applicationStatus };
  const oldData: Record<string, unknown> | null =
    app.applicationStatus !== 'PENDING'
      ? { applicationStatus: 'PENDING' }
      : null;
  return {
    id: `app_${app.id}`,
    timestamp: app.createdAt.toISOString(),
    action,
    entityType: 'Application',
    entityName: app.fullName,
    entityId: app.id,
    details: `Advisory application for ${app.fullName} – status: ${app.applicationStatus}`,
    adminName,
    adminId,
    ipAddress: generateDummyIp(),
    userAgent: generateDummyUserAgent(),
    oldData,
    newData,
    remarks: app.applicationStatus === 'REJECTED' ? generateRemarks('rejected') : null,
    status: 'SUCCESS',
  };
}

// ---- Advisors -----------------------------------------------

export function mapAdvisor(advisor: RawAdvisor, adminName: string, adminId: string): AuditLogDTO {
  const newData: Record<string, unknown> = {
    fullName: advisor.fullName,
    status: advisor.status,
  };
  return {
    id: `adv_${advisor.id}`,
    timestamp: advisor.createdAt.toISOString(),
    action: 'CREATED',
    entityType: 'Advisory',
    entityName: advisor.fullName,
    entityId: advisor.id,
    details: `Advisor ${advisor.fullName} added to advisory board`,
    adminName,
    adminId,
    ipAddress: generateDummyIp(),
    userAgent: generateDummyUserAgent(),
    oldData: null,
    newData,
    remarks: null,
    status: 'SUCCESS',
  };
}

// ---- News ---------------------------------------------------

export function mapNews(news: RawNews, adminName: string, adminId: string): AuditLogDTO {
  return {
    id: `news_${news.id}`,
    timestamp: news.createdAt.toISOString(),
    action: 'PUBLISHED',
    entityType: 'Content',
    entityName: news.title,
    entityId: news.id,
    details: `News article "${news.title}" published to portal`,
    adminName,
    adminId,
    ipAddress: generateDummyIp(),
    userAgent: generateDummyUserAgent(),
    oldData: { isPublished: false },
    newData: { isPublished: true, title: news.title },
    remarks: null,
    status: 'SUCCESS',
  };
}

// ---- Resources ----------------------------------------------

export function mapResource(resource: RawResource, adminName: string, adminId: string): AuditLogDTO {
  return {
    id: `res_${resource.id}`,
    timestamp: resource.createdAt.toISOString(),
    action: 'UPLOADED',
    entityType: 'Content',
    entityName: resource.title,
    entityId: resource.id,
    details: `Resource "${resource.title}" (${resource.category}) uploaded`,
    adminName,
    adminId,
    ipAddress: generateDummyIp(),
    userAgent: generateDummyUserAgent(),
    oldData: null,
    newData: { title: resource.title, category: resource.category },
    remarks: null,
    status: 'SUCCESS',
  };
}

// ---- Convenience: pick admin for a log entry ----------------
export { pickAdmin };
