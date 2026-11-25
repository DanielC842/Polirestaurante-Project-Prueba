import { Categoria } from "../models/category.model.js";

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
  dbNewCategory,
  dbGetCategories
}