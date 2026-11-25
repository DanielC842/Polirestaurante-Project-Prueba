import {
    dbNewCook,
    dbGetCooks,
    dbGetCookById,
    dbUpdateCook,
    dbDeleteCook
} from "../service/cocineros.service.js";

const handleError = (res, error, mensaje, fkMensaje) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ mensaje: "Ese usuario ya está registrado como cocinero" });
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

const newCook = async (req, res) => {
    try {
        const { id_usuario, turno, estacion, fecha_ingreso } = req.body;

        if (!id_usuario || !turno || !estacion || !fecha_ingreso) {
            return res.status(400).json({ mensaje: "id_usuario, turno, estacion y fecha_ingreso son obligatorios" });
        }

        const data = await dbNewCook({ id_usuario, turno, estacion, fecha_ingreso });
        res.status(201).json({ data });
    } catch (error) {
        handleError(res, error, "Error al crear el cocinero", "El usuario no existe");
    }
};

const getCooks = async (req, res) => {
    try {
        const data = await dbGetCooks();
        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al listar los cocineros");
    }
};

const getCookById = async (req, res) => {
    try {
        const data = await dbGetCookById(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Cocinero no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al obtener el cocinero");
    }
};

const updateCook = async (req, res) => {
    try {
        const { turno, estacion, fecha_ingreso } = req.body;

        const fields = {};
        if (turno !== undefined) fields.turno = turno;
        if (estacion !== undefined) fields.estacion = estacion;
        if (fecha_ingreso !== undefined) fields.fecha_ingreso = fecha_ingreso;

        const data = await dbUpdateCook(req.params.id, fields);

        if (!data) {
            return res.status(404).json({ mensaje: "Cocinero no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al actualizar el cocinero");
    }
};

const deleteCook = async (req, res) => {
    try {
        const data = await dbDeleteCook(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Cocinero no encontrado" });
        }

        res.status(200).json({ mensaje: "Cocinero eliminado" });
    } catch (error) {
        handleError(res, error, "Error al eliminar el cocinero", "El cocinero tiene registros asociados y no se puede eliminar");
    }
};

export {
    newCook,
    getCooks,
    getCookById,
    updateCook,
    deleteCook
};