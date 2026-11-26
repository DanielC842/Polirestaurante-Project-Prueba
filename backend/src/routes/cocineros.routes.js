import { Router } from 'express';
import {
    newCook,
    getCooks,
    getCookById,
    updateCook,
    deleteCook
} from '../controllers/cocineros.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);
router.use(requireRole('ADMINISTRADOR'));

router.post("/", newCook);
router.get("/", getCooks);
router.get("/:id", getCookById);
router.put("/:id", updateCook);
router.delete("/:id", deleteCook);

export default router;