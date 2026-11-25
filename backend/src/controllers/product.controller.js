import {
  dbNewProduct,
  dbGetProducts,
  dbUpdateProduct,
  dbSetProductActive,
} from "../service/product.service.js";

const newProduct = async (req, res) => {
    try {
        const { nombre, descripcion, precio, id_categoria } = req.body;

        if (!nombre || precio === undefined) {
            return res.status(400).json({ mensaje: "nombre y precio son obligatorios" });
        }

        if (isNaN(precio) || Number(precio) < 0) {
            return res.status(400).json({ mensaje: "El precio debe ser un número mayor o igual a 0" });
        }

        const data = await dbNewProduct({ nombre, descripcion, precio, id_categoria });

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
        const { precio } = req.body;

        if (precio !== undefined && (isNaN(precio) || Number(precio) < 0)) {
            return res.status(400).json({ mensaje: "El precio debe ser un número mayor o igual a 0" });
        }

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