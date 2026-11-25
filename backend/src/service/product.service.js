import { Producto } from "../models/product.model.js";

const dbNewProduct = async (newProduct) => {
  const { nombre, descripcion, precio, id_categoria } = newProduct;
  const payLoad = {
    nombre,
    descripcion,
    precio,
    id_categoria,
  };
  return await Producto.create(payLoad);
};

const dbGetProducts = async (filters) => {
  const where = {};
  if (filters.id_categoria) where.id_categoria = filters.id_categoria;
  if (filters.activo !== undefined) where.activo = filters.activo === "true";
  return await Producto.findAll({ where });
};

const dbUpdateProduct = async (id, product) => {
  const producto = await Producto.findByPk(id);
  if (!producto) return null;
  const { nombre, descripcion, precio, id_categoria } = product;
  const changes = Object.fromEntries(
    Object.entries({ nombre, descripcion, precio, id_categoria }).filter(
      ([, value]) => value !== undefined
    )
  );
  return await producto.update(changes);
};

const dbSetProductActive = async (id, activo) => {
  const producto = await Producto.findByPk(id);
  if (!producto) return null;
  return await producto.update({ activo });
};

export {
  dbNewProduct,
  dbGetProducts,
  dbUpdateProduct,
  dbSetProductActive
}