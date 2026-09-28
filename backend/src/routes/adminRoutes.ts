import { Router } from 'express';
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAdminPosters,
  getAdminStats,
  moderatePoster,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Require both authentication and admin role
router.use(authenticate, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/posters', getAdminPosters);
router.patch('/posters/:id/moderate', moderatePoster);
router.patch('/posters/:id/flag', moderatePoster);

router.post('/templates', createTemplate);
router.patch('/templates/:id', updateTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

export default router;
