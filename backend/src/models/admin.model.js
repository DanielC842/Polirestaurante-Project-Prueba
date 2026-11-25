import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";
import { Usuario } from "./user.model.js";

export const Administrador = sequelize.define(
  "Administrador",
  {
    id_administrador: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    cargo: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    fecha_ingreso: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "administradores",
    timestamps: false,
  }
);

Usuario.hasOne(Administrador, { foreignKey: "id_usuario" });
Administrador.belongsTo(Usuario, { foreignKey: "id_usuario" });