import {
    dbNewTable,
    dbGetTables,
    dbGetTableById,
    dbUpdateTable,
    dbDeleteTable
} from "../service/mesas.service.js";
import { isPositiveInt, ESTADOS_MESA, normalizeTableStatus } from "../helpers/validation.helper.js";

// Valida los campos de mesa que vengan. Devuelve un mensaje de error o null.
const validateTableFields = ({ numero, capacidad, estado }) => {
    if (numero !== undefined && !isPositiveInt(numero)) return "El número de mesa debe ser un entero positivo";
    if (capacidad !== undefined && !isPositiveInt(capacidad)) return "La capacidad debe ser un entero mayor a 0";
    if (estado !== undefined && !ESTADOS_MESA.includes(normalizeTableStatus(estado))) {
        return `El estado debe ser uno de: ${ESTADOS_MESA.join(", ")}`;
    }
    return null;
};

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

        if (numero === undefined || capacidad === undefined || !estado) {
            return res.status(400).json({ mensaje: "numero, capacidad y estado son obligatorios" });
        }

        const problema = validateTableFields({ numero, capacidad, estado });
        if (problema) return res.status(400).json({ mensaje: problema });

        const data = await dbNewTable({ numero: Number(numero), capacidad: Number(capacidad), estado: normalizeTableStatus(estado) });
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

        const problema = validateTableFields({ numero, capacidad, estado });
        if (problema) return res.status(400).json({ mensaje: problema });

        // Solo se actualiza lo que venga en el body
        const fields = {};
        if (numero !== undefined) fields.numero = Number(numero);
        if (capacidad !== undefined) fields.capacidad = Number(capacidad);
        if (estado !== undefined) fields.estado = normalizeTableStatus(estado);

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