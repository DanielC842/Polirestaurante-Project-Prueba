import { dbGetStatuses, dbNewTransition, dbGetTransitions } from "../service/status.service.js";

const getStatuses = async (req, res) => {
    try {
        const data = await dbGetStatuses();
        res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los estados" });
    }
}

const newTransition = async (req, res) => {
    try {
        const { id_estado_origen, id_estado_destino, id_rol } = req.body;

        if (!id_estado_origen || !id_estado_destino || !id_rol) {
            return res.status(400).json({ mensaje: "id_estado_origen, id_estado_destino e id_rol son obligatorios" });
        }

        const data = await dbNewTransition({ id_estado_origen, id_estado_destino, id_rol });

        res.status(201).json({ data });

    } catch (error) {
        console.error(error);
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({ mensaje: "El estado o el rol no existe" });
        }
        res.status(500).json({ mensaje: "Error al crear la transición" });
    }
}

const getTransitions = async (req, res) => {
    try {
        const data = await dbGetTransitions();
        res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener las transiciones" });
    }
}

export {
    getStatuses,
    newTransition,
    getTransitions
}