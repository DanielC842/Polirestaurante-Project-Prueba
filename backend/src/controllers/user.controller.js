import { encryptedPassword } from "../helpers/bcrypt.helper.js";
import { dbNewUser } from "../service/user.service.js";

const newUser = async (req, res) => {
    try {
        const {nombre, correo, contrasena } = req.body;

        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ mensaje: "nombre, correo y contrasena son obligatorios" });
        }

        const password_hased = encryptedPassword(contrasena);

        const payLoad = {
            nombre: nombre,
            correo: correo,
            contrasena: password_hased
        };

        const data = await dbNewUser(payLoad);

        if(!data) {
            return res.status(400).json({mensaje: "No se puede crear el nuevo usuario"})
        }

        res.status(200).json({data});

        console.log(data);

    } catch (error) {
        console.error(error);
    }
}

export {
    newUser
}