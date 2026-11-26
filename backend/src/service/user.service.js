import { sequelize } from "../config/connectionPostgreSQL.js";
import { Usuario } from "../models/user.model.js";
import { Mesero } from "../models/mesero.model.js";
import { Cocinero } from "../models/cocineros.model.js";
import { Administrador } from "../models/admin.model.js";

const withoutHash = (user) => {
    const { contrasena_hash, ...data } = user.toJSON();
    return data;
};

const dbNewUser = async (newUser) => {
    const { nombre, correo, contrasena } = newUser;
    const user = await Usuario.create({
        nombre,
        correo,
        contrasena_hash: contrasena
    });
    return withoutHash(user);
};

const dbGetUsers = async () => {
    return await Usuario.findAll({ attributes: { exclude: ["contrasena_hash"] } });
};

const dbGetUserById = async (id) => {
    return await Usuario.findByPk(id, { attributes: { exclude: ["contrasena_hash"] } });
};

const dbUpdateUser = async (id, fields) => {
    const user = await Usuario.findByPk(id);
    if (!user) return null;
    await user.update(fields);
    return withoutHash(user);
};

// Borrado lógico: solo desactiva, para no romper pedidos futuros
const dbDeactivateUser = async (id) => {
    const user = await Usuario.findByPk(id);
    if (!user) return null;
    await user.update({ activo: false });
    return withoutHash(user);
};

// Borrado definitivo: quita el perfil (mesero, cocinero o administrador) y el usuario.
// Si el empleado tiene pedidos, la base rechaza el borrado por la llave foránea.
const dbDeleteUserPermanent = async (id) => {
    const t = await sequelize.transaction();
    try {
        const user = await Usuario.findByPk(id, { transaction: t });
        if (!user) {
            await t.rollback();
            return null;
        }
        for (const model of [Mesero, Cocinero, Administrador]) {
            await model.destroy({ where: { id_usuario: id }, transaction: t });
        }
        await user.destroy({ transaction: t });
        await t.commit();
        return true;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

// true si el usuario es administrador y está activo
const dbIsActiveAdmin = async (id_usuario) => {
    const count = await Administrador.count({
        where: { id_usuario },
        include: [{ model: Usuario, where: { activo: true } }]
    });
    return count > 0;
};

const dbCountActiveAdmins = async () => {
    return await Administrador.count({ include: [{ model: Usuario, where: { activo: true } }] });
};

export {
    dbNewUser,
    dbGetUsers,
    dbGetUserById,
    dbUpdateUser,
    dbDeactivateUser,
    dbDeleteUserPermanent,
    dbIsActiveAdmin,
    dbCountActiveAdmins
};