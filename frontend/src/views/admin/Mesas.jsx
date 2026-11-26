import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [form, setForm] = useState({ numero: '', capacidad: '4' });
  const [msg, setMsg] = useState('');

  const cargar = () => api.getTables().then(setMesas).catch((e) => setMsg(e.message));
  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    if (!form.numero || !form.capacidad) return setMsg('Ingrese el número y la capacidad');
    try {
      await api.newTable({ numero: Number(form.numero), capacidad: Number(form.capacidad), estado: 'disponible' });
      setForm({ numero: '', capacidad: '4' }); setMsg(''); cargar();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div className="admin-layout">
      <section className="panel">
        <h2>Mesas del salón <span className="badge">{mesas.length}</span></h2>
        {msg && <p className="error">{msg}</p>}
        <div className="mesas-grid">
          {mesas.map((m) => (
            <div key={m.id_mesa} className="mesa">
              <b>{m.numero}</b><span>{m.capacidad} personas</span><small>{m.estado}</small>
            </div>
          ))}
          {mesas.length === 0 && <p className="vacio">No hay mesas registradas.</p>}
        </div>
      </section>
      <form onSubmit={crear} className="panel formularios">
        <h2>Nueva mesa</h2>
        <label>Número<input type="number" min="1" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></label>
        <label>Capacidad<input type="number" min="1" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} /></label>
        <button className="primario ancho">Agregar mesa</button>
      </form>
    </div>
  );
}
