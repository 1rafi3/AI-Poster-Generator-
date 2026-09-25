import { Request, Response } from 'express';
import { Template } from '../models/Template';

export async function getTemplates(req: Request, res: Response): Promise<void> {
  try {
    const { occasion } = req.query;
    const query: any = { isActive: true };

    if (occasion && typeof occasion === 'string' && occasion !== 'all') {
      query.occasionType = occasion;
    }

    const templates = await Template.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: templates.length, templates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getTemplateById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    res.status(200).json({ success: true, template });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
