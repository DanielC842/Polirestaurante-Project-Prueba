import jwt from 'jsonwebtoken';
import { isTokenRevoked } from '../service/auth.service.js';

// Verifica el JWT enviado en la cabecera Authorization: Bearer <token> (ADR-003)
const verifyToken = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ mensaje: 'Debe iniciar sesión' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (isTokenRevoked(payload.jti)) {
            return res.status(401).json({ mensaje: 'La sesión fue cerrada, inicie sesión de nuevo' });
        }
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }
};

// Permite el paso solo a los roles indicados (RNF-04)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para realizar esta acción' });
    }
    next();
};

export { verifyToken, requireRole };
