import { useEffect, useState } from 'react';
import { api, session, setUnauthorizedHandler } from './services/api.js';
import Login from './views/Login.jsx';
import Mesero from './views/Mesero.jsx';
import Cocina from './views/Cocina.jsx';
import Admin from './views/Admin.jsx';

const TITULOS = { MESERO: 'Toma de pedidos', COCINERO: 'Tablero de cocina', ADMINISTRADOR: 'Administración' };

export default function App() {
  const [usuario, setUsuario] = useState(session.usuario);
  const [estados, setEstados] = useState([]);

  useEffect(() => { setUnauthorizedHandler(() => setUsuario(null)); }, []);

  useEffect(() => {
    if (usuario) api.getStatuses().then(setEstados).catch(() => {});
  }, [usuario]);

  const salir = async () => {
    try { await api.logout(); } catch { /* la sesión ya no era válida */ }
    session.clear();
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={setUsuario} />;

  return (
    <div className="app">
      <header className="barra">
        <h1>PoliRestaurante · {TITULOS[usuario.rol]}</h1>
        <span>{usuario.nombre}</span>
        <button onClick={salir}>Cerrar sesión</button>
      </header>
      <main>
        {usuario.rol === 'MESERO' && <Mesero usuario={usuario} estados={estados} />}
        {usuario.rol === 'COCINERO' && <Cocina estados={estados} />}
        {usuario.rol === 'ADMINISTRADOR' && <Admin />}
      </main>
    </div>
  );
}
