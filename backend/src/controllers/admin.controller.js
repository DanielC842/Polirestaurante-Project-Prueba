import {
    dbNewAdmin,
    dbGetAdmins,
    dbGetAdminById,
    dbUpdateAdmin,
    dbDeleteAdmin
} from "../service/admin.service.js";
import { dbGetUserRole } from "../service/auth.service.js";
import { isPositiveInt } from "../helpers/validation.helper.js";

const handleError = (res, error, mensaje, fkMensaje) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ mensaje: "Ese usuario ya está registrado como administrador" });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({ mensaje: fkMensaje });
    }
    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ mensaje: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ mensaje });
};

const newAdmin = async (req, res) => {
    try {
        const { id_usuario, cargo, fecha_ingreso } = req.body;

        if (!id_usuario || !cargo || !fecha_ingreso) {
            return res.status(400).json({ mensaje: "id_usuario, cargo y fecha_ingreso son obligatorios" });
        }

        if (!isPositiveInt(id_usuario)) {
            return res.status(400).json({ mensaje: "id_usuario debe ser un número entero positivo" });
        }

        // Cada persona tiene un solo rol: mesero, cocinero o administrador
        const rolActual = await dbGetUserRole(id_usuario);
        if (rolActual) {
            return res.status(409).json({ mensaje: `Ese usuario ya tiene el rol ${rolActual.rol.toLowerCase()}` });
        }

        const data = await dbNewAdmin({ id_usuario, cargo, fecha_ingreso });
        res.status(201).json({ data });
    } catch (error) {
        handleError(res, error, "Error al crear el administrador", "El usuario no existe");
    }
};

const getAdmins = async (req, res) => {
    try {
        const data = await dbGetAdmins();
        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al listar los administradores");
    }
};

const getAdminById = async (req, res) => {
    try {
        const data = await dbGetAdminById(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Administrador no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al obtener el administrador");
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { cargo, fecha_ingreso } = req.body;

        const fields = {};
        if (cargo !== undefined) fields.cargo = cargo;
        if (fecha_ingreso !== undefined) fields.fecha_ingreso = fecha_ingreso;

        const data = await dbUpdateAdmin(req.params.id, fields);

        if (!data) {
            return res.status(404).json({ mensaje: "Administrador no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al actualizar el administrador");
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const data = await dbDeleteAdmin(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Administrador no encontrado" });
        }

        res.status(200).json({ mensaje: "Administrador eliminado" });
    } catch (error) {
        handleError(res, error, "Error al eliminar el administrador", "El administrador tiene registros asociados y no se puede eliminar");
    }
};

export {
    newAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin
};