import { Usuario } from "../models/user.model.js";


const dbNewUser = async (newUser) => {
    const {nombre, correo, contrasena} = newUser;
    const payLoad = {
        nombre,
        correo,
        contrasena_hash:contrasena
    };
    return await Usuario.create(payLoad);
};

export {
    dbNewUser
}