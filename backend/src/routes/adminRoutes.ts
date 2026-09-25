import { Router } from 'express';
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAdminPosters,
  moderatePoster,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Require both authentication and admin role
router.use(authenticate, requireAdmin);

router.post('/templates', createTemplate);
router.patch('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);
router.get('/posters', getAdminPosters);
router.patch('/posters/:id/moderate', moderatePoster);

export default router;
