import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Template } from '../models/Template';
import { Poster } from '../models/Poster';
import { GenerationLog } from '../models/GenerationLog';
import { User } from '../models/User';

export async function createTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, occasionType, occasionLabelBangla, thumbnailUrl, layoutConfig } = req.body;

    if (!title || !occasionType || !layoutConfig) {
      res.status(400).json({ success: false, message: 'Title, occasionType, and layoutConfig are required.' });
      return;
    }

    const template = await Template.create({
      title,
      occasionType,
      occasionLabelBangla: occasionLabelBangla || 'কাস্টম',
      thumbnailUrl: thumbnailUrl || '',
      layoutConfig,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'Template created successfully', template });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    const template = await Template.findByIdAndUpdate(id, updates, { new: true });
    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Template updated successfully', template });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteTemplate(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const template = await Template.findByIdAndDelete(id);

    if (!template) {
      res.status(404).json({ success: false, message: 'Template not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAdminPosters(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, moderationStatus } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (moderationStatus && moderationStatus !== 'all') {
      query.moderationStatus = moderationStatus;
    }

    const posters = await Poster.find(query)
      .populate('userId', 'name emailOrPhone')
      .populate('templateId', 'title occasionType')
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();
    const totalPosters = await Poster.countDocuments();
    const totalTemplates = await Template.countDocuments();
    const totalLogs = await GenerationLog.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPosters,
        totalTemplates,
        totalLogs,
      },
      posters,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function moderatePoster(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { moderationStatus, moderationNotes } = req.body;

    if (!['approved', 'pending', 'flagged'].includes(moderationStatus)) {
      res.status(400).json({ success: false, message: 'Invalid moderationStatus. Must be approved, pending, or flagged.' });
      return;
    }

    const poster = await Poster.findByIdAndUpdate(
      id,
      { moderationStatus, moderationNotes: moderationNotes || '' },
      { new: true }
    );

    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Poster moderation status updated', poster });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
