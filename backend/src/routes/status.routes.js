import { Router } from 'express';
import { getStatuses, newTransition, getTransitions } from '../controllers/status.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);

router.get("/", getStatuses);
router.post("/transitions", requireRole("ADMINISTRADOR"), newTransition);
router.get("/transitions", getTransitions);

export default router;