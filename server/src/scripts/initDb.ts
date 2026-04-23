import { pool } from '../config/database.js';

export async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando inicialización de base de datos...');
    await client.query('BEGIN');

    // ── Tabla usuarios ──────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(100) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'doctor', 'secretaria')),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla usuarios lista');

    // ── Tabla pacientes ─────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        dni VARCHAR(8) UNIQUE,
        telefono VARCHAR(20),
        email VARCHAR(100),
        direccion TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla pacientes creada');
    console.log('✓ Tabla pacientes creada');

    // ── Tabla tratamientos_macro ─────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS tratamientos_macro (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        descripcion TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla tratamientos_macro creada');

    // ── Tabla tratamientos_micro ────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS tratamientos_micro (
        id SERIAL PRIMARY KEY,
        macro_tratamiento_id INTEGER REFERENCES tratamientos_macro(id) ON DELETE CASCADE,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(macro_tratamiento_id, nombre)
      )
    `);
    console.log('✓ Tabla tratamientos_micro creada');

    // Seed de tratamientos macro por defecto
    await client.query(`
      INSERT INTO tratamientos_macro (nombre, descripcion) 
      VALUES 
        ('Ortodoncia', 'Tratamientos de ortodoncia - brackets, alineadores'),
        ('Endodoncia', 'Tratamientos de conducto'),
        ('Limpieza', 'Limpieza dental y profilaxis'),
        ('Corona', 'Colocación de coronas dentales'),
        ('Extracción', 'Extracciones dentales'),
        ('Blanqueamiento', 'Tratamientos de blanqueamiento'),
        ('Implante', 'Implantes dentales'),
        ('Ortopedia', 'Ortopedia maxilar'),
        ('Resina', 'Resinas dentales'),
        ('Radiografía', 'Rayos X dentales'),
        ('Consulta', 'Consulta dental general'),
        ('Otro', 'Otros tratamientos')
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Seed de tratamientos_macro listo');
    
    // Seed de procedimientos específicos (micro tratamientos)
    await client.query(`
      INSERT INTO tratamientos_micro (macro_tratamiento_id, nombre, precio, descripcion)
      VALUES 
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Limpieza' LIMIT 1), 'Limpieza Dental + Profilaxis', 35000, 'Limpieza básica preventiva'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Limpieza' LIMIT 1), 'Limpieza profunda (Detartraje)', 55000, 'Remoción de sarro subgingival'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Ortodoncia' LIMIT 1), 'Instalación Brackets Metálicos', 250000, 'Cuota inicial de ortodoncia metálica'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Ortodoncia' LIMIT 1), 'Control Mensual Ortodoncia', 35000, 'Ajuste mensual de brackets'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Endodoncia' LIMIT 1), 'Endodoncia Unirradicular', 120000, 'Tratamiento de conducto (1 conducto)'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Resina' LIMIT 1), 'Resina Simple Clase I', 45000, 'Calza de resina pequeña'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Resina' LIMIT 1), 'Resina Compleja', 65000, 'Calza de resina grande o reconstrucción'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Blanqueamiento' LIMIT 1), 'Blanqueamiento de Consultorio', 150000, 'Sesión de blanqueamiento con lámpara LED'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Radiografía' LIMIT 1), 'Radiografía Periapical', 15000, 'Rayos X localizado'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Consulta' LIMIT 1), 'Consulta Inicial de Diagnóstico', 20000, 'Evaluación y plan de tratamiento'),
        ((SELECT id FROM tratamientos_macro WHERE nombre = 'Extracción' LIMIT 1), 'Extracción Simple', 45000, 'Exodoncia no quirúrgica')
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ Seed de tratamientos_micro listo');

    // ── Tabla tratamientos ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS tratamientos (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER REFERENCES pacientes(id),
        macro_tratamiento_id INTEGER REFERENCES tratamientos_macro(id),
        tipo VARCHAR(50) NOT NULL,
        descripcion TEXT,
        monto_total DECIMAL(10,2) NOT NULL,
        monto_pagado DECIMAL(10,2) DEFAULT 0,
        estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo','completado','cancelado')),
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla tratamientos creada');

    // ── Tabla pagos ─────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        paciente_id INTEGER REFERENCES pacientes(id),
        doctor_id INTEGER REFERENCES usuarios(id),
        secretaria_id INTEGER REFERENCES usuarios(id),
        tratamiento_id INTEGER REFERENCES tratamientos(id),
        monto DECIMAL(10,2) NOT NULL,
        moneda VARCHAR(10) DEFAULT 'PEN' CHECK (moneda IN ('PEN','USD','CRC')),
        metodo_pago VARCHAR(30),
        concepto TEXT NOT NULL,
        observaciones TEXT,
        firma_dataurl TEXT,
        estado VARCHAR(20) DEFAULT 'pendiente_cobro'
          CHECK (estado IN ('pendiente_cobro','completado','anulado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finalizado_at TIMESTAMP
      )
    `);

    // ── Migraciones de columnas faltantes ───────────────────────────
    await client.query(`
      DO $$ 
      BEGIN 
        -- Agregar macro_tratamiento_id a tratamientos
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tratamientos' AND column_name='macro_tratamiento_id') THEN
          ALTER TABLE tratamientos ADD COLUMN macro_tratamiento_id INTEGER REFERENCES tratamientos_macro(id);
        END IF;

        -- Agregar tratamiento_macro_id a detalle_pago
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='detalle_pago' AND column_name='tratamiento_macro_id') THEN
          ALTER TABLE detalle_pago ADD COLUMN tratamiento_macro_id INTEGER REFERENCES tratamientos_macro(id);
        END IF;

        -- Renombrar usuario_id -> doctor_id en pagos si existe el origen y no el destino
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='usuario_id') 
           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='doctor_id') THEN 
          ALTER TABLE pagos RENAME COLUMN usuario_id TO doctor_id; 
        END IF;

        -- Agregar columnas faltantes en pagos
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='doctor_id') THEN
          ALTER TABLE pagos ADD COLUMN doctor_id INTEGER REFERENCES usuarios(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='secretaria_id') THEN
          ALTER TABLE pagos ADD COLUMN secretaria_id INTEGER REFERENCES usuarios(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='tratamiento_id') THEN
          ALTER TABLE pagos ADD COLUMN tratamiento_id INTEGER REFERENCES tratamientos(id);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='finalizado_at') THEN
          ALTER TABLE pagos ADD COLUMN finalizado_at TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='moneda') THEN
          ALTER TABLE pagos ADD COLUMN moneda VARCHAR(10) DEFAULT 'PEN';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pagos' AND column_name='observaciones') THEN
          ALTER TABLE pagos ADD COLUMN observaciones TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='detalle_pago' AND column_name='tratamiento_micro_id') THEN
          ALTER TABLE detalle_pago ADD COLUMN tratamiento_micro_id INTEGER;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='detalle_pago' AND column_name='observaciones') THEN
          ALTER TABLE detalle_pago ADD COLUMN observaciones TEXT;
        END IF;

        -- Ajustes de constraints y defaults
        ALTER TABLE pagos ALTER COLUMN metodo_pago DROP NOT NULL;
        ALTER TABLE pagos ALTER COLUMN estado SET DEFAULT 'pendiente_cobro';
        
        -- Migrar estados legacy 'pendiente' -> 'pendiente_cobro'
        UPDATE pagos SET estado = 'pendiente_cobro' WHERE estado = 'pendiente';
        -- Limpieza de estados desconocidos
        UPDATE pagos SET estado = 'completado' WHERE estado NOT IN ('pendiente_cobro','completado','anulado');

        -- Corregir el CHECK constraint para que acepte 'pendiente_cobro'
        ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_estado_check;
        ALTER TABLE pagos ADD CONSTRAINT pagos_estado_check
          CHECK (estado IN ('pendiente_cobro','completado','anulado'));
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error en migración (ignorado): %', SQLERRM;
      END$$;
    `);
    console.log('✓ Migraciones de esquema completadas');

    // ── Tabla detalle_pago (ítems adicionales por pago) ────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS detalle_pago (
        id SERIAL PRIMARY KEY,
        pago_id INTEGER REFERENCES pagos(id) ON DELETE CASCADE,
        tratamiento_macro_id INTEGER REFERENCES tratamientos_macro(id),
        descripcion VARCHAR(200) NOT NULL,
        observaciones TEXT,
        monto DECIMAL(10,2) NOT NULL,
        es_cuota_principal BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla detalle_pago creada');

    // ── Tabla comprobantes ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS comprobantes (
        id SERIAL PRIMARY KEY,
        pago_id INTEGER REFERENCES pagos(id) UNIQUE,
        numero VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla comprobantes creada');

    // ── Tabla sequence_comprobantes ─────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS sequence_comprobantes (
        id SERIAL PRIMARY KEY,
        ultimo_numero INTEGER DEFAULT 0,
        anio INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      UPDATE sequence_comprobantes
      SET anio = EXTRACT(YEAR FROM CURRENT_DATE)::INT
      WHERE anio IS NULL
    `);

    await client.query(`
      ALTER TABLE sequence_comprobantes
      ALTER COLUMN anio SET NOT NULL
    `);

    await client.query(`
      WITH maximos AS (
        SELECT anio, MAX(ultimo_numero) AS max_numero
        FROM sequence_comprobantes
        GROUP BY anio
      )
      UPDATE sequence_comprobantes s
      SET ultimo_numero = m.max_numero
      FROM maximos m
      WHERE s.anio = m.anio
        AND s.ultimo_numero <> m.max_numero
    `);

    await client.query(`
      DELETE FROM sequence_comprobantes a
      USING sequence_comprobantes b
      WHERE a.anio = b.anio
        AND a.id < b.id
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sequence_comprobantes_anio_unique
      ON sequence_comprobantes(anio)
    `);

    console.log('✓ Tabla sequence_comprobantes creada');

    // ── Tabla notificaciones ────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        pago_id INTEGER REFERENCES pagos(id) ON DELETE CASCADE,
        leida BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabla notificaciones creada');

    // ── Tabla cierres_caja ──────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS cierres_caja (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        fecha DATE NOT NULL,
        esperado_efectivo DECIMAL(10,2) DEFAULT 0,
        esperado_tarjeta DECIMAL(10,2) DEFAULT 0,
        esperado_transferencia DECIMAL(10,2) DEFAULT 0,
        esperado_otros DECIMAL(10,2) DEFAULT 0,
        real_efectivo DECIMAL(10,2) DEFAULT 0,
        real_tarjeta DECIMAL(10,2) DEFAULT 0,
        real_transferencia DECIMAL(10,2) DEFAULT 0,
        real_otros DECIMAL(10,2) DEFAULT 0,
        diferencia DECIMAL(10,2) DEFAULT 0,
        observaciones TEXT,
        estado VARCHAR(20) DEFAULT 'cerrado' CHECK (estado IN ('abierto', 'cerrado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fecha)
      )
    `);
    console.log('✓ Tabla cierres_caja lista');

    // ── Tabla logs_errores ──────────────────────────────────────────

    await client.query('COMMIT');
    console.log('✓ Base de datos inicializada correctamente');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al inicializar base de datos:', error);
    throw error;
  } finally {
    client.release();
  }
}
