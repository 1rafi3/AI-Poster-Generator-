import { Router } from 'express';
import {
  createPoster,
  getPosterById,
  getUserPosters,
  updatePoster,
  exportPoster,
  regeneratePoster,
  deletePoster,
  unlockPosterPayment,
  generateSlogan,
} from '../controllers/posterController';
import { authenticate } from '../middleware/auth';
import { posterGenerationLimiter } from '../middleware/rateLimiter';

const router = Router();

// AI Slogan generator helper endpoint
router.post('/generate-slogan', generateSlogan);

// Core poster generation and listing
router.post('/', authenticate, posterGenerationLimiter, createPoster);
router.get('/', authenticate, getUserPosters);
router.get('/user/:userId', authenticate, getUserPosters);
router.get('/:id', authenticate, getPosterById);

// Editing & tweaking
router.put('/:id', authenticate, updatePoster);
router.post('/:id/regenerate', authenticate, posterGenerationLimiter, regeneratePoster);
router.post('/:id/export', authenticate, exportPoster);
router.patch('/:id/unlock-paid', authenticate, unlockPosterPayment);
router.delete('/:id', authenticate, deletePoster);

export default router;
