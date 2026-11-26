import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { usePolling, formatCOP, formatHora, minutosDesde } from '../../hooks.js';

const ESTADOS = ['PENDIENTE', 'EN PREPARACIÓN', 'LISTO', 'ENTREGADO', 'CANCELADO'];
const CLASE = { PENDIENTE: 'pendiente', 'EN PREPARACIÓN': 'preparacion', LISTO: 'listo', ENTREGADO: 'entregado', CANCELADO: 'cancelado' };

export default function Resumen() {
  const [filtro, setFiltro] = useState('');
  const [meseros, setMeseros] = useState({});
  const [mesas, setMesas] = useState({});
  const { data: pedidos } = usePolling(() => api.getOrders());

  useEffect(() => {
    api.getWaiters().then((l) => setMeseros(Object.fromEntries(l.map((m) => [m.id_mesero, m.Usuario?.nombre])))).catch(() => {});
    api.getTables().then((l) => setMesas(Object.fromEntries(l.map((m) => [m.id_mesa, m.numero])))).catch(() => {});
  }, []);

  const lista = pedidos || [];
  const conteo = lista.reduce((acc, p) => { const e = p.EstadoPedido?.nombre; acc[e] = (acc[e] || 0) + 1; return acc; }, {});
  const ventas = lista
    .filter((p) => p.EstadoPedido?.nombre === 'ENTREGADO')
    .reduce((s, p) => s + (p.DetallePedidos || []).reduce((t, d) => t + Number(d.precio_unitario) * d.cantidad, 0), 0);
  const visibles = filtro ? lista.filter((p) => p.EstadoPedido?.nombre === filtro) : lista;

  return (
    <>
      <div className="kpis">
        {ESTADOS.map((e) => (
          <button key={e} className={`kpi kpi-${CLASE[e]} ${filtro === e ? 'activo' : ''}`} onClick={() => setFiltro(filtro === e ? '' : e)}>
            <b>{conteo[e] || 0}</b><span>{e}</span>
          </button>
        ))}
        <div className="kpi kpi-ventas"><b>{formatCOP(ventas)}</b><span>Ventas entregadas</span></div>
      </div>
      <section className="panel">
        <div className="panel-titulo">
          <h2>{filtro ? `Pedidos ${filtro.toLowerCase()}` : 'Todos los pedidos (en tiempo real)'}</h2>
          {filtro && <button onClick={() => setFiltro('')}>Quitar filtro</button>}
        </div>
        <div className="tabla-scroll">
          <table>
            <thead><tr><th>#</th><th>Servicio</th><th>Mesero</th><th>Productos</th><th>Total</th><th>Estado</th><th>Hora</th><th>Espera</th></tr></thead>
            <tbody>
              {visibles.map((p) => {
                const d = p.DetallePedidos || [];
                const estado = p.EstadoPedido?.nombre;
                const final = ['ENTREGADO', 'CANCELADO'].includes(estado);
                return (
                  <tr key={p.id_pedido}>
                    <td><b>{p.id_pedido}</b></td>
                    <td>{p.tipo_servicio === 'mesa' ? `Mesa ${mesas[p.id_mesa] ?? p.id_mesa}` : `Para llevar${p.nombre_cliente ? ` · ${p.nombre_cliente}` : ''}`}</td>
                    <td>{meseros[p.id_mesero] || `#${p.id_mesero}`}</td>
                    <td className="col-productos">{d.map((x) => `${x.cantidad}× ${x.Producto?.nombre}`).join(', ')}</td>
                    <td>{formatCOP(d.reduce((t, x) => t + Number(x.precio_unitario) * x.cantidad, 0))}</td>
                    <td><span className={`estado estado-${CLASE[estado]}`}>{estado}</span></td>
                    <td>{formatHora(p.fecha_creacion)}</td>
                    <td>{final ? '—' : `${minutosDesde(p.fecha_creacion)} min`}</td>
                  </tr>
                );
              })}
              {visibles.length === 0 && <tr><td colSpan="8" className="vacio">No hay pedidos.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
