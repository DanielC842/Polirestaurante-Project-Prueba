import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/user.model.js';
import { Administrador } from '../models/admin.model.js';
import { Cocinero } from '../models/cocineros.model.js';
import { Mesero } from '../models/mesero.model.js';
import { encryptedPassword, validatePassword } from '../helpers/bcrypt.helper.js';
import { normalizeEmail } from '../helpers/validation.helper.js';

// Lista de tokens revocados al cerrar sesión (ADR-003). Vive en memoria:
// se vacía al reiniciar el servidor, lo cual es aceptable porque los tokens duran poco.
const revokedTokens = new Map();

const isTokenRevoked = (jti) => {
    const now = Date.now() / 1000;
    for (const [id, exp] of revokedTokens) if (exp < now) revokedTokens.delete(id);
    return revokedTokens.has(jti);
};

const revokeToken = (jti, exp) => revokedTokens.set(jti, exp);

// Devuelve el rol del usuario y el id de su perfil (mesero, cocinero o administrador)
const dbGetUserRole = async (id_usuario) => {
    const admin = await Administrador.findOne({ where: { id_usuario } });
    if (admin) return { rol: 'ADMINISTRADOR', id_perfil: admin.id_administrador };
    const cocinero = await Cocinero.findOne({ where: { id_usuario } });
    if (cocinero) return { rol: 'COCINERO', id_perfil: cocinero.id_cocinero };
    const mesero = await Mesero.findOne({ where: { id_usuario } });
    if (mesero) return { rol: 'MESERO', id_perfil: mesero.id_mesero };
    return null;
};

const dbLogin = async (correo, contrasena) => {
    const user = await Usuario.findOne({ where: { correo: normalizeEmail(correo) } });
    if (!user || !user.activo || !validatePassword(contrasena, user.contrasena_hash)) {
        throw new Error('CREDENCIALES_INVALIDAS');
    }

    const perfil = await dbGetUserRole(user.id_usuario);
    if (!perfil) throw new Error('USUARIO_SIN_ROL');

    const payload = {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        rol: perfil.rol,
        id_perfil: perfil.id_perfil,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30m',
        jwtid: randomUUID(),
    });

    return { token, usuario: payload };
};

// Crea el primer administrador si no hay ninguno y están definidas las variables
// ADMIN_CORREO y ADMIN_CONTRASENA. Sin esto nadie podría entrar, porque crear
// usuarios exige ser administrador.
const dbSeedFirstAdmin = async () => {
    const { ADMIN_CORREO, ADMIN_CONTRASENA, ADMIN_NOMBRE } = process.env;
    if (!ADMIN_CORREO || !ADMIN_CONTRASENA) return;
    if (await Administrador.count() > 0) return;

    const [user] = await Usuario.findOrCreate({
        where: { correo: normalizeEmail(ADMIN_CORREO) },
        defaults: {
            nombre: ADMIN_NOMBRE || 'Administrador',
            contrasena_hash: encryptedPassword(ADMIN_CONTRASENA),
        },
    });
    await Administrador.create({
        id_usuario: user.id_usuario,
        cargo: 'Administrador general',
        fecha_ingreso: new Date(),
    });
    console.log(`Administrador inicial creado: ${ADMIN_CORREO}`);
};

// Migración segura al arrancar: deja en minúsculas los correos guardados con mayúsculas.
// Si dos correos solo se diferencian en mayúsculas, no se toca ninguno y se avisa en consola.
const dbNormalizeStoredEmails = async () => {
    const usuarios = await Usuario.findAll({ attributes: ['id_usuario', 'correo'] });
    const porCorreo = new Map();
    for (const u of usuarios) {
        const key = normalizeEmail(u.correo);
        porCorreo.set(key, [...(porCorreo.get(key) || []), u]);
    }
    for (const [correo, grupo] of porCorreo) {
        if (grupo.length > 1) {
            console.warn(`Correos duplicados sin distinguir mayúsculas, revíselos a mano: ${grupo.map((u) => u.correo).join(', ')}`);
            continue;
        }
        if (grupo[0].correo !== correo) {
            await grupo[0].update({ correo });
            console.log(`Correo normalizado a minúsculas: ${correo}`);
        }
    }
};

export { dbLogin, dbNormalizeStoredEmails, dbGetUserRole, dbSeedFirstAdmin, isTokenRevoked, revokeToken };
