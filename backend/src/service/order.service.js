import { sequelize } from "../config/connectionPostgreSQL.js";
import { Pedido } from "../models/order.model.js";
import { DetallePedido } from "../models/orderDetail.model.js";
import { Producto } from "../models/product.model.js";
import { EstadoPedido } from "../models/status.model.js";
import { TransicionEstado } from "../models/transition.model.js";

const dateFieldByStatus = {
  "EN PREPARACIÓN": "fecha_preparacion",
  "LISTO": "fecha_listo",
  "ENTREGADO": "fecha_entrega",
  "CANCELADO": "fecha_cancelacion",
};

const dbGetOrderById = async (id) => {
  const pedido = await Pedido.findByPk(id, {
    include: [
      { model: EstadoPedido },
      { model: DetallePedido, include: [{ model: Producto }] },
    ],
  });
  if (!pedido) return null;
  const order = pedido.toJSON();
  order.total = order.DetallePedidos.reduce(
    (sum, item) => sum + Number(item.precio_unitario) * item.cantidad,
    0
  );
  return order;
};

const dbNewOrder = async (newOrder) => {
  const { id_mesero, id_mesa, tipo_servicio, nombre_cliente, observaciones, detalles } = newOrder;
  const t = await sequelize.transaction();
  try {
    const estado = await EstadoPedido.findOne({
      where: { nombre: "PENDIENTE" },
      transaction: t,
    });
    if (!estado) throw new Error("ESTADO_INICIAL_NO_EXISTE");

    const pedido = await Pedido.create(
      {
        id_mesero,
        id_mesa,
        id_estado_actual: estado.id_estado,
        tipo_servicio,
        nombre_cliente,
        observaciones,
      },
      { transaction: t }
    );

    for (const item of detalles) {
      const producto = await Producto.findByPk(item.id_producto, { transaction: t });
      if (!producto || !producto.activo) throw new Error("PRODUCTO_NO_DISPONIBLE");
      await DetallePedido.create(
        {
          id_pedido: pedido.id_pedido,
          id_producto: producto.id_producto,
          cantidad: item.cantidad,
          precio_unitario: producto.precio,
          observaciones: item.observaciones,
        },
        { transaction: t }
      );
    }

    await t.commit();
    return await dbGetOrderById(pedido.id_pedido);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const dbGetOrders = async (filters) => {
  const where = {};
  if (filters.id_estado_actual) where.id_estado_actual = filters.id_estado_actual;
  if (filters.id_mesa) where.id_mesa = filters.id_mesa;
  if (filters.id_mesero) where.id_mesero = filters.id_mesero;
  return await Pedido.findAll({
    where,
    include: [{ model: EstadoPedido }],
    order: [["fecha_creacion", "DESC"]],
  });
};

const dbChangeOrderStatus = async (id, id_estado_destino, id_rol) => {
  const pedido = await Pedido.findByPk(id);
  if (!pedido) return null;

  const actual = await EstadoPedido.findByPk(pedido.id_estado_actual);
  if (["ENTREGADO", "CANCELADO"].includes(actual.nombre)) {
    throw new Error("PEDIDO_FINALIZADO");
  }

  const transicion = await TransicionEstado.findOne({
    where: {
      id_estado_origen: pedido.id_estado_actual,
      id_estado_destino,
      id_rol,
    },
  });
  if (!transicion) throw new Error("TRANSICION_NO_PERMITIDA");

  const destino = await EstadoPedido.findByPk(id_estado_destino);
  const changes = { id_estado_actual: id_estado_destino };
  const dateField = dateFieldByStatus[destino.nombre];
  if (dateField) changes[dateField] = new Date();

  await pedido.update(changes);
  return await dbGetOrderById(id);
};

const dbCancelOrder = async (id, motivo_cancelacion) => {
  const pedido = await Pedido.findByPk(id);
  if (!pedido) return null;

  const actual = await EstadoPedido.findByPk(pedido.id_estado_actual);
  if (!["PENDIENTE", "EN PREPARACIÓN"].includes(actual.nombre)) {
    throw new Error("NO_SE_PUEDE_CANCELAR");
  }

  const cancelado = await EstadoPedido.findOne({ where: { nombre: "CANCELADO" } });
  if (!cancelado) throw new Error("ESTADO_CANCELADO_NO_EXISTE");

  await pedido.update({
    id_estado_actual: cancelado.id_estado,
    fecha_cancelacion: new Date(),
    motivo_cancelacion,
  });
  return await dbGetOrderById(id);
};

export {
  dbNewOrder,
  dbGetOrders,
  dbGetOrderById,
  dbChangeOrderStatus,
  dbCancelOrder
}