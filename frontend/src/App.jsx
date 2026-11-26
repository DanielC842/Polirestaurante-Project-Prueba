import { useEffect, useState } from 'react';
import { api, session, setUnauthorizedHandler } from './services/api.js';
import Login from './views/Login.jsx';
import NuevoPedido from './views/NuevoPedido.jsx';
import MisPedidos from './views/MisPedidos.jsx';
import Cocina from './views/Cocina.jsx';
import Resumen from './views/admin/Resumen.jsx';
import Productos from './views/admin/Productos.jsx';
import Mesas from './views/admin/Mesas.jsx';
import Personal from './views/admin/Personal.jsx';

// Menú de cada rol: el front solo muestra las opciones del rol; los permisos
// reales los valida la API (RNF-04).
const MENU = {
  MESERO: [
    { id: 'nuevo', icono: '＋', texto: 'Nuevo pedido' },
    { id: 'mis', icono: '☰', texto: 'Mis pedidos' },
  ],
  COCINERO: [{ id: 'tablero', icono: '▦', texto: 'Tablero de cocina' }],
  ADMINISTRADOR: [
    { id: 'resumen', icono: '◉', texto: 'Pedidos' },
    { id: 'productos', icono: '◫', texto: 'Productos' },
    { id: 'mesas', icono: '▢', texto: 'Mesas' },
    { id: 'personal', icono: '☺', texto: 'Personal' },
  ],
};

const ROL_TEXTO = { MESERO: 'Mesero', COCINERO: 'Cocina', ADMINISTRADOR: 'Administrador' };

export default function App() {
  const [usuario, setUsuario] = useState(session.usuario);
  const [estados, setEstados] = useState([]);
  const [vista, setVista] = useState(null);

  useEffect(() => { setUnauthorizedHandler(() => setUsuario(null)); }, []);

  useEffect(() => {
    if (!usuario) return;
    api.getStatuses().then(setEstados).catch(() => {});
  }, [usuario]);

  const salir = async () => {
    try { await api.logout(); } catch { /* la sesión ya no era válida */ }
    session.clear();
    setVista(null);
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={setUsuario} />;

  const menu = MENU[usuario.rol] || [];
  const actual = menu.find((m) => m.id === vista) || menu[0];
  const id = actual?.id;
  const iniciales = usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="app">
      <aside className="lateral">
        <div className="marca"><span className="logo">PR</span><span>PoliRestaurante</span></div>
        <nav>
          {menu.map((m) => (
            <button key={m.id} className={m.id === actual?.id ? 'activo' : ''} onClick={() => setVista(m.id)}>
              <span className="icono" aria-hidden>{m.icono}</span>{m.texto}
            </button>
          ))}
        </nav>
        <div className="perfil">
          <span className="avatar">{iniciales}</span>
          <div><b>{usuario.nombre}</b><small>{ROL_TEXTO[usuario.rol]}</small></div>
          <button onClick={salir} title="Cerrar sesión">Cerrar sesión</button>
        </div>
      </aside>
      <main className="contenido">
        <header className="encabezado"><h1>{actual?.texto}</h1></header>
        {id === 'nuevo' && <NuevoPedido />}
        {id === 'mis' && <MisPedidos usuario={usuario} estados={estados} />}
        {id === 'tablero' && <Cocina estados={estados} />}
        {id === 'resumen' && <Resumen />}
        {id === 'productos' && <Productos />}
        {id === 'mesas' && <Mesas />}
        {id === 'personal' && <Personal />}
      </main>
    </div>
  );
}
