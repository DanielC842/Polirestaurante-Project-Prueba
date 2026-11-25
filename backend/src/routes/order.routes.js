import { Router } from 'express'
import { newOrder, getOrders, getOrderById, changeOrderStatus, cancelOrder } from '../controllers/order.controller.js';

const router = Router();

router.post("/", newOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", changeOrderStatus);
router.patch("/:id/cancel", cancelOrder);

export default router;