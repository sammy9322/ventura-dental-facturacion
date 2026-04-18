import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { pool } from './config/database.js';
import { initDatabase } from './scripts/initDb.js';
import { seedDatabase } from './scripts/seedDb.js';
import { migrateRoles } from './scripts/migrateRoles.js';

import authRoutes from './routes/auth.js';
import pacientesRoutes from './routes/pacientes.js';
import pagosRoutes from './routes/pagos.js';
import comprobantesRoutes from './routes/comprobantes.js';
import tratamientosRoutes from './routes/tratamientos.js';
import tratamientosMacroRoutes from './routes/tratamientosMacro.js';
import notificacionesRoutes from './routes/notificaciones.js';

dotenv.config();

const app = express();

// Capturar errores no controlados fuera del flujo de Express
process.on('uncaughtException', (err) => {
  console.error('❌ EXCEPCIÓN NO CAPTURADA:', err);
  // En producción, aquí se enviaría una alerta al administrador
  process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ PROMESA NO CAPTURADA en:', promise, 'razón:', reason);
  // No salimos del proceso para mantener la disponibilidad, pero registramos el error
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Limitar cada IP a 500 peticiones por ventana
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.' }
});

// ... (configuración de middlewares igual)

app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/comprobantes', comprobantesRoutes);
app.use('/api/tratamientos', tratamientosRoutes);
app.use('/api/tratamientos-macro', tratamientosMacroRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

app.use(errorHandler);

async function startServer() {
  try {
    const client = await pool.connect();
    console.log('✓ Conexión a PostgreSQL establecida');
    client.release();

    await migrateRoles();
    await initDatabase();
    await seedDatabase();

    const server = app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎉 Ventura Dental - Servidor iniciado                   ║
║                                                           ║
║   📍 http://localhost:${config.port}                         ║
║   🏥 ${config.business.name.padEnd(48)}   ║
║   📋 RUC: ${config.business.ruc.padEnd(44)}   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      console.log('Cerrando servidor de forma ordenada...');
      server.close(async () => {
        console.log('Servidor HTTP cerrado.');
        await pool.end();
        console.log('Conexión a base de datos cerrada.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
