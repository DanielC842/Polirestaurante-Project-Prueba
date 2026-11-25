import { Router } from 'express'
import { getStatuses, newTransition, getTransitions } from '../controllers/status.controller.js';

const router = Router();

router.get("/", getStatuses);
router.post("/transitions", newTransition);
router.get("/transitions", getTransitions);

export default router;