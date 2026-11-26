import { Router } from 'express';
import {
    newTable,
    getTables,
    getTableById,
    updateTable,
    deleteTable
} from '../controllers/mesas.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);

router.post("/", requireRole("ADMINISTRADOR"), newTable);
router.get("/", getTables);
router.get("/:id", getTableById);
router.put("/:id", requireRole("ADMINISTRADOR"), updateTable);
router.delete("/:id", requireRole("ADMINISTRADOR"), deleteTable);

export default router;