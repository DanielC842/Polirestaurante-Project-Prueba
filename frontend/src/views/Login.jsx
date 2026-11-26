import { useState } from 'react';
import { api, session } from '../services/api.js';

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (!correo || !contrasena) return setError('Ingrese el correo y la contraseña');
    setCargando(true);
    try {
      const data = await api.login(correo, contrasena);
      session.save(data);
      onLogin(data.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="login">
      <form onSubmit={enviar} className="panel">
        <h1>PoliRestaurante</h1>
        <p>Inicie sesión para continuar</p>
        <label>Correo<input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} autoFocus /></label>
        <label>Contraseña<input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={cargando}>{cargando ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </main>
  );
}
