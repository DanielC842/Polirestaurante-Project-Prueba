import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";
import { Usuario } from "./user.model.js";

export const Cocinero = sequelize.define(
  "Cocinero",
  {
    id_cocinero: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    turno: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    estacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "cocineros",
    timestamps: false,
  }
);

Usuario.hasOne(Cocinero, { foreignKey: "id_usuario" });
Cocinero.belongsTo(Usuario, { foreignKey: "id_usuario" });