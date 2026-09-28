import { Router } from 'express';
import {
  createPoster,
  getPosterById,
  getUserPosters,
  regeneratePoster,
  deletePoster,
  unlockPosterPayment,
} from '../controllers/posterController';
import { authenticate } from '../middleware/auth';
import { posterGenerationLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', authenticate, posterGenerationLimiter, createPoster);
router.get('/:id', authenticate, getPosterById);
router.get('/user/:userId', authenticate, getUserPosters);
router.post('/:id/regenerate', authenticate, posterGenerationLimiter, regeneratePoster);
router.patch('/:id/unlock-paid', authenticate, unlockPosterPayment);
router.delete('/:id', authenticate, deletePoster);

export default router;
