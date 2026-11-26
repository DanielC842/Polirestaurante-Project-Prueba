import jwt from 'jsonwebtoken';
import { isTokenRevoked } from '../service/auth.service.js';
import { Usuario } from '../models/user.model.js';

// Verifica el JWT enviado en la cabecera Authorization: Bearer <token> (ADR-003)
const verifyToken = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ mensaje: 'Debe iniciar sesión' });
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ mensaje: 'Sesión inválida o expirada' });
    }
    if (isTokenRevoked(payload.jti)) {
        return res.status(401).json({ mensaje: 'La sesión fue cerrada, inicie sesión de nuevo' });
    }

    // Un empleado dado de baja o eliminado pierde el acceso de inmediato, aunque su token siga vigente
    try {
        const user = await Usuario.findByPk(payload.id_usuario, { attributes: ['activo'] });
        if (!user || !user.activo) {
            return res.status(401).json({ mensaje: 'Su cuenta fue dada de baja, contacte al administrador' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al verificar la sesión' });
    }

    req.user = payload;
    next();
};

// Permite el paso solo a los roles indicados (RNF-04)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para realizar esta acción' });
    }
    next();
};

export { verifyToken, requireRole };
