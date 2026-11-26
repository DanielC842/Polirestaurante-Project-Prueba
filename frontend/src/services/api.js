// ApiService: único punto de contacto con el backend (Remote Proxy).
// Agrega el token JWT a cada petición y traduce los errores a mensajes en español.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'poli_token';
const USER_KEY = 'poli_usuario';

export const session = {
  get token() { return localStorage.getItem(TOKEN_KEY); },
  get usuario() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  save({ token, usuario }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (session.token) headers.Authorization = `Bearer ${session.token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No hay conexión con el servidor');
  }

  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') {
    session.clear();
    onUnauthorized();
  }
  if (!res.ok) throw new Error(json.mensaje || `Error ${res.status}`);
  return json.data ?? json;
}

export const api = {
  login: (correo, contrasena) => request('POST', '/auth/login', { correo, contrasena }),
  logout: () => request('POST', '/auth/logout'),

  getStatuses: () => request('GET', '/statuses'),
  getTables: () => request('GET', '/tables'),
  newTable: (data) => request('POST', '/tables', data),
  updateTable: (id, data) => request('PUT', `/tables/${id}`, data),

  getUsers: () => request('GET', '/users'),
  newUser: (data) => request('POST', '/users', data),
  updateUser: (id, data) => request('PUT', `/users/${id}`, data),
  deleteUserPermanent: (id) => request('DELETE', `/users/${id}/permanent`),
  getWaiters: () => request('GET', '/waiters'),
  newWaiter: (data) => request('POST', '/waiters', data),
  getCooks: () => request('GET', '/cooks'),
  newCook: (data) => request('POST', '/cooks', data),
  getAdmins: () => request('GET', '/admins'),
  newAdmin: (data) => request('POST', '/admins', data),
  getCategories: () => request('GET', '/categories'),
  newCategory: (data) => request('POST', '/categories', data),
  getProducts: () => request('GET', '/products'),
  newProduct: (data) => request('POST', '/products', data),
  setProductActive: (id, activo) => request('PATCH', `/products/${id}/active`, { activo }),

  getOrders: (filters = {}) => {
    const qs = new URLSearchParams(filters).toString();
    return request('GET', `/orders${qs ? `?${qs}` : ''}`);
  },
  newOrder: (data) => request('POST', '/orders', data),
  changeStatus: (id, id_estado_destino) =>
    request('PATCH', `/orders/${id}/status`, { id_estado_destino }),
  cancelOrder: (id, motivo_cancelacion) =>
    request('PATCH', `/orders/${id}/cancel`, { motivo_cancelacion }),
};
