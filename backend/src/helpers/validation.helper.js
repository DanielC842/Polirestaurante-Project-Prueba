// Validaciones comunes para que los datos inválidos se rechacen con 400
// antes de llegar a la base de datos (en vez de terminar en un error 500).

// Entero positivo: acepta 5 o "5", rechaza "abc", -1, 0, 1.5, "" y null
export const isPositiveInt = (value) =>
    (typeof value === "number" || typeof value === "string") && /^[1-9]\d*$/.test(String(value).trim());

// Precio: número (o texto numérico) entre 0 y el máximo que admite DECIMAL(10,2)
export const isValidPrice = (value) => {
    if (typeof value === "string" && value.trim() === "") return false;
    if (typeof value !== "number" && typeof value !== "string") return false;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n < 1e8;
};

// Texto opcional con largo máximo (undefined o null se aceptan)
export const isOptionalText = (value, max) =>
    value === undefined || value === null || (typeof value === "string" && value.length <= max);

// Texto obligatorio, no vacío tras quitar espacios, con largo máximo
export const isRequiredText = (value, max) =>
    typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (value) => typeof value === "string" && value.length <= 150 && EMAIL_RE.test(value.trim());

// Los correos se guardan y se comparan siempre en minúsculas
export const normalizeEmail = (value) => String(value).trim().toLowerCase();

export const MIN_PASSWORD_LENGTH = 6;

// Estados permitidos para una mesa
export const ESTADOS_MESA = ["disponible", "ocupada", "fuera de servicio"];
export const normalizeTableStatus = (value) =>
    typeof value === "string" ? value.trim().toLowerCase().replace(/_/g, " ") : value;

// Suma exacta en pesos: se trabaja en centavos enteros para evitar errores de coma flotante
export const sumOrderTotal = (detalles = []) =>
    detalles.reduce((cents, item) => cents + Math.round(Number(item.precio_unitario) * 100) * item.cantidad, 0) / 100;
