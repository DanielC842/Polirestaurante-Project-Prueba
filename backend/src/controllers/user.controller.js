import { encryptedPassword } from "../helpers/bcrypt.helper.js";
import { isRequiredText, isValidEmail, normalizeEmail, MIN_PASSWORD_LENGTH } from "../helpers/validation.helper.js";

// Valida nombre, correo y contraseña cuando vienen en el body. Devuelve un mensaje de error o null.
const validateUserFields = ({ nombre, correo, contrasena, activo }, creating) => {
    if ((creating || nombre !== undefined) && !isRequiredText(nombre, 100)) {
        return "El nombre es obligatorio y debe tener máximo 100 caracteres";
    }
    if ((creating || correo !== undefined) && !isValidEmail(correo)) {
        return "El correo no tiene un formato válido";
    }
    if ((creating || contrasena) && (typeof contrasena !== "string" || contrasena.length < MIN_PASSWORD_LENGTH)) {
        return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    }
    if (activo !== undefined && typeof activo !== "boolean") {
        return "activo debe ser true o false";
    }
    return null;
};
import {
    dbNewUser,
    dbGetUsers,
    dbGetUserById,
    dbUpdateUser,
    dbDeactivateUser,
    dbDeleteUserPermanent,
    dbIsActiveAdmin,
    dbCountActiveAdmins
} from "../service/user.service.js";

const esUnoMismo = (req) => Number(req.params.id) === req.user?.id_usuario;

const MENSAJE_ULTIMO_ADMIN = "No se puede dar de baja ni eliminar al último administrador activo. Registre o reactive otro administrador primero.";

// true si el usuario indicado es el único administrador activo que queda
const esUltimoAdmin = async (id) => {
    return (await dbIsActiveAdmin(id)) && (await dbCountActiveAdmins()) <= 1;
};

const handleError = (res, error, mensaje) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ mensaje: "Ese correo ya está registrado" });
    }
    console.error(error);
    res.status(500).json({ mensaje });
};

const newUser = async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ mensaje: "nombre, correo y contrasena son obligatorios" });
        }

        const problema = validateUserFields({ nombre, correo, contrasena }, true);
        if (problema) return res.status(400).json({ mensaje: problema });

        const password_hased = encryptedPassword(contrasena);

        const payLoad = {
            nombre: nombre.trim(),
            correo: normalizeEmail(correo),
            contrasena: password_hased
        };

        const data = await dbNewUser(payLoad);

        if (!data) {
            return res.status(400).json({ mensaje: "No se puede crear el nuevo usuario" });
        }

        res.status(201).json({ data });
    } catch (error) {
        handleError(res, error, "Error al crear el usuario");
    }
};

const getUsers = async (req, res) => {
    try {
        const data = await dbGetUsers();
        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al listar los usuarios");
    }
};

const getUserById = async (req, res) => {
    try {
        const data = await dbGetUserById(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al obtener el usuario");
    }
};

const updateUser = async (req, res) => {
    try {
        const { nombre, correo, contrasena, activo } = req.body;

        if (activo === false && esUnoMismo(req)) {
            return res.status(400).json({ mensaje: "No puede dar de baja su propia cuenta" });
        }
        if (activo === false && await esUltimoAdmin(req.params.id)) {
            return res.status(400).json({ mensaje: MENSAJE_ULTIMO_ADMIN });
        }

        const problema = validateUserFields({ nombre, correo, contrasena, activo }, false);
        if (problema) return res.status(400).json({ mensaje: problema });

        // Solo se actualiza lo que venga en el body
        const fields = {};
        if (nombre !== undefined) fields.nombre = nombre.trim();
        if (correo !== undefined) fields.correo = normalizeEmail(correo);
        if (activo !== undefined) fields.activo = activo;
        if (contrasena) fields.contrasena_hash = encryptedPassword(contrasena);

        const data = await dbUpdateUser(req.params.id, fields);

        if (!data) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al actualizar el usuario");
    }
};

const deactivateUser = async (req, res) => {
    try {
        if (esUnoMismo(req)) {
            return res.status(400).json({ mensaje: "No puede dar de baja su propia cuenta" });
        }
        if (await esUltimoAdmin(req.params.id)) {
            return res.status(400).json({ mensaje: MENSAJE_ULTIMO_ADMIN });
        }

        const data = await dbDeactivateUser(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ mensaje: "Usuario desactivado", data });
    } catch (error) {
        handleError(res, error, "Error al desactivar el usuario");
    }
};

const deleteUserPermanent = async (req, res) => {
    try {
        if (esUnoMismo(req)) {
            return res.status(400).json({ mensaje: "No puede eliminar su propia cuenta" });
        }
        if (await esUltimoAdmin(req.params.id)) {
            return res.status(400).json({ mensaje: MENSAJE_ULTIMO_ADMIN });
        }

        const data = await dbDeleteUserPermanent(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ mensaje: "Empleado eliminado" });
    } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                mensaje: 'Este empleado tiene pedidos registrados y borrarlo dañaría el historial. Use "Dar de baja" para que ya no pueda ingresar.'
            });
        }
        handleError(res, error, "Error al eliminar el usuario");
    }
};

export {
    newUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser,
    deleteUserPermanent
};