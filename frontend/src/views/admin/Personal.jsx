import { useEffect, useState } from 'react';
import { api, session } from '../../services/api.js';

const VACIO = { nombre: '', correo: '', contrasena: '', rol: 'MESERO', turno: 'Mañana', estacion: '', cargo: '' };
const hoy = () => new Date().toISOString().slice(0, 10);

export default function Personal() {
  const [personas, setPersonas] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [msg, setMsg] = useState({ texto: '', error: false });
  const [verBajas, setVerBajas] = useState(false);
  const miId = session.usuario?.id_usuario;

  const cargar = async () => {
    try {
      const [usuarios, meseros, cocineros, admins] = await Promise.all([api.getUsers(), api.getWaiters(), api.getCooks(), api.getAdmins()]);
      const rol = {};
      meseros.forEach((m) => { rol[m.id_usuario] = { rol: 'Mesero', detalle: `Turno ${m.turno}` }; });
      cocineros.forEach((c) => { rol[c.id_usuario] = { rol: 'Cocina', detalle: `${c.estacion} · turno ${c.turno}` }; });
      admins.forEach((a) => { rol[a.id_usuario] = { rol: 'Administrador', detalle: a.cargo }; });
      setPersonas(usuarios.map((u) => ({ ...u, ...(rol[u.id_usuario] || { rol: 'Sin rol', detalle: '' }) })));
    } catch (e) { setMsg({ texto: e.message, error: true }); }
  };
  useEffect(() => { cargar(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const crear = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.correo || !form.contrasena) return setMsg({ texto: 'Nombre, correo y contraseña son obligatorios', error: true });
    try {
      const u = await api.newUser({ nombre: form.nombre, correo: form.correo, contrasena: form.contrasena });
      const base = { id_usuario: u.id_usuario, fecha_ingreso: hoy() };
      if (form.rol === 'MESERO') await api.newWaiter({ ...base, turno: form.turno });
      if (form.rol === 'COCINERO') await api.newCook({ ...base, turno: form.turno, estacion: form.estacion || 'General' });
      if (form.rol === 'ADMINISTRADOR') await api.newAdmin({ ...base, cargo: form.cargo || 'Administrador' });
      setForm(VACIO); setMsg({ texto: `${u.nombre} fue registrado`, error: false }); cargar();
    } catch (err) { setMsg({ texto: err.message, error: true }); }
  };

  const alternar = async (p) => {
    if (p.activo && !window.confirm(`¿Dar de baja a ${p.nombre}? Ya no podrá iniciar sesión, pero sus pedidos se conservan.`)) return;
    try {
      await api.updateUser(p.id_usuario, { activo: !p.activo });
      setMsg({ texto: p.activo ? `${p.nombre} fue dado de baja` : `${p.nombre} fue reactivado`, error: false });
      cargar();
    } catch (err) { setMsg({ texto: err.message, error: true }); }
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${p.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteUserPermanent(p.id_usuario);
      setMsg({ texto: `${p.nombre} fue eliminado`, error: false });
      cargar();
    } catch (err) { setMsg({ texto: err.message, error: true }); }
  };

  const visibles = verBajas ? personas : personas.filter((p) => p.activo);
  const bajas = personas.filter((p) => !p.activo).length;

  return (
    <div className="admin-layout">
      <section className="panel">
        <div className="panel-titulo">
          <h2>Personal <span className="badge">{visibles.length}</span></h2>
          <label className="check">
            <input type="checkbox" checked={verBajas} onChange={(e) => setVerBajas(e.target.checked)} />
            Mostrar dados de baja ({bajas})
          </label>
        </div>
        <div className="tabla-scroll">
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Detalle</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {visibles.map((p) => (
                <tr key={p.id_usuario} className={p.activo ? '' : 'inactivo'}>
                  <td><b>{p.nombre}</b></td><td>{p.correo}</td><td>{p.rol}</td><td>{p.detalle}</td>
                  <td><span className={`estado ${p.activo ? 'estado-listo' : 'estado-cancelado'}`}>{p.activo ? 'Activo' : 'De baja'}</span></td>
                  <td className="derecha acciones-fila">
                    {p.id_usuario === miId ? <small>(usted)</small> : (
                      <>
                        <button onClick={() => alternar(p)}>{p.activo ? 'Dar de baja' : 'Reactivar'}</button>
                        <button className="peligro" onClick={() => eliminar(p)}>Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <form onSubmit={crear} className="panel formularios">
        <h2>Registrar empleado</h2>
        <label>Nombre<input value={form.nombre} onChange={set('nombre')} /></label>
        <label>Correo<input type="email" value={form.correo} onChange={set('correo')} /></label>
        <label>Contraseña<input type="password" value={form.contrasena} onChange={set('contrasena')} /></label>
        <label>Rol
          <select value={form.rol} onChange={set('rol')}>
            <option value="MESERO">Mesero</option><option value="COCINERO">Cocina</option><option value="ADMINISTRADOR">Administrador</option>
          </select>
        </label>
        {form.rol !== 'ADMINISTRADOR' && (
          <label>Turno<select value={form.turno} onChange={set('turno')}><option>Mañana</option><option>Tarde</option><option>Noche</option></select></label>
        )}
        {form.rol === 'COCINERO' && <label>Estación<input value={form.estacion} onChange={set('estacion')} placeholder="Ej. parrilla" /></label>}
        {form.rol === 'ADMINISTRADOR' && <label>Cargo<input value={form.cargo} onChange={set('cargo')} placeholder="Ej. gerente" /></label>}
        {msg.texto && <p className={msg.error ? 'error' : 'ok'}>{msg.texto}</p>}
        <button className="primario ancho">Registrar</button>
      </form>
    </div>
  );
}
