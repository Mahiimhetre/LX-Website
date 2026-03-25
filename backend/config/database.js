import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false, // Set to true to see SQL queries in console
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL Database connected successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default sequelize;
