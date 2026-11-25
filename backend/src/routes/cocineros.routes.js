import { Router } from 'express'
import {
    newCook,
    getCooks,
    getCookById,
    updateCook,
    deleteCook
} from '../controllers/cocineros.controller.js';

const router = Router();

router.post("/", newCook);
router.get("/", getCooks);
router.get("/:id", getCookById);
router.put("/:id", updateCook);
router.delete("/:id", deleteCook);

export default router;