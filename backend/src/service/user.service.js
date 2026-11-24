import { Usuario } from "../models/user.model.js";

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

export {
    dbNewUser,
    dbGetUsers,
    dbGetUserById,
    dbUpdateUser,
    dbDeactivateUser
};