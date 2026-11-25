import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";

export const EstadoPedido = sequelize.define(
  "EstadoPedido",
  {
    id_estado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    orden_flujo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "estados_pedido",
    timestamps: false,
  }
);