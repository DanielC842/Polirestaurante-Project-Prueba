import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { usePolling, formatCOP } from '../hooks.js';
import OrderCard from '../components/OrderCard.jsx';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ nombre: '', precio: '', id_categoria: '' });
  const [nuevaCat, setNuevaCat] = useState('');
  const [msg, setMsg] = useState('');

  const cargar = () => {
    api.getProducts().then(setProductos).catch((e) => setMsg(e.message));
    api.getCategories().then(setCategorias).catch(() => {});
  };
  useEffect(cargar, []);

  const crearProducto = async (e) => {
    e.preventDefault();
    try {
      await api.newProduct({
        nombre: form.nombre,
        precio: Number(form.precio),
        id_categoria: form.id_categoria ? Number(form.id_categoria) : undefined,
      });
      setForm({ nombre: '', precio: '', id_categoria: '' }); setMsg(''); cargar();
    } catch (err) { setMsg(err.message); }
  };

  const crearCategoria = async (e) => {
    e.preventDefault();
    try { await api.newCategory({ nombre: nuevaCat }); setNuevaCat(''); cargar(); }
    catch (err) { setMsg(err.message); }
  };

  const alternar = async (p) => {
    try { await api.setProductActive(p.id_producto, !p.activo); cargar(); }
    catch (err) { setMsg(err.message); }
  };

  return (
    <section className="panel">
      <h2>Productos</h2>
      <form onSubmit={crearCategoria} className="fila">
        <input placeholder="Nueva categoría" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} />
        <button>Agregar categoría</button>
      </form>
      <form onSubmit={crearProducto} className="fila">
        <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input placeholder="Precio" type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
        <select value={form.id_categoria} onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}>
          <option value="">Sin categoría</option>
          {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
        </select>
        <button className="primario">Agregar producto</button>
      </form>
      {msg && <p className="error">{msg}</p>}
      <table>
        <thead><tr><th>Producto</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id_producto}>
              <td>{p.nombre}</td><td>{formatCOP(p.precio)}</td>
              <td>{p.activo ? 'Activo' : 'Inactivo'}</td>
              <td><button onClick={() => alternar(p)}>{p.activo ? 'Desactivar' : 'Activar'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Pedidos() {
  const { data: pedidos } = usePolling(() => api.getOrders());
  const conteo = (pedidos || []).reduce((acc, p) => {
    const e = p.EstadoPedido?.nombre; acc[e] = (acc[e] || 0) + 1; return acc;
  }, {});
  return (
    <section>
      <div className="kpis">
        {['PENDIENTE', 'EN PREPARACIÓN', 'LISTO', 'ENTREGADO', 'CANCELADO'].map((e) => (
          <div key={e} className="kpi"><b>{conteo[e] || 0}</b><span>{e}</span></div>
        ))}
      </div>
      <div className="grilla">
        {(pedidos || []).map((p) => <OrderCard key={p.id_pedido} pedido={p} />)}
      </div>
    </section>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('pedidos');
  return (
    <>
      <div className="segmentado">
        <button className={tab === 'pedidos' ? 'activo' : ''} onClick={() => setTab('pedidos')}>Pedidos en tiempo real</button>
        <button className={tab === 'productos' ? 'activo' : ''} onClick={() => setTab('productos')}>Productos</button>
      </div>
      {tab === 'pedidos' ? <Pedidos /> : <Productos />}
    </>
  );
}
