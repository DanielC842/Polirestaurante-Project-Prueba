import { sequelize } from "../config/connectionPostgreSQL.js";
import { Pedido } from "../models/order.model.js";
import { DetallePedido } from "../models/orderDetail.model.js";
import { Producto } from "../models/product.model.js";
import { EstadoPedido } from "../models/status.model.js";
import { TransicionEstado } from "../models/transition.model.js";
import { Mesa } from "../models/mesas.model.js";
import { sumOrderTotal } from "../helpers/validation.helper.js";

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
  order.total = sumOrderTotal(order.DetallePedidos);
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

    if (id_mesa !== undefined && id_mesa !== null) {
      const mesa = await Mesa.findByPk(id_mesa, { transaction: t });
      if (!mesa || mesa.estado === "fuera de servicio") throw new Error("MESA_NO_DISPONIBLE");
    }

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
  const pedidos = await Pedido.findAll({
    where,
    include: [
      { model: EstadoPedido },
      { model: DetallePedido, include: [{ model: Producto }] },
    ],
    order: [["fecha_creacion", "DESC"]],
  });
  // Cada pedido del listado incluye su total exacto
  return pedidos.map((pedido) => {
    const order = pedido.toJSON();
    order.total = sumOrderTotal(order.DetallePedidos);
    return order;
  });
};

// Actualiza el pedido solo si sigue en el estado leído. Si otro usuario lo cambió
// entre la lectura y la escritura, no se afecta ninguna fila y se rechaza (RNF-03, CU-06).
const updateIfStatusUnchanged = async (pedido, changes) => {
  const [affected] = await Pedido.update(changes, {
    where: { id_pedido: pedido.id_pedido, id_estado_actual: pedido.id_estado_actual },
  });
  if (affected === 0) throw new Error("ESTADO_CAMBIADO");
};

const dbChangeOrderStatus = async (id, id_estado_destino, user) => {
  const pedido = await Pedido.findByPk(id);
  if (!pedido) return null;

  // Un mesero solo puede mover (entregar) sus propios pedidos, igual que al cancelar
  if (user.rol === "MESERO" && pedido.id_mesero !== user.id_perfil) {
    throw new Error("NO_ES_SU_PEDIDO");
  }

  const actual = await EstadoPedido.findByPk(pedido.id_estado_actual);
  if (["ENTREGADO", "CANCELADO"].includes(actual.nombre)) {
    throw new Error("PEDIDO_FINALIZADO");
  }

  const transicion = await TransicionEstado.findOne({
    where: {
      id_estado_origen: pedido.id_estado_actual,
      id_estado_destino,
      rol: user.rol,
    },
  });
  if (!transicion) {
    // Si el cambio existe pero para otro rol, es un problema de permisos (403)
    const deOtroRol = await TransicionEstado.findOne({
      where: { id_estado_origen: pedido.id_estado_actual, id_estado_destino },
    });
    throw new Error(deOtroRol ? "TRANSICION_DE_OTRO_ROL" : "TRANSICION_NO_PERMITIDA");
  }

  const destino = await EstadoPedido.findByPk(id_estado_destino);
  if (!destino) throw new Error("ESTADO_DESTINO_NO_EXISTE");
  const changes = { id_estado_actual: id_estado_destino };
  const dateField = dateFieldByStatus[destino.nombre];
  if (dateField) changes[dateField] = new Date();

  await updateIfStatusUnchanged(pedido, changes);
  return await dbGetOrderById(id);
};

const dbCancelOrder = async (id, motivo_cancelacion, user) => {
  const pedido = await Pedido.findByPk(id);
  if (!pedido) return null;

  if (user.rol === "MESERO" && pedido.id_mesero !== user.id_perfil) {
    throw new Error("NO_ES_SU_PEDIDO");
  }

  const actual = await EstadoPedido.findByPk(pedido.id_estado_actual);
  if (!["PENDIENTE", "EN PREPARACIÓN"].includes(actual.nombre)) {
    throw new Error("NO_SE_PUEDE_CANCELAR");
  }

  const cancelado = await EstadoPedido.findOne({ where: { nombre: "CANCELADO" } });
  if (!cancelado) throw new Error("ESTADO_CANCELADO_NO_EXISTE");

  await updateIfStatusUnchanged(pedido, {
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