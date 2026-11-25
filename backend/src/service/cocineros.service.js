import { Cocinero } from "../models/cocineros.model.js";
import { Usuario } from "../models/user.model.js";

const incluirUsuario = [
    { model: Usuario, attributes: ["nombre", "correo", "activo"] }
];

const dbNewCook = async (newCook) => {
    const { id_usuario, turno, estacion, fecha_ingreso } = newCook;
    return await Cocinero.create({ id_usuario, turno, estacion, fecha_ingreso });
};

const dbGetCooks = async () => {
    return await Cocinero.findAll({ include: incluirUsuario });
};

const dbGetCookById = async (id) => {
    return await Cocinero.findByPk(id, { include: incluirUsuario });
};

const dbUpdateCook = async (id, fields) => {
    const cocinero = await Cocinero.findByPk(id);
    if (!cocinero) return null;
    await cocinero.update(fields);
    return cocinero;
};

const dbDeleteCook = async (id) => {
    const cocinero = await Cocinero.findByPk(id);
    if (!cocinero) return null;
    await cocinero.destroy();
    return cocinero;
};

export {
    dbNewCook,
    dbGetCooks,
    dbGetCookById,
    dbUpdateCook,
    dbDeleteCook
};