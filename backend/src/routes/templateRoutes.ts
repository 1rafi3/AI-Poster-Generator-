import { Router } from 'express';
import { getTemplates, getTemplateById } from '../controllers/templateController';
import { createTemplate, updateTemplate, deleteTemplate } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getTemplates);
router.get('/:id', getTemplateById);

// Admin-only template management endpoints (as specified in requirement)
router.post('/', authenticate, requireAdmin, createTemplate);
router.put('/:id', authenticate, requireAdmin, updateTemplate);
router.delete('/:id', authenticate, requireAdmin, deleteTemplate);

export default router;
