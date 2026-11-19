import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false
    }
);

const conectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado a PostgreSQL');
    } catch (error) {
        console.error('Error de conexión:', error.message);
        process.exit(1);
    }
}

export {
    sequelize,
    conectDB
}