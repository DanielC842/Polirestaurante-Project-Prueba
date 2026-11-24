import { Router } from 'express'
import {
    newUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser
} from '../controllers/user.controller.js';

const router = Router();

router.post("/", newUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deactivateUser);

export default router;