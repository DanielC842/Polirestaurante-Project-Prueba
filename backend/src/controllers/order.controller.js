import {
  dbNewOrder,
  dbGetOrders,
  dbGetOrderById,
  dbChangeOrderStatus,
  dbCancelOrder,
} from "../service/order.service.js";
import { isPositiveInt, isOptionalText } from "../helpers/validation.helper.js";

const businessErrors = {
  PRODUCTO_NO_DISPONIBLE: "Uno de los productos no existe o no está activo",
  PEDIDO_FINALIZADO: "El pedido ya está entregado o cancelado y no se puede modificar",
  TRANSICION_NO_PERMITIDA: "Transición de estado no permitida para este rol",
  NO_SE_PUEDE_CANCELAR: "Solo se puede cancelar un pedido PENDIENTE o EN PREPARACIÓN",
  ESTADO_INICIAL_NO_EXISTE: "No existe el estado inicial PENDIENTE",
  ESTADO_CANCELADO_NO_EXISTE: "No existe el estado CANCELADO",
  USUARIO_SIN_ROL: "El usuario no es administrador, cocinero ni mesero",
  ESTADO_DESTINO_NO_EXISTE: "El estado destino no existe",
  NO_ES_SU_PEDIDO: "Solo puede modificar sus propios pedidos",
  MESA_NO_DISPONIBLE: "La mesa no existe o está fuera de servicio",
};

// El rol del usuario no tiene permiso para ese cambio (sí lo tiene otro rol)
const forbiddenErrors = {
  TRANSICION_DE_OTRO_ROL: "Su rol no tiene permiso para realizar este cambio de estado",
};

// Errores de concurrencia: otro usuario cambió el pedido primero (RNF-03, CU-06)
const conflictErrors = {
  ESTADO_CAMBIADO: "El estado del pedido ya cambió, actualice la pantalla",
};

const TIPOS_SERVICIO = ["mesa", "llevar"];

const handleError = (error, res, defaultMessage) => {
    console.error(error);
    if (conflictErrors[error.message]) {
        return res.status(409).json({ mensaje: conflictErrors[error.message] });
    }
    if (forbiddenErrors[error.message]) {
        return res.status(403).json({ mensaje: forbiddenErrors[error.message] });
    }
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
        const { id_mesa, tipo_servicio, nombre_cliente, observaciones, detalles } = req.body;

        // Un mesero siempre crea pedidos a su nombre; el administrador indica el mesero
        const id_mesero = req.user.rol === "MESERO" ? req.user.id_perfil : req.body.id_mesero;

        if (!id_mesero || !tipo_servicio) {
            return res.status(400).json({ mensaje: "id_mesero y tipo_servicio son obligatorios" });
        }

        if (!TIPOS_SERVICIO.includes(tipo_servicio)) {
            return res.status(400).json({ mensaje: "tipo_servicio debe ser 'mesa' o 'llevar'" });
        }

        if (!isPositiveInt(id_mesero)) {
            return res.status(400).json({ mensaje: "id_mesero debe ser un número entero positivo" });
        }

        if (tipo_servicio === "mesa" && !id_mesa) {
            return res.status(400).json({ mensaje: "id_mesa es obligatorio cuando el servicio es en mesa" });
        }

        if (id_mesa !== undefined && id_mesa !== null && !isPositiveInt(id_mesa)) {
            return res.status(400).json({ mensaje: "id_mesa debe ser un número entero positivo" });
        }

        if (!isOptionalText(nombre_cliente, 120)) {
            return res.status(400).json({ mensaje: "El nombre del cliente debe ser texto de máximo 120 caracteres" });
        }

        if (!isOptionalText(observaciones, 1000)) {
            return res.status(400).json({ mensaje: "Las observaciones deben ser texto de máximo 1000 caracteres" });
        }

        if (!Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ mensaje: "El pedido debe tener al menos un producto" });
        }

        for (const item of detalles) {
            if (!item || !isPositiveInt(item.id_producto) || !Number.isInteger(item.cantidad) || item.cantidad <= 0) {
                return res.status(400).json({ mensaje: "Cada detalle necesita id_producto y una cantidad entera mayor a 0" });
            }
            if (!isOptionalText(item.observaciones, 500)) {
                return res.status(400).json({ mensaje: "Las observaciones de cada producto deben ser texto de máximo 500 caracteres" });
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
        for (const filtro of ["id_estado_actual", "id_mesa", "id_mesero"]) {
            if (req.query[filtro] !== undefined && !isPositiveInt(req.query[filtro])) {
                return res.status(400).json({ mensaje: `El filtro ${filtro} debe ser un número entero positivo` });
            }
        }

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
        const { id_estado_destino } = req.body;

        if (!id_estado_destino) {
            return res.status(400).json({ mensaje: "id_estado_destino es obligatorio" });
        }

        if (!isPositiveInt(id_estado_destino)) {
            return res.status(400).json({ mensaje: "id_estado_destino debe ser un número entero positivo" });
        }

        // El usuario y su rol salen del token, no del body
        const data = await dbChangeOrderStatus(req.params.id, id_estado_destino, req.user);

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

        if (!motivo_cancelacion || typeof motivo_cancelacion !== "string" || !motivo_cancelacion.trim()) {
            return res.status(400).json({ mensaje: "El motivo de cancelación es obligatorio" });
        }

        if (motivo_cancelacion.length > 255) {
            return res.status(400).json({ mensaje: "El motivo de cancelación debe tener máximo 255 caracteres" });
        }

        const data = await dbCancelOrder(req.params.id, motivo_cancelacion, req.user);

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