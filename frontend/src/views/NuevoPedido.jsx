import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { formatCOP } from '../hooks.js';

export default function NuevoPedido() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [tipo, setTipo] = useState('mesa');
  const [idMesa, setIdMesa] = useState('');
  const [cliente, setCliente] = useState('');
  const [obs, setObs] = useState('');
  const [items, setItems] = useState({});
  const [msg, setMsg] = useState({ texto: '', error: false });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.getProducts().then((p) => setProductos(p.filter((x) => x.activo))).catch(() => {});
    api.getCategories().then(setCategorias).catch(() => {});
    api.getTables().then(setMesas).catch(() => {});
  }, []);

  const visibles = productos.filter(
    (p) => (!filtro || String(p.id_categoria) === filtro) &&
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const seleccionados = productos.filter((p) => items[p.id_producto] > 0);
  const total = useMemo(
    () => seleccionados.reduce((s, p) => s + items[p.id_producto] * Number(p.precio), 0),
    [items, seleccionados]
  );

  const cambiar = (id, delta) =>
    setItems((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));

  const enviar = async () => {
    const detalles = seleccionados.map((p) => ({ id_producto: p.id_producto, cantidad: items[p.id_producto] }));
    if (tipo === 'mesa' && !idMesa) return setMsg({ texto: 'Seleccione la mesa', error: true });
    if (detalles.length === 0) return setMsg({ texto: 'Agregue al menos un producto', error: true });
    setEnviando(true);
    try {
      const p = await api.newOrder({
        tipo_servicio: tipo,
        id_mesa: tipo === 'mesa' ? Number(idMesa) : undefined,
        nombre_cliente: tipo === 'llevar' && cliente ? cliente : undefined,
        observaciones: obs || undefined,
        detalles,
      });
      setMsg({ texto: `Pedido #${p.id_pedido} enviado a cocina`, error: false });
      setItems({}); setObs(''); setCliente(''); setIdMesa('');
    } catch (e) {
      setMsg({ texto: e.message, error: true });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pedido-layout">
      <section className="catalogo">
        <div className="filtros">
          <input placeholder="Buscar producto…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="chips">
            <button className={!filtro ? 'activo' : ''} onClick={() => setFiltro('')}>Todos</button>
            {categorias.map((c) => (
              <button key={c.id_categoria} className={filtro === String(c.id_categoria) ? 'activo' : ''}
                onClick={() => setFiltro(String(c.id_categoria))}>{c.nombre}</button>
            ))}
          </div>
        </div>
        <div className="productos-grid">
          {visibles.map((p) => {
            const n = items[p.id_producto] || 0;
            return (
              <div key={p.id_producto} className={`producto ${n ? 'elegido' : ''}`}>
                <button className="producto-agregar" onClick={() => cambiar(p.id_producto, 1)}>
                  <span className="producto-nombre">{p.nombre}</span>
                  <span className="producto-precio">{formatCOP(p.precio)}</span>
                </button>
                <div className="contador">
                  <button onClick={() => cambiar(p.id_producto, -1)} disabled={!n} aria-label="Quitar">−</button>
                  <b>{n}</b>
                  <button onClick={() => cambiar(p.id_producto, 1)} aria-label="Agregar">+</button>
                </div>
              </div>
            );
          })}
          {visibles.length === 0 && <p className="vacio">No hay productos para mostrar.</p>}
        </div>
      </section>

      <aside className="panel resumen-pedido">
        <h2>Resumen del pedido</h2>
        <div className="segmentado">
          <button className={tipo === 'mesa' ? 'activo' : ''} onClick={() => setTipo('mesa')}>Salón</button>
          <button className={tipo === 'llevar' ? 'activo' : ''} onClick={() => setTipo('llevar')}>Para llevar</button>
        </div>
        {tipo === 'mesa' ? (
          <label>Mesa
            <select value={idMesa} onChange={(e) => setIdMesa(e.target.value)}>
              <option value="">Seleccione…</option>
              {mesas.map((m) => <option key={m.id_mesa} value={m.id_mesa}>Mesa {m.numero} ({m.capacidad} personas)</option>)}
            </select>
          </label>
        ) : (
          <label>Nombre del cliente (opcional)<input value={cliente} onChange={(e) => setCliente(e.target.value)} /></label>
        )}
        <ul className="lineas">
          {seleccionados.map((p) => (
            <li key={p.id_producto}>
              <span>{items[p.id_producto]} × {p.nombre}</span>
              <span>{formatCOP(items[p.id_producto] * Number(p.precio))}</span>
            </li>
          ))}
          {seleccionados.length === 0 && <li className="vacio">Toque un producto para agregarlo.</li>}
        </ul>
        <label>Observaciones<input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ej. sin cebolla" /></label>
        <div className="total"><span>Total</span><b>{formatCOP(total)}</b></div>
        {msg.texto && <p className={msg.error ? 'error' : 'ok'}>{msg.texto}</p>}
        <button className="primario ancho" onClick={enviar} disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar a cocina'}
        </button>
      </aside>
    </div>
  );
}
