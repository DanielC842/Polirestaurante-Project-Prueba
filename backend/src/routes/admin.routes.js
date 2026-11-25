import { Router } from 'express'
import {
    newAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
} from '../controllers/admin.controller.js';

const router = Router();

router.post("/", newAdmin);
router.get("/", getAdmins);
router.get("/:id", getAdminById);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;