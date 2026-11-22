import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";

export const Usuario = sequelize.define(
  "Usuario",
  {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    contrasena_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // rol: {
    //   type: DataTypes.STRING(50),
    //   allowNull: false,
    //   validate: { isIn: [["mesero", "cocinero", "administrador"]] },
    // },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);