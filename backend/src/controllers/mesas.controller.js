import {
    dbNewTable,
    dbGetTables,
    dbGetTableById,
    dbUpdateTable,
    dbDeleteTable
} from "../service/mesas.service.js";

const handleError = (res, error, mensaje) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({ mensaje: "Ya existe una mesa con ese número" });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({ mensaje: "La mesa tiene pedidos asociados y no se puede eliminar" });
    }
    if (error.name === "SequelizeValidationError") {
        return res.status(400).json({ mensaje: error.errors[0].message });
    }
    console.error(error);
    res.status(500).json({ mensaje });
};

const newTable = async (req, res) => {
    try {
        const { numero, capacidad, estado } = req.body;

        if (!numero || !capacidad || !estado) {
            return res.status(400).json({ mensaje: "numero, capacidad y estado son obligatorios" });
        }

        const data = await dbNewTable({ numero, capacidad, estado });
        res.status(201).json({ data });
    } catch (error) {
        handleError(res, error, "Error al crear la mesa");
    }
};

const getTables = async (req, res) => {
    try {
        const data = await dbGetTables();
        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al listar las mesas");
    }
};

const getTableById = async (req, res) => {
    try {
        const data = await dbGetTableById(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Mesa no encontrada" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al obtener la mesa");
    }
};

const updateTable = async (req, res) => {
    try {
        const { numero, capacidad, estado } = req.body;

        // Solo se actualiza lo que venga en el body
        const fields = {};
        if (numero !== undefined) fields.numero = numero;
        if (capacidad !== undefined) fields.capacidad = capacidad;
        if (estado !== undefined) fields.estado = estado;

        const data = await dbUpdateTable(req.params.id, fields);

        if (!data) {
            return res.status(404).json({ mensaje: "Mesa no encontrada" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(res, error, "Error al actualizar la mesa");
    }
};

const deleteTable = async (req, res) => {
    try {
        const data = await dbDeleteTable(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Mesa no encontrada" });
        }

        res.status(200).json({ mensaje: "Mesa eliminada" });
    } catch (error) {
        handleError(res, error, "Error al eliminar la mesa");
    }
};

export {
    newTable,
    getTables,
    getTableById,
    updateTable,
    deleteTable
};