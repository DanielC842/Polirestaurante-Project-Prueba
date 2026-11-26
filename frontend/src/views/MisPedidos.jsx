import { useState } from 'react';
import { api } from '../services/api.js';
import { usePolling } from '../hooks.js';
import OrderCard from '../components/OrderCard.jsx';

export default function MisPedidos({ usuario, estados }) {
  const [error, setError] = useState('');
  const { data: pedidos, refresh } = usePolling(() => api.getOrders({ id_mesero: usuario.id_perfil }));
  const idEntregado = estados.find((e) => e.nombre === 'ENTREGADO')?.id_estado;

  const entregar = async (id) => {
    try { await api.changeStatus(id, idEntregado); setError(''); refresh(); }
    catch (e) { setError(e.message); }
  };
  const cancelar = async (id) => {
    const motivo = window.prompt('Motivo de la cancelación');
    if (!motivo) return;
    try { await api.cancelOrder(id, motivo); setError(''); refresh(); }
    catch (e) { setError(e.message); }
  };

  const activos = (pedidos || []).filter((p) => !['ENTREGADO', 'CANCELADO'].includes(p.EstadoPedido?.nombre));
  const listos = activos.filter((p) => p.EstadoPedido?.nombre === 'LISTO');
  const resto = activos.filter((p) => p.EstadoPedido?.nombre !== 'LISTO');

  const tarjeta = (p) => (
    <OrderCard key={p.id_pedido} pedido={p}>
      {p.EstadoPedido?.nombre === 'LISTO' && <button className="primario" onClick={() => entregar(p.id_pedido)}>Marcar entregado</button>}
      {['PENDIENTE', 'EN PREPARACIÓN'].includes(p.EstadoPedido?.nombre) && <button onClick={() => cancelar(p.id_pedido)}>Cancelar</button>}
    </OrderCard>
  );

  return (
    <>
      {error && <p className="error">{error}</p>}
      <h2>Listos para entregar <span className="badge">{listos.length}</span></h2>
      <div className="grilla">{listos.map(tarjeta)}{listos.length === 0 && <p className="vacio">Ninguno por ahora.</p>}</div>
      <h2 className="separado">En cocina <span className="badge">{resto.length}</span></h2>
      <div className="grilla">{resto.map(tarjeta)}{resto.length === 0 && <p className="vacio">No hay pedidos en cocina.</p>}</div>
    </>
  );
}
