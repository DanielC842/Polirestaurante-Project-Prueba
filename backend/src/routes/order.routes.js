import { Router } from 'express';
import { newOrder, getOrders, getOrderById, changeOrderStatus, cancelOrder } from '../controllers/order.controller.js';

import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { validateIdParam } from '../middlewares/validateId.middleware.js';

const router = Router();

router.param('id', validateIdParam);
router.use(verifyToken);

router.post("/", requireRole("MESERO", "ADMINISTRADOR"), newOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", changeOrderStatus);
router.patch("/:id/cancel", requireRole("MESERO", "ADMINISTRADOR"), cancelOrder);

export default router;