import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { usePolling, formatCOP } from '../hooks.js';
import OrderCard from '../components/OrderCard.jsx';

export default function Mesero({ usuario, estados }) {
  const [productos, setProductos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [tipo, setTipo] = useState('mesa');
  const [idMesa, setIdMesa] = useState('');
  const [cliente, setCliente] = useState('');
  const [obs, setObs] = useState('');
  const [items, setItems] = useState({});
  const [msg, setMsg] = useState({ texto: '', error: false });

  useEffect(() => {
    api.getProducts().then((p) => setProductos(p.filter((x) => x.activo))).catch(() => {});
    api.getTables().then(setMesas).catch(() => {});
  }, []);

  const { data: pedidos, refresh } = usePolling(() => api.getOrders({ id_mesero: usuario.id_perfil }));

  const total = useMemo(
    () => productos.reduce((s, p) => s + (items[p.id_producto] || 0) * Number(p.precio), 0),
    [items, productos]
  );

  const cambiarCantidad = (id, delta) =>
    setItems((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const enviar = async () => {
    const detalles = Object.entries(items)
      .filter(([, c]) => c > 0)
      .map(([id, c]) => ({ id_producto: Number(id), cantidad: c }));
    if (tipo === 'mesa' && !idMesa) return setMsg({ texto: 'Seleccione la mesa', error: true });
    if (detalles.length === 0) return setMsg({ texto: 'Agregue al menos un producto', error: true });
    try {
      const p = await api.newOrder({
        tipo_servicio: tipo,
        id_mesa: tipo === 'mesa' ? Number(idMesa) : undefined,
        nombre_cliente: tipo === 'llevar' && cliente ? cliente : undefined,
        observaciones: obs || undefined,
        detalles,
      });
      setMsg({ texto: `Pedido #${p.id_pedido} enviado a cocina`, error: false });
      setItems({}); setObs(''); setCliente('');
      refresh();
    } catch (e) {
      setMsg({ texto: e.message, error: true });
    }
  };

  const idEntregado = estados.find((e) => e.nombre === 'ENTREGADO')?.id_estado;

  const entregar = async (id) => {
    try { await api.changeStatus(id, idEntregado); refresh(); }
    catch (e) { setMsg({ texto: e.message, error: true }); }
  };

  const cancelar = async (id) => {
    const motivo = window.prompt('Motivo de la cancelación');
    if (!motivo) return;
    try { await api.cancelOrder(id, motivo); refresh(); }
    catch (e) { setMsg({ texto: e.message, error: true }); }
  };

  const activos = (pedidos || []).filter((p) => !['ENTREGADO', 'CANCELADO'].includes(p.EstadoPedido?.nombre));

  return (
    <div className="dos-columnas">
      <section className="panel">
        <h2>Nuevo pedido</h2>
        <div className="segmentado">
          <button className={tipo === 'mesa' ? 'activo' : ''} onClick={() => setTipo('mesa')}>Salón</button>
          <button className={tipo === 'llevar' ? 'activo' : ''} onClick={() => setTipo('llevar')}>Para llevar</button>
        </div>
        {tipo === 'mesa' ? (
          <label>Mesa
            <select value={idMesa} onChange={(e) => setIdMesa(e.target.value)}>
              <option value="">Seleccione…</option>
              {mesas.map((m) => <option key={m.id_mesa} value={m.id_mesa}>Mesa {m.numero}</option>)}
            </select>
          </label>
        ) : (
          <label>Nombre del cliente (opcional)<input value={cliente} onChange={(e) => setCliente(e.target.value)} /></label>
        )}
        <ul className="productos">
          {productos.map((p) => (
            <li key={p.id_producto}>
              <span>{p.nombre}<small>{formatCOP(p.precio)}</small></span>
              <span className="contador">
                <button onClick={() => cambiarCantidad(p.id_producto, -1)}>−</button>
                <b>{items[p.id_producto] || 0}</b>
                <button onClick={() => cambiarCantidad(p.id_producto, 1)}>+</button>
              </span>
            </li>
          ))}
          {productos.length === 0 && <li>No hay productos activos.</li>}
        </ul>
        <label>Observaciones<input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ej. sin cebolla" /></label>
        <div className="total">Total: <b>{formatCOP(total)}</b></div>
        {msg.texto && <p className={msg.error ? 'error' : 'ok'}>{msg.texto}</p>}
        <button className="primario" onClick={enviar}>Enviar a cocina</button>
      </section>
      <section>
        <h2>Mis pedidos activos</h2>
        <div className="grilla">
          {activos.map((p) => (
            <OrderCard key={p.id_pedido} pedido={p}>
              {p.EstadoPedido?.nombre === 'LISTO' && <button className="primario" onClick={() => entregar(p.id_pedido)}>Marcar entregado</button>}
              {['PENDIENTE', 'EN PREPARACIÓN'].includes(p.EstadoPedido?.nombre) && <button onClick={() => cancelar(p.id_pedido)}>Cancelar</button>}
            </OrderCard>
          ))}
          {activos.length === 0 && <p>No tiene pedidos activos.</p>}
        </div>
      </section>
    </div>
  );
}
