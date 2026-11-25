import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";

export const Mesa = sequelize.define(
  "Mesa",
  {
    id_mesa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
  },
  {
    tableName: "mesas",
    timestamps: false,
  }
);