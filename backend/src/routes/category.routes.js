import { Router } from 'express'
import { newCategory, getCategories } from '../controllers/category.controller.js';

const router = Router();

router.post("/", newCategory);
router.get("/", getCategories);

export default router;