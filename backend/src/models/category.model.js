import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";

export const Categoria = sequelize.define(
  "Categoria",
  {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "categorias",
    timestamps: false,
  }
);