import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { storageService } from '../services/storage';

const router = Router();

router.post('/', authenticate, upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No photo uploaded or invalid file format.' });
      return;
    }

    const uploadResult = await storageService.uploadPhoto(req.file);

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      storageType: uploadResult.storageType,
      filename: uploadResult.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
