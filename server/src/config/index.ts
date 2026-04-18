import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ventura_dental',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  
  business: {
    name: process.env.BUSINESS_NAME || 'Ventura Dental',
    ruc: process.env.BUSINESS_RUC || '20XXXXXXXXX',
    address: process.env.BUSINESS_ADDRESS || 'Por definir',
    phone: process.env.BUSINESS_PHONE || '',
  },
};
