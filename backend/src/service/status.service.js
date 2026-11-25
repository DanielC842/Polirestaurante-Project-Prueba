import { EstadoPedido } from "../models/status.model.js";
import { TransicionEstado } from "../models/transition.model.js";

const initialStatuses = [
  { nombre: "PENDIENTE", orden_flujo: 1 },
  { nombre: "EN PREPARACIÓN", orden_flujo: 2 },
  { nombre: "LISTO", orden_flujo: 3 },
  { nombre: "ENTREGADO", orden_flujo: 4 },
  { nombre: "CANCELADO", orden_flujo: 5 },
];

const initialTransitions = [
  { origen: "PENDIENTE", destino: "EN PREPARACIÓN", rol: "COCINERO" },
  { origen: "EN PREPARACIÓN", destino: "LISTO", rol: "COCINERO" },
  { origen: "LISTO", destino: "ENTREGADO", rol: "MESERO" },
  { origen: "PENDIENTE", destino: "EN PREPARACIÓN", rol: "ADMINISTRADOR" },
  { origen: "EN PREPARACIÓN", destino: "LISTO", rol: "ADMINISTRADOR" },
  { origen: "LISTO", destino: "ENTREGADO", rol: "ADMINISTRADOR" },
];

const dbSeedStatuses = async () => {
  for (const status of initialStatuses) {
    await EstadoPedido.findOrCreate({
      where: { nombre: status.nombre },
      defaults: status,
    });
  }
};

const dbSeedTransitions = async () => {
  for (const item of initialTransitions) {
    const origen = await EstadoPedido.findOne({ where: { nombre: item.origen } });
    const destino = await EstadoPedido.findOne({ where: { nombre: item.destino } });
    await TransicionEstado.findOrCreate({
      where: {
        id_estado_origen: origen.id_estado,
        id_estado_destino: destino.id_estado,
        rol: item.rol,
      },
    });
  }
};

const dbGetStatuses = async () => {
  return await EstadoPedido.findAll({ order: [["orden_flujo", "ASC"]] });
};

const dbNewTransition = async (newTransition) => {
  const { id_estado_origen, id_estado_destino, rol } = newTransition;
  const payLoad = {
    id_estado_origen,
    id_estado_destino,
    rol,
  };
  return await TransicionEstado.create(payLoad);
};

const dbGetTransitions = async () => {
  return await TransicionEstado.findAll();
};

export {
  dbSeedStatuses,
  dbSeedTransitions,
  dbGetStatuses,
  dbNewTransition,
  dbGetTransitions
}