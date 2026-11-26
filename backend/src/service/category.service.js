import { fn, col, where } from "sequelize";
import { Categoria } from "../models/category.model.js";

// Busca una categoría por nombre sin distinguir mayúsculas ni espacios de los extremos
const dbFindCategoryByName = async (nombre) => {
  return await Categoria.findOne({
    where: where(fn("lower", fn("trim", col("nombre"))), nombre.trim().toLowerCase()),
  });
};

const dbNewCategory = async (newcategoria) => {
  const {nombre, descripcion} = newcategoria;
      const payLoad = {
          nombre,
          descripcion,
      };
      return await Categoria.create(payLoad);
};

const dbGetCategories = async () => {
  // Esto devuelve todas las categorías que encuentra es como un "SELECT*FROM"
  return await Categoria.findAll();
};

export {
  dbFindCategoryByName,
  dbNewCategory,
  dbGetCategories
}