import { Router } from 'express'
import {
    newWaiter,
    getWaiters,
    getWaiterById,
    updateWaiter,
    deleteWaiter
} from '../controllers/meseros.controller.js';

const router = Router();

router.post("/", newWaiter);
router.get("/", getWaiters);
router.get("/:id", getWaiterById);
router.put("/:id", updateWaiter);
router.delete("/:id", deleteWaiter);

export default router;