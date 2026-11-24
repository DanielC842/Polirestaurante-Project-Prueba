import { encryptedPassword } from "../helpers/bcrypt.helper.js";
import {
    dbNewUser,
    dbGetUsers,
    dbGetUserById,
    dbUpdateUser,
    dbDeactivateUser
} from "../service/user.service.js";

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

        const password_hased = encryptedPassword(contrasena);

        const payLoad = {
            nombre: nombre,
            correo: correo,
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

        // Solo se actualiza lo que venga en el body
        const fields = {};
        if (nombre !== undefined) fields.nombre = nombre;
        if (correo !== undefined) fields.correo = correo;
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
        const data = await dbDeactivateUser(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }

        res.status(200).json({ mensaje: "Usuario desactivado", data });
    } catch (error) {
        handleError(res, error, "Error al desactivar el usuario");
    }
};

export {
    newUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser
};