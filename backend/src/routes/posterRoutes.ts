import { Router } from 'express';
import {
  createPoster,
  getPosterById,
  getUserPosters,
  regeneratePoster,
  deletePoster,
} from '../controllers/posterController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createPoster);
router.get('/:id', authenticate, getPosterById);
router.get('/user/:userId', authenticate, getUserPosters);
router.post('/:id/regenerate', authenticate, regeneratePoster);
router.delete('/:id', authenticate, deletePoster);

export default router;
