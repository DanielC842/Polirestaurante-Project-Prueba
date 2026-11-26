import { Router } from 'express';
import {
    newUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser
} from '../controllers/user.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);
router.use(requireRole('ADMINISTRADOR'));

router.post("/", newUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deactivateUser);

export default router;