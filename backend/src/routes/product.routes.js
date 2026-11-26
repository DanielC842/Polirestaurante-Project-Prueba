import { Router } from 'express';
import { newProduct, getProducts, updateProduct, setProductActive } from '../controllers/product.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);

router.post("/", requireRole("ADMINISTRADOR"), newProduct);
router.get("/", getProducts);
router.put("/:id", requireRole("ADMINISTRADOR"), updateProduct);
router.patch("/:id/active", requireRole("ADMINISTRADOR"), setProductActive);

export default router;