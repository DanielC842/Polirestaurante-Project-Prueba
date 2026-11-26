import { Router } from 'express';
import { login, me, logout } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, me);
router.post('/logout', verifyToken, logout);

export default router;
