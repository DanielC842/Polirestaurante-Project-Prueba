import {
    dbNewWaiter,
    dbGetWaiters,
    dbGetWaiterById,
    dbUpdateWaiter,
    dbDeleteWaiter
} from "../service/meseros.service.js";

const handleError = (res, error, mensaje, fkMensaje) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ mensaje: "Ese usuario ya está registrado como mesero" });
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

const newWaiter = async (req, res) => {
    try {
        const { id_usuario, turno, fecha_ingreso } = req.body;

        if (!id_usuario || !turno || !fecha_ingreso) {
            return res.status(400).json({ mensaje: "id_usuario, turno y fecha_ingreso son obligatorios" });
        }

        const data = await dbNewWaiter({ id_usuario, turno, fecha_ingreso });
        res.status(201).json({ data });
    } catch (error) {
        handleError(res, error, "Error al crear el mesero", "El usuario no existe");
    }
};

const getWaiters = async (req, res) => {
    try {
        const data = await dbGetWaiters();
        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al listar los meseros");
    }
};

const getWaiterById = async (req, res) => {
    try {
        const data = await dbGetWaiterById(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Mesero no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al obtener el mesero");
    }
};

const updateWaiter = async (req, res) => {
    try {
        const { turno, fecha_ingreso } = req.body;

        // Solo se actualiza lo que venga en el body (id_usuario no se cambia)
        const fields = {};
        if (turno !== undefined) fields.turno = turno;
        if (fecha_ingreso !== undefined) fields.fecha_ingreso = fecha_ingreso;

        const data = await dbUpdateWaiter(req.params.id, fields);

        if (!data) {
            return res.status(404).json({ mensaje: "Mesero no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al actualizar el mesero");
    }
};

const deleteWaiter = async (req, res) => {
    try {
        const data = await dbDeleteWaiter(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Mesero no encontrado" });
        }

        res.status(200).json({ mensaje: "Mesero eliminado" });
    } catch (error) {
        handleError(res, error, "Error al eliminar el mesero", "El mesero tiene pedidos asociados y no se puede eliminar");
    }
};

export {
    newWaiter,
    getWaiters,
    getWaiterById,
    updateWaiter,
    deleteWaiter
};