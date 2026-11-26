import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";
import { EstadoPedido } from "./status.model.js";

export const Pedido = sequelize.define(
  "Pedido",
  {
    id_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_mesero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "meseros",
        key: "id_mesero",
      },
    },
    id_mesa: {
      type: DataTypes.INTEGER,
      references: {
        model: "mesas",
        key: "id_mesa",
      },
    },
    id_estado_actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "estados_pedido",
        key: "id_estado",
      },
    },
    tipo_servicio: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: { isIn: [["mesa", "llevar"]] },
    },
    nombre_cliente: {
      type: DataTypes.STRING(120),
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
    fecha_preparacion: {
      type: DataTypes.DATE,
    },
    fecha_listo: {
      type: DataTypes.DATE,
    },
    fecha_entrega: {
      type: DataTypes.DATE,
    },
    fecha_cancelacion: {
      type: DataTypes.DATE,
    },
    motivo_cancelacion: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "pedidos",
    timestamps: true,
    createdAt: "fecha_creacion",
    updatedAt: "fecha_actualizacion",
  }
);

Pedido.belongsTo(EstadoPedido, { foreignKey: "id_estado_actual" });