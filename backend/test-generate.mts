import prisma from './src/config/Database.js';
import { bulkEmailService } from './src/services/bulk-email/bulk-email.service.js';

const testRows = [
  {
    candidateName: 'Test User',
    email: 'test@example.com',
    instituteName: 'Test Institute',
    'Candidate Name': 'Test User',
    'Email': 'test@example.com',
    'Institute Name': 'Test Institute',
    'CANDIDATE_NAME': 'Test User',
    'ORGANIZATION_NAME': 'Test Institute',
    'REGISTRATION_NUMBER': 'REG-TEST-001',
    'STANDARD_SCOPE': 'ISO 9001',
    'ISSUE_DATE': '27/06/2026',
    'CERTIFICATE_ID': 'CERT-TEST-001',
  }
];

const templateHtml = '<html><body><h1>{{CANDIDATE_NAME}}</h1><p>{{ORGANIZATION_NAME}}</p></body></html>';

try {
  console.log('[TEST] Starting generate campaign...');
  const campaignId = `TEST-${Date.now()}`;
  const result = await bulkEmailService.generateCampaign(campaignId, testRows, templateHtml, 'http://localhost:8080');
  console.log('[TEST] SUCCESS! campaignDbId:', result);
} catch (err) {
  console.error('[TEST] ERROR:', err.message);
  console.error('[TEST] STACK:', err.stack);
} finally {
  await prisma.$disconnect();
}
