import { Router } from 'express'
import { newProduct, getProducts, updateProduct, setProductActive } from '../controllers/product.controller.js';

const router = Router();

router.post("/", newProduct);
router.get("/", getProducts);
router.put("/:id", updateProduct);
router.patch("/:id/active", setProductActive);

export default router;