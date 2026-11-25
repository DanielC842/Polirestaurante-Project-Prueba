import { Router } from 'express'
import {
    newTable,
    getTables,
    getTableById,
    updateTable,
    deleteTable
} from '../controllers/mesas.controller.js';

const router = Router();

router.post("/", newTable);
router.get("/", getTables);
router.get("/:id", getTableById);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;