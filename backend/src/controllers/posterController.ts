import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Poster } from '../models/Poster';
import { Template } from '../models/Template';
import { generateAIPosterAssistance, moderatePosterWithAI } from '../services/gemini';
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

    // Run AI content moderation check on user text
    const moderationResult = await moderatePosterWithAI({
      name: formData.name,
      designation: formData.designation,
      party: formData.party,
      district: formData.district,
      headline: formData.headline,
      subheadline: formData.subheadline,
      slogan: formData.slogan,
      promotedBy: formData.promotedBy,
    });

    // Create poster record in generating status with AI moderation result
    const poster = new Poster({
      userId: new mongoose.Types.ObjectId(userId),
      templateId: new mongoose.Types.ObjectId(templateId),
      formData,
      uploadedPhotoUrls: uploadedPhotoUrls || [],
      status: 'generating',
      retryCount: 0,
      moderationStatus: moderationResult.moderationStatus,
      moderationNotes: moderationResult.moderationNotes,
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
      if (!poster.formData.customColorAccent && aiSuggestions.colorAccentSuggestion) {
        poster.formData.customColorAccent = aiSuggestions.colorAccentSuggestion;
      }
      if (!poster.formData.customBanglaFont && aiSuggestions.fontSuggestion) {
        poster.formData.customBanglaFont = aiSuggestions.fontSuggestion;
      }
      if (aiSuggestions.layoutSuggestion?.badgeText && !(poster.formData as any).badgeText) {
        (poster.formData as any).badgeText = aiSuggestions.layoutSuggestion.badgeText;
      }
      poster.markModified('formData');

      // Render print-ready poster
      const imageUrl = await renderPosterImage(poster, template);
      poster.generatedImageUrl = imageUrl;
      poster.status = 'completed';
      await poster.save();

      res.status(201).json({
        success: true,
        message: 'Poster created and generated successfully',
        moderationWarning: poster.moderationStatus === 'flagged' ? poster.moderationNotes : undefined,
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
    const targetUserId = req.params.userId || req.user?.id;

    if (!targetUserId) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    // Safety check: only let users view their own unless admin
    if (req.user?.id !== targetUserId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const posters = await Poster.find({ userId: targetUserId }).populate('templateId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posters.length, posters });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updatePoster(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { formData, generatedImageUrl, pdfUrl, status } = req.body;

    const poster = await Poster.findById(id);
    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found' });
      return;
    }

    if (poster.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    if (formData) {
      poster.formData = { ...poster.formData, ...formData };
      poster.markModified('formData');
    }
    if (generatedImageUrl) poster.generatedImageUrl = generatedImageUrl;
    if (pdfUrl) poster.pdfUrl = pdfUrl;
    if (status) poster.status = status;

    await poster.save();

    res.status(200).json({
      success: true,
      message: 'Poster updated successfully',
      poster,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function exportPoster(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { format, exportUrl } = req.body; // 'png' | 'pdf'

    const poster = await Poster.findById(id);
    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found' });
      return;
    }

    if (poster.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    if (exportUrl) {
      if (format === 'pdf') {
        poster.pdfUrl = exportUrl;
      } else {
        poster.generatedImageUrl = exportUrl;
      }
      await poster.save();
    }

    res.status(200).json({
      success: true,
      message: `${format ? format.toUpperCase() : 'Poster'} export metadata updated`,
      exportUrl: format === 'pdf' ? (poster.pdfUrl || poster.generatedImageUrl) : poster.generatedImageUrl,
      isPaid: poster.isPaid,
      poster,
    });
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
      
      // Re-run moderation on updated text
      const modResult = await moderatePosterWithAI({
        name: poster.formData.name,
        designation: poster.formData.designation,
        party: poster.formData.party,
        district: poster.formData.district,
        headline: poster.formData.headline,
        subheadline: poster.formData.subheadline,
        slogan: poster.formData.slogan,
        promotedBy: poster.formData.promotedBy,
      });
      poster.moderationStatus = modResult.moderationStatus;
      poster.moderationNotes = modResult.moderationNotes;
    }

    poster.status = 'generating';
    poster.retryCount += 1;
    await poster.save();

    const { refreshText = true, refreshDesign = true } = req.body;

    // Run AI with regeneration mode & current retryCount iteration
    const aiSuggestions = await generateAIPosterAssistance(poster._id as any, {
      name: poster.formData.name,
      designation: poster.formData.designation,
      party: poster.formData.party,
      district: poster.formData.district,
      occasionType: poster.formData.occasionType || template.occasionType,
      headline: poster.formData.headline,
      subheadline: poster.formData.subheadline,
      slogan: poster.formData.slogan,
      retryCount: poster.retryCount,
      isRegenerate: true,
      refreshText,
      refreshDesign,
    });

    poster.aiSuggestions = aiSuggestions;

    // Apply new AI generated text if requested (or default on regeneration)
    if (refreshText !== false) {
      if (aiSuggestions.sloganSuggestion) {
        poster.formData.slogan = aiSuggestions.sloganSuggestion;
      }
      if (aiSuggestions.headlinePolish) {
        poster.formData.headline = aiSuggestions.headlinePolish;
      }
      if (aiSuggestions.subheadlineSuggestion) {
        poster.formData.subheadline = aiSuggestions.subheadlineSuggestion;
      }
    }

    // Apply new AI design styling (color, font, badge) if requested
    if (refreshDesign !== false) {
      if (aiSuggestions.colorAccentSuggestion) {
        poster.formData.customColorAccent = aiSuggestions.colorAccentSuggestion;
      }
      if (aiSuggestions.fontSuggestion) {
        poster.formData.customBanglaFont = aiSuggestions.fontSuggestion;
      }
      if (aiSuggestions.layoutSuggestion?.badgeText) {
        (poster.formData as any).badgeText = aiSuggestions.layoutSuggestion.badgeText;
      }
    }

    poster.markModified('formData');

    // Re-render poster with newly applied design and text
    const imageUrl = await renderPosterImage(poster, template);
    poster.generatedImageUrl = imageUrl;
    poster.status = 'completed';
    await poster.save();

    res.status(200).json({
      success: true,
      message: `পোস্টার সফলভাবে নতুন ডিজাইন ও টেক্সট সহ তৈরি হয়েছে (রিট্রাই: ${poster.retryCount}/৫)`,
      poster,
      themeName: aiSuggestions.designThemeName,
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

export async function unlockPosterPayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;

    const poster = await Poster.findById(id);
    if (!poster) {
      res.status(404).json({ success: false, message: 'Poster not found' });
      return;
    }

    if (poster.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    poster.isPaid = true;
    if (poster.formData) {
      poster.formData.isPaidTier = true;
      poster.markModified('formData');
    }
    await poster.save();

    res.status(200).json({
      success: true,
      message: `পেমেন্ট সফলভাবে সম্পন্ন হয়েছে (${paymentMethod || 'bKash'} TrxID: ${transactionId || 'MOCK_TXN_SUCCESS'})। প্রিমিয়াম ফিচার আনলক হয়েছে।`,
      poster,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function generateSlogan(req: any, res: Response): Promise<void> {
  try {
    const { occasionType, party, name, designation, district, currentSlogan } = req.body;

    const aiResult = await generateAIPosterAssistance(new mongoose.Types.ObjectId(), {
      name: name || 'নেতাকর্মী',
      designation: designation || 'জননেতা',
      party: party || 'বাংলাদেশ',
      district: district || 'বাংলাদেশ',
      occasionType: occasionType || 'victory_day',
      headline: '',
      slogan: currentSlogan,
      isRegenerate: true,
      retryCount: Math.floor(Math.random() * 50) + 1,
    });

    res.status(200).json({
      success: true,
      slogan: aiResult.sloganSuggestion,
      tone: aiResult.tone,
      colorAccent: aiResult.colorAccentSuggestion,
      themeName: aiResult.designThemeName,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
