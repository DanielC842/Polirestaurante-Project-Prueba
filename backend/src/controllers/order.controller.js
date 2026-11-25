import {
  dbNewOrder,
  dbGetOrders,
  dbGetOrderById,
  dbChangeOrderStatus,
  dbCancelOrder,
} from "../service/order.service.js";

const businessErrors = {
  PRODUCTO_NO_DISPONIBLE: "Uno de los productos no existe o no está activo",
  PEDIDO_FINALIZADO: "El pedido ya está entregado o cancelado y no se puede modificar",
  TRANSICION_NO_PERMITIDA: "Transición de estado no permitida para este rol",
  NO_SE_PUEDE_CANCELAR: "Solo se puede cancelar un pedido PENDIENTE o EN PREPARACIÓN",
  ESTADO_INICIAL_NO_EXISTE: "No existe el estado inicial PENDIENTE",
  ESTADO_CANCELADO_NO_EXISTE: "No existe el estado CANCELADO",
};

const handleError = (error, res, defaultMessage) => {
    console.error(error);
    if (businessErrors[error.message]) {
        return res.status(400).json({ mensaje: businessErrors[error.message] });
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({ mensaje: "Algún dato referenciado no existe (mesero, mesa, estado o rol)" });
    }
    res.status(500).json({ mensaje: defaultMessage });
};

const newOrder = async (req, res) => {
    try {
        const { id_mesero, id_mesa, tipo_servicio, nombre_cliente, observaciones, detalles } = req.body;

        if (!id_mesero || !tipo_servicio) {
            return res.status(400).json({ mensaje: "id_mesero y tipo_servicio son obligatorios" });
        }

        if (tipo_servicio === "mesa" && !id_mesa) {
            return res.status(400).json({ mensaje: "id_mesa es obligatorio cuando el servicio es en mesa" });
        }

        if (!Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ mensaje: "El pedido debe tener al menos un producto" });
        }

        for (const item of detalles) {
            if (!item.id_producto || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
                return res.status(400).json({ mensaje: "Cada detalle necesita id_producto y una cantidad entera mayor a 0" });
            }
        }

        const data = await dbNewOrder({
            id_mesero,
            id_mesa,
            tipo_servicio,
            nombre_cliente,
            observaciones,
            detalles,
        });

        res.status(201).json({ data });

    } catch (error) {
        handleError(error, res, "Error al crear el pedido");
    }
}

const getOrders = async (req, res) => {
    try {
        const data = await dbGetOrders(req.query);
        res.status(200).json({ data });
    } catch (error) {
        handleError(error, res, "Error al obtener los pedidos");
    }
}

const getOrderById = async (req, res) => {
    try {
        const data = await dbGetOrderById(req.params.id);

        if (!data) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(error, res, "Error al obtener el pedido");
    }
}

const changeOrderStatus = async (req, res) => {
    try {
        const { id_estado_destino, id_rol } = req.body;

        if (!id_estado_destino || !id_rol) {
            return res.status(400).json({ mensaje: "id_estado_destino e id_rol son obligatorios" });
        }

        const data = await dbChangeOrderStatus(req.params.id, id_estado_destino, id_rol);

        if (!data) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(error, res, "Error al cambiar el estado del pedido");
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { motivo_cancelacion } = req.body;

        if (!motivo_cancelacion) {
            return res.status(400).json({ mensaje: "El motivo de cancelación es obligatorio" });
        }

        const data = await dbCancelOrder(req.params.id, motivo_cancelacion);

        if (!data) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }

        res.status(200).json({ data });
    } catch (error) {
        handleError(error, res, "Error al cancelar el pedido");
    }
}

export {
    newOrder,
    getOrders,
    getOrderById,
    changeOrderStatus,
    cancelOrder
}