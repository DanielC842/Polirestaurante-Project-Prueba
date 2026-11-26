import { dbLogin, revokeToken } from '../service/auth.service.js';

const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ mensaje: 'Ingrese el correo y la contraseña' });
        }

        const data = await dbLogin(correo, contrasena);
        res.status(200).json({ data });
    } catch (error) {
        if (error.message === 'CREDENCIALES_INVALIDAS') {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }
        if (error.message === 'USUARIO_SIN_ROL') {
            return res.status(403).json({ mensaje: 'El usuario no tiene un rol asignado' });
        }
        console.error(error);
        res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
};

const me = (req, res) => {
    const { id_usuario, nombre, rol, id_perfil } = req.user;
    res.status(200).json({ data: { id_usuario, nombre, rol, id_perfil } });
};

const logout = (req, res) => {
    revokeToken(req.user.jti, req.user.exp);
    res.status(200).json({ mensaje: 'Sesión cerrada' });
};

export { login, me, logout };
