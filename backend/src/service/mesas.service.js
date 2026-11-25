import { Mesa } from "../models/mesas.model.js";

const dbNewTable = async (newTable) => {
    const { numero, capacidad, estado } = newTable;
    return await Mesa.create({ numero, capacidad, estado });
};

const dbGetTables = async () => {
    return await Mesa.findAll({ order: [["numero", "ASC"]] });
};

const dbGetTableById = async (id) => {
    return await Mesa.findByPk(id);
};

const dbUpdateTable = async (id, fields) => {
    const mesa = await Mesa.findByPk(id);
    if (!mesa) return null;
    await mesa.update(fields);
    return mesa;
};

const dbDeleteTable = async (id) => {
    const mesa = await Mesa.findByPk(id);
    if (!mesa) return null;
    await mesa.destroy();
    return mesa;
};

export {
    dbNewTable,
    dbGetTables,
    dbGetTableById,
    dbUpdateTable,
    dbDeleteTable
};