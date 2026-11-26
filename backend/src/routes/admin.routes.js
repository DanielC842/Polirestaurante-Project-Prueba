import { Router } from 'express';
import {
    newAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
} from '../controllers/admin.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);
router.use(requireRole('ADMINISTRADOR'));

router.post("/", newAdmin);
router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;