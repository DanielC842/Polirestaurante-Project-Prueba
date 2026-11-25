import { DataTypes } from "sequelize";
import { sequelize } from "../config/connectionPostgreSQL.js";
import { Pedido } from "./order.model.js";
import { Producto } from "./product.model.js";

export const DetallePedido = sequelize.define(
  "DetallePedido",
  {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "pedidos",
        key: "id_pedido",
      },
    },
    id_producto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "productos",
        key: "id_producto",
      },
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "detalle_pedido",
    timestamps: false,
  }
);

Pedido.hasMany(DetallePedido, { foreignKey: "id_pedido" });
DetallePedido.belongsTo(Pedido, { foreignKey: "id_pedido" });
DetallePedido.belongsTo(Producto, { foreignKey: "id_producto" });