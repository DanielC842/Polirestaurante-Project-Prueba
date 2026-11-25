import { Mesero } from "../models/mesero.model.js";
import { Usuario } from "../models/user.model.js";

const incluirUsuario = [
    { model: Usuario, attributes: ["nombre", "correo", "activo"] }
];

const dbNewWaiter = async (newWaiter) => {
    const { id_usuario, turno, fecha_ingreso } = newWaiter;
    return await Mesero.create({ id_usuario, turno, fecha_ingreso });
};

const dbGetWaiters = async () => {
    return await Mesero.findAll({ include: incluirUsuario });
};

const dbGetWaiterById = async (id) => {
    return await Mesero.findByPk(id, { include: incluirUsuario });
};

const dbUpdateWaiter = async (id, fields) => {
    const mesero = await Mesero.findByPk(id);
    if (!mesero) return null;
    await mesero.update(fields);
    return mesero;
};

const dbDeleteWaiter = async (id) => {
    const mesero = await Mesero.findByPk(id);
    if (!mesero) return null;
    await mesero.destroy();
    return mesero;
};

export {
    dbNewWaiter,
    dbGetWaiters,
    dbGetWaiterById,
    dbUpdateWaiter,
    dbDeleteWaiter
};