import { useState } from 'react';
import { api } from '../services/api.js';
import { usePolling } from '../hooks.js';
import OrderCard from '../components/OrderCard.jsx';

const COLUMNAS = [
  { estado: 'PENDIENTE', siguiente: 'EN PREPARACIÓN', accion: 'Tomar pedido' },
  { estado: 'EN PREPARACIÓN', siguiente: 'LISTO', accion: 'Marcar listo' },
  { estado: 'LISTO', siguiente: null },
];

export default function Cocina({ estados }) {
  const [error, setError] = useState('');
  const { data: pedidos, error: errPolling, refresh } = usePolling(() => api.getOrders());
  const idDe = (nombre) => estados.find((e) => e.nombre === nombre)?.id_estado;

  const avanzar = async (id, siguiente) => {
    try { await api.changeStatus(id, idDe(siguiente)); setError(''); }
    catch (e) { setError(e.message); }
    refresh();
  };

  return (
    <>
      {(error || errPolling) && <p className="error">{error || errPolling}</p>}
      <div className="tablero">
        {COLUMNAS.map((col) => {
          // Más antiguos primero, para que cocina atienda en orden de llegada
          const lista = (pedidos || [])
            .filter((p) => p.EstadoPedido?.nombre === col.estado)
            .sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion));
          return (
            <section key={col.estado} className="columna">
              <h2>{col.estado} <span className="badge">{lista.length}</span></h2>
              {lista.map((p) => (
                <OrderCard key={p.id_pedido} pedido={p}>
                  {col.siguiente && <button className="primario" onClick={() => avanzar(p.id_pedido, col.siguiente)}>{col.accion}</button>}
                </OrderCard>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
