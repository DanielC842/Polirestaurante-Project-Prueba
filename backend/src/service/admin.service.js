import { Administrador } from "../models/admin.model.js";
import { Usuario } from "../models/user.model.js";

const incluirUsuario = [
    { model: Usuario, attributes: ["nombre", "correo", "activo"] }
];

const dbNewAdmin = async (newAdmin) => {
    const { id_usuario, cargo, fecha_ingreso } = newAdmin;
    return await Administrador.create({ id_usuario, cargo, fecha_ingreso });
};

const dbGetAdmins = async () => {
    return await Administrador.findAll({ include: incluirUsuario });
};

const dbGetAdminById = async (id) => {
    return await Administrador.findByPk(id, { include: incluirUsuario });
};

const dbUpdateAdmin = async (id, fields) => {
    const admin = await Administrador.findByPk(id);
    if (!admin) return null;
    await admin.update(fields);
    return admin;
};

const dbDeleteAdmin = async (id) => {
    const admin = await Administrador.findByPk(id);
    if (!admin) return null;
    await admin.destroy();
    return admin;
};

export {
    dbNewAdmin,
    dbGetAdmins,
    dbGetAdminById,
    dbUpdateAdmin,
    dbDeleteAdmin
};