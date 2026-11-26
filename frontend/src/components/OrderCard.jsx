import { formatCOP, formatHora, minutosDesde } from '../hooks.js';

const claseEstado = {
  PENDIENTE: 'pendiente',
  'EN PREPARACIÓN': 'preparacion',
  LISTO: 'listo',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
};

export default function OrderCard({ pedido, children }) {
  const estado = pedido.EstadoPedido?.nombre;
  const items = pedido.DetallePedidos || [];
  const total = items.reduce((s, d) => s + Number(d.precio_unitario) * d.cantidad, 0);
  return (
    <article className={`card estado-${claseEstado[estado] || ''}`}>
      <header>
        <strong>#{pedido.id_pedido}</strong>
        <span>{pedido.tipo_servicio === 'mesa' ? `Mesa ${pedido.id_mesa}` : `Para llevar${pedido.nombre_cliente ? ` · ${pedido.nombre_cliente}` : ''}`}</span>
        <span className="badge">{estado}</span>
      </header>
      <ul>
        {items.map((d) => (
          <li key={d.id_detalle}>
            {d.cantidad} × {d.Producto?.nombre}
            {d.observaciones && <em> ({d.observaciones})</em>}
          </li>
        ))}
      </ul>
      {pedido.observaciones && <p className="obs">Obs: {pedido.observaciones}</p>}
      <footer>
        <small>{formatHora(pedido.fecha_creacion)} · hace {minutosDesde(pedido.fecha_creacion)} min</small>
        <small>{formatCOP(total)}</small>
      </footer>
      {children && <div className="acciones">{children}</div>}
    </article>
  );
}
