import { dbNewCategory, dbGetCategories } from "../service/category.service.js";

const newCategory = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ mensaje: "El nombre es obligatorio" });
        }

        const data = await dbNewCategory({ nombre, descripcion });

        res.status(201).json({ data });
    } catch (error) {
        console.error(error);
    }
}

const getCategories = async (req, res) => {
    try {
        const data = await dbGetCategories();
        res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener las categorías" });
    }
}

export {
    newCategory,
    getCategories
}