import { dbNewCategory, dbGetCategories, dbFindCategoryByName } from "../service/category.service.js";
import { isRequiredText, isOptionalText } from "../helpers/validation.helper.js";

const newCategory = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre) {
            return res.status(400).json({ mensaje: "El nombre es obligatorio" });
        }

        if (!isRequiredText(nombre, 80)) {
            return res.status(400).json({ mensaje: "El nombre debe ser texto de máximo 80 caracteres" });
        }

        if (!isOptionalText(descripcion, 2000)) {
            return res.status(400).json({ mensaje: "La descripción debe ser texto de máximo 2000 caracteres" });
        }

        if (await dbFindCategoryByName(nombre)) {
            return res.status(409).json({ mensaje: "Ya existe una categoría con ese nombre" });
        }

        const data = await dbNewCategory({ nombre: nombre.trim(), descripcion });

        res.status(201).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al crear la categoría" });
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