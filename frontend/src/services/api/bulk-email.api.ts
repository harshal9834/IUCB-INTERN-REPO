import { axiosInstance as apiClient } from './axios';

export interface EmailConfig {
  subject: string;
  body: string;
  fromName: string;
  replyTo?: string;
}

export const bulkEmailApi = {
  uploadExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/bulk-email/upload-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadTemplate: (file: File, excelColumns: string[]) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('excelColumns', JSON.stringify(excelColumns));
    return apiClient.post('/bulk-email/upload-template', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  generateCampaign: (
    campaignId: string, 
    rows: any[], 
    templateHtml: string, 
    baseUrl: string
  ) => {
    return apiClient.post('/bulk-email/generate', {
      campaignId,
      rows,
      templateHtml,
      baseUrl
    });
  },

  sendEmails: (campaignDbId: string, emailConfig: EmailConfig) => {
    return apiClient.post('/bulk-email/send', {
      campaignDbId,
      emailConfig
    });
  },

  getReport: (campaignDbId: string) => {
    return apiClient.get(`/bulk-email/report/${campaignDbId}`);
  }
};

export default bulkEmailApi;
