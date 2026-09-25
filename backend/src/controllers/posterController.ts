import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Poster } from '../models/Poster';
import { Template } from '../models/Template';
import { generateAIPosterAssistance } from '../services/gemini';
import { renderPosterImage } from '../services/renderer';
import mongoose from 'mongoose';

export async function createPoster(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { templateId, formData, uploadedPhotoUrls } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!templateId || !formData) {
      res.status(400).json({ success: false, message: 'templateId and formData are required' });
      return;
    }

    const template = await Template.findById(templateId);
    if (!template) {
      res.status(404).json({ success: false, message: 'Selected template not found' });
      return;
    }

    // Create poster record in generating status
    const poster = new Poster({
      userId: new mongoose.Types.ObjectId(userId),
      templateId: new mongoose.Types.ObjectId(templateId),
      formData,
      uploadedPhotoUrls: uploadedPhotoUrls || [],
      status: 'generating',
      retryCount: 0,
      moderationStatus: 'approved',
    });

    await poster.save();

    // Run AI enhancement & rendering
    try {
      const aiSuggestions = await generateAIPosterAssistance(poster._id as any, {
        name: formData.name,
        designation: formData.designation,
        party: formData.party,
        district: formData.district,
        occasionType: formData.occasionType || template.occasionType,
        headline: formData.headline,
        slogan: formData.slogan,
      });

      poster.aiSuggestions = aiSuggestions;
      if (!poster.formData.slogan && aiSuggestions.sloganSuggestion) {
        poster.formData.slogan = aiSuggestions.sloganSuggestion;
      }

      // Render print-ready poster
      const imageUrl = await renderPosterImage(poster, template);
      poster.generatedImageUrl = imageUrl;
      poster.status = 'completed';
      await poster.save();

      res.status(201).json({
        success: true,
        message: 'Poster created and generated successfully',
        poster,
      });
    } catch (renderError: any) {
      console.error('Render error:', renderError);
      poster.status = 'failed';
      await poster.save();

      res.status(500).json({
        success: false,
        message: 'Poster generation encountered an error: ' + renderError.message,
        poster,
      });
    }
  } catch (error: any) {
    console.error('Create poster error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPosterById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const poster = await Poster.findById(id).populate('templateId');

    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found' });
      return;
    }

    res.status(200).json({ success: true, poster });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getUserPosters(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId } = req.params;

    // Safety check: only let users view their own unless admin
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const posters = await Poster.find({ userId }).populate('templateId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posters.length, posters });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function regeneratePoster(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { formData } = req.body;

    const poster = await Poster.findById(id);
    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found' });
      return;
    }

    if (poster.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Limit retries
    if (poster.retryCount >= 5) {
      res.status(429).json({ success: false, message: 'Maximum regeneration limit (5 retries) reached for this poster.' });
      return;
    }

    const template = await Template.findById(poster.templateId);
    if (!template) {
      res.status(404).json({ success: false, message: 'Associated template not found' });
      return;
    }

    if (formData) {
      poster.formData = { ...poster.formData, ...formData };
    }

    poster.status = 'generating';
    poster.retryCount += 1;
    await poster.save();

    // Re-run AI & Sharp renderer
    const aiSuggestions = await generateAIPosterAssistance(poster._id as any, {
      name: poster.formData.name,
      designation: poster.formData.designation,
      party: poster.formData.party,
      district: poster.formData.district,
      occasionType: poster.formData.occasionType || template.occasionType,
      headline: poster.formData.headline,
      slogan: poster.formData.slogan,
    });

    poster.aiSuggestions = aiSuggestions;
    const imageUrl = await renderPosterImage(poster, template);
    poster.generatedImageUrl = imageUrl;
    poster.status = 'completed';
    await poster.save();

    res.status(200).json({
      success: true,
      message: 'Poster regenerated successfully',
      poster,
    });
  } catch (error: any) {
    console.error('Regenerate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePoster(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const poster = await Poster.findById(id);

    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found' });
      return;
    }

    if (poster.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    await Poster.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Poster deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
