import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";
import { Usuario } from "./user.model.js";

export const Mesero = sequelize.define(
  "Mesero",
  {
    id_mesero: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // un usuario no puede ser mesero dos veces
    },
    turno: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY, // fecha sin hora: "2026-11-22"
      allowNull: false,
    },
  },
  {
    tableName: "meseros",
    timestamps: false,
  }
);

// Relación: crea la FK id_usuario → usuarios.id_usuario
Usuario.hasOne(Mesero, { foreignKey: "id_usuario" });
Mesero.belongsTo(Usuario, { foreignKey: "id_usuario" });