import { EstadoPedido } from "../models/status.model.js";
import { TransicionEstado } from "../models/transition.model.js";

const initialStatuses = [
  { nombre: "PENDIENTE", orden_flujo: 1 },
  { nombre: "EN PREPARACIÓN", orden_flujo: 2 },
  { nombre: "LISTO", orden_flujo: 3 },
  { nombre: "ENTREGADO", orden_flujo: 4 },
  { nombre: "CANCELADO", orden_flujo: 5 },
];

const dbSeedStatuses = async () => {
  for (const status of initialStatuses) {
    await EstadoPedido.findOrCreate({
      where: { nombre: status.nombre },
      defaults: status,
    });
  }
};

const dbGetStatuses = async () => {
  return await EstadoPedido.findAll({ order: [["orden_flujo", "ASC"]] });
};

const dbNewTransition = async (newTransition) => {
  const { id_estado_origen, id_estado_destino, id_rol } = newTransition;
  const payLoad = {
    id_estado_origen,
    id_estado_destino,
    id_rol,
  };
  return await TransicionEstado.create(payLoad);
};

const dbGetTransitions = async () => {
  return await TransicionEstado.findAll();
};

export {
  dbSeedStatuses,
  dbGetStatuses,
  dbNewTransition,
  dbGetTransitions
}