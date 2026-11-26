import { Router } from 'express';
import { newCategory, getCategories } from '../controllers/category.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);

router.post("/", requireRole("ADMINISTRADOR"), newCategory);
router.get("/", getCategories);

export default router;