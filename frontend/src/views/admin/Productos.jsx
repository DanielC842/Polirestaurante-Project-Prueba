import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { formatCOP } from '../../hooks.js';

export default function Productos() {
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

  const nombreCat = (id) => categorias.find((c) => c.id_categoria === id)?.nombre || 'Sin categoría';

  const crearProducto = async (e) => {
    e.preventDefault();
    if (!form.nombre || form.precio === '') return setMsg('Ingrese el nombre y el precio');
    try {
      await api.newProduct({ nombre: form.nombre, precio: Number(form.precio), id_categoria: form.id_categoria ? Number(form.id_categoria) : undefined });
      setForm({ nombre: '', precio: '', id_categoria: '' }); setMsg(''); cargar();
    } catch (err) { setMsg(err.message); }
  };
  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCat) return;
    try { await api.newCategory({ nombre: nuevaCat }); setNuevaCat(''); setMsg(''); cargar(); }
    catch (err) { setMsg(err.message); }
  };
  const alternar = async (p) => {
    try { await api.setProductActive(p.id_producto, !p.activo); cargar(); }
    catch (err) { setMsg(err.message); }
  };

  return (
    <div className="admin-layout">
      <section className="panel">
        <h2>Menú <span className="badge">{productos.length}</span></h2>
        {msg && <p className="error">{msg}</p>}
        <div className="tabla-scroll">
          <table>
            <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id_producto} className={p.activo ? '' : 'inactivo'}>
                  <td><b>{p.nombre}</b></td><td>{nombreCat(p.id_categoria)}</td><td>{formatCOP(p.precio)}</td>
                  <td><span className={`estado ${p.activo ? 'estado-listo' : 'estado-cancelado'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="derecha"><button onClick={() => alternar(p)}>{p.activo ? 'Desactivar' : 'Activar'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <aside className="formularios">
        <form onSubmit={crearProducto} className="panel">
          <h2>Nuevo producto</h2>
          <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
          <label>Precio (COP)<input type="number" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></label>
          <label>Categoría
            <select value={form.id_categoria} onChange={(e) => setForm({ ...form, id_categoria: e.target.value })}>
              <option value="">Sin categoría</option>
              {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
          </label>
          <button className="primario ancho">Agregar producto</button>
        </form>
        <form onSubmit={crearCategoria} className="panel">
          <h2>Nueva categoría</h2>
          <label>Nombre<input value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} /></label>
          <button className="ancho">Agregar categoría</button>
        </form>
      </aside>
    </div>
  );
}
