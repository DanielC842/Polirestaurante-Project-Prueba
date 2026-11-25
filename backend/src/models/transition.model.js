import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";

export const TransicionEstado = sequelize.define(
  "TransicionEstado",
  {
    id_transicion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_estado_origen: {
      type: DataTypes.INTEGER,
      references: {
        model: "estados_pedido",
        key: "id_estado",
      },
    },
    id_estado_destino: {
      type: DataTypes.INTEGER,
      references: {
        model: "estados_pedido",
        key: "id_estado",
      },
    },
    id_rol: {
      type: DataTypes.INTEGER,
      references: {
        model: "roles",
        key: "id_rol",
      },
    },
  },
  {
    tableName: "transiciones_estado",
    timestamps: false,
  }
);