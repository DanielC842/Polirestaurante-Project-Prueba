import { Router } from 'express';
import {
    newWaiter,
    getWaiters,
    getWaiterById,
    updateWaiter,
    deleteWaiter
} from '../controllers/meseros.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);
router.use(requireRole('ADMINISTRADOR'));

router.post("/", newWaiter);
router.get("/", getWaiters);
router.get("/:id", getWaiterById);
router.put("/:id", updateWaiter);
router.delete("/:id", deleteWaiter);

export default router;