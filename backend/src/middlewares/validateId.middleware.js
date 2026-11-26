// Rechaza ids que no sean enteros positivos antes de llegar a la base de datos
const validateIdParam = (req, res, next, value) => {
    if (!/^[1-9]\d*$/.test(value)) {
        return res.status(400).json({ mensaje: 'El id debe ser un número entero positivo' });
    }
    next();
};

export { validateIdParam };
