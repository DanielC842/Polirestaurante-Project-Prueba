import {
  dbNewProduct,
  dbGetProducts,
  dbUpdateProduct,
  dbSetProductActive,
} from "../service/product.service.js";
import { isPositiveInt, isValidPrice, isRequiredText, isOptionalText } from "../helpers/validation.helper.js";

// Valida los campos de producto que vengan en el body. Devuelve un mensaje de error o null.
const validateProductFields = ({ nombre, descripcion, precio, id_categoria }, creating) => {
    if (creating || nombre !== undefined) {
        if (!isRequiredText(nombre, 120)) return "El nombre es obligatorio y debe tener máximo 120 caracteres";
    }
    if (creating || precio !== undefined) {
        if (!isValidPrice(precio)) return "El precio debe ser un número mayor o igual a 0";
    }
    if (!isOptionalText(descripcion, 2000)) return "La descripción debe ser texto de máximo 2000 caracteres";
    if (id_categoria !== undefined && id_categoria !== null && !isPositiveInt(id_categoria)) {
        return "id_categoria debe ser un número entero positivo";
    }
    return null;
};

const newProduct = async (req, res) => {
    try {
        const { nombre, descripcion, precio, id_categoria } = req.body;

        if (!nombre || precio === undefined) {
            return res.status(400).json({ mensaje: "nombre y precio son obligatorios" });
        }

        const problema = validateProductFields({ nombre, descripcion, precio, id_categoria }, true);
        if (problema) return res.status(400).json({ mensaje: problema });

        const data = await dbNewProduct({ nombre: nombre.trim(), descripcion, precio, id_categoria });

        res.status(201).json({ data });

    } catch (error) {
        console.error(error);
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({ mensaje: "La categoría no existe" });
        }
        res.status(500).json({ mensaje: "Error al crear el producto" });
    }
}

const getProducts = async (req, res) => {
    try {
        const data = await dbGetProducts(req.query);
        res.status(200).json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener los productos" });
    }
}

const updateProduct = async (req, res) => {
    try {
        const problema = validateProductFields(req.body, false);
        if (problema) return res.status(400).json({ mensaje: problema });

        const data = await dbUpdateProduct(req.params.id, req.body);

        if (!data) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        res.status(200).json({ data });

    } catch (error) {
        console.error(error);
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({ mensaje: "La categoría no existe" });
        }
        res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
}

const setProductActive = async (req, res) => {
    try {
        const { activo } = req.body;

        if (typeof activo !== "boolean") {
            return res.status(400).json({ mensaje: "activo debe ser true o false" });
        }

        const data = await dbSetProductActive(req.params.id, activo);

        if (!data) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }

        res.status(200).json({ data });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al cambiar el estado del producto" });
    }
}

export {
    newProduct,
    getProducts,
    updateProduct,
    setProductActive
}