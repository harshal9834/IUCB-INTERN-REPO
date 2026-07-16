import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import { templateAnalyzerService } from '../services/template-analyzer.service.js';

const prisma = new PrismaClient();

// Ensure the storage directory exists
const getStorageDir = () => {
  const dir = path.join(process.cwd(), 'storage', 'certificate-templates');
  return dir;
};

// Ensure directory exists on startup
fs.mkdir(getStorageDir(), { recursive: true }).catch(console.error);

export class CertificateTemplateController {

  static async analyzeTemplate(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, message: 'HTML file is required' });
        return;
      }

      if (file.mimetype !== 'text/html' && !file.originalname.endsWith('.html')) {
        res.status(400).json({ success: false, message: 'Only HTML files are allowed' });
        return;
      }

      const fileBuffer = await fs.readFile(file.path);
      const htmlContent = fileBuffer.toString('utf-8');

      const analysis = templateAnalyzerService.analyze(htmlContent, file.originalname);

      // Clean up the temp file since this is just an analysis
      await fs.unlink(file.path).catch(console.error);

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      console.error('Error analyzing certificate template:', error);
      res.status(500).json({ success: false, message: 'Failed to analyze template', error: error.message });
    }
  }

  static async uploadTemplate(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      const { title, description, version, detectedType, placeholders: placeholdersString } = req.body;
      const adminId = (req as any).admin?.id;

      if (!file) {
        res.status(400).json({ success: false, message: 'HTML file is required' });
        return;
      }

      if (!title || !detectedType) {
        res.status(400).json({ success: false, message: 'Title and Detected Type are required' });
        return;
      }

      if (file.mimetype !== 'text/html' && !file.originalname.endsWith('.html')) {
        res.status(400).json({ success: false, message: 'Only HTML files are allowed' });
        return;
      }

      // Parse placeholders sent from frontend (to ensure we use what was detected in analysis)
      let placeholders: string[] = [];
      try {
        placeholders = placeholdersString ? JSON.parse(placeholdersString) : [];
      } catch (e) {
        console.error('Failed to parse placeholders', e);
      }

      const newTemplate = await prisma.certificateTemplate.create({
        data: {
          title: String(title),
          description: description ? String(description) : undefined,
          detectedType: String(detectedType),
          version: version ? String(version) : undefined,
          status: 'ARCHIVED',
          filename: file.originalname,
          filepath: path.relative(process.cwd(), file.path).replace(/\\/g, '/'),
          placeholders,
          uploadedBy: adminId || undefined,
        },
      });

      let typeName = detectedType.charAt(0) + detectedType.slice(1).toLowerCase();
      if (detectedType === "TRAINING_INSTITUTE") typeName = "Training Institute";
      

      res.status(201).json({
        success: true,
        message: 'Template uploaded successfully',
        data: newTemplate,
      });
    } catch (error: any) {
      console.error('Error uploading certificate template:', error);
      res.status(500).json({ success: false, message: 'Failed to upload template', error: error.message });
    }
  }

  static async listTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { type, status } = req.query;

      const whereClause: any = {};
      if (type) whereClause.detectedType = String(type);
      if (status) whereClause.status = String(status);

      const templates = await prisma.certificateTemplate.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          uploader: {
            select: { fullName: true, email: true },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: templates,
      });
    } catch (error: any) {
      console.error('Error listing templates:', error);
      res.status(500).json({ success: false, message: 'Failed to list templates', error: error.message });
    }
  }

  static async activateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const template = await prisma.certificateTemplate.findUnique({ where: { id } });
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }

      // Archive all other templates of the same type first
      await prisma.certificateTemplate.updateMany({
        where: { detectedType: template.detectedType, status: 'ACTIVE' },
        data: { status: 'ARCHIVED' },
      });

      // Activate this template
      const activatedTemplate = await prisma.certificateTemplate.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      res.status(200).json({
        success: true,
        message: 'Template activated successfully',
        data: activatedTemplate,
      });
    } catch (error: any) {
      console.error('Error activating template:', error);
      res.status(500).json({ success: false, message: 'Failed to activate template', error: error.message });
    }
  }

  static async archiveTemplate(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const archivedTemplate = await prisma.certificateTemplate.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });

      res.status(200).json({
        success: true,
        message: 'Template archived successfully',
        data: archivedTemplate,
      });
    } catch (error: any) {
      console.error('Error archiving template:', error);
      res.status(500).json({ success: false, message: 'Failed to archive template', error: error.message });
    }
  }

  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const template = await prisma.certificateTemplate.findUnique({ where: { id } });
      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }

      if (template.status === 'ACTIVE') {
        res.status(400).json({ success: false, message: 'Cannot delete an active template. Archive it first.' });
        return;
      }

      // Try to delete the file
      try {
        await fs.unlink(path.resolve(process.cwd(), template.filepath));
      } catch (err) {
        console.warn(`Could not delete file ${template.filepath}`, err);
      }

      await prisma.certificateTemplate.delete({ where: { id } });

      res.status(200).json({
        success: true,
        message: 'Template deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      res.status(500).json({ success: false, message: 'Failed to delete template', error: error.message });
    }
  }

  static async downloadOriginalHtml(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const template = await prisma.certificateTemplate.findUnique({ where: { id } });

      if (!template) {
        res.status(404).json({ success: false, message: 'Template not found' });
        return;
      }

      const filePath = path.resolve(process.cwd(), template.filepath);
      res.download(filePath, template.filename);
    } catch (error: any) {
      console.error('Error downloading template:', error);
      res.status(500).json({ success: false, message: 'Failed to download template', error: error.message });
    }
  }
}
