import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";

export const Producto = sequelize.define(
  "Producto",
  {
    id_producto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      references: {
        model: "categorias",
        key: "id_categoria",
      },
    },
  },
  {
    tableName: "productos",
    timestamps: false,
  }
);