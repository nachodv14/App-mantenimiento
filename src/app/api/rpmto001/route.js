import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function initTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS rpmto001_tasks (
      id SERIAL PRIMARY KEY,
      plant VARCHAR(50) NOT NULL,
      status VARCHAR(100) NOT NULL DEFAULT 'Azul: Posibilidad de realización',
      machine_code VARCHAR(100),
      pending_work TEXT NOT NULL,
      criticality INTEGER DEFAULT 50,
      requested_by VARCHAR(100),
      request_date DATE,
      execution_date DATE,
      supplies_needed TEXT,
      supplies_status VARCHAR(100) DEFAULT 'Recursos disponibles',
      observation TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  if (!plant) {
    return NextResponse.json({ error: 'Planta requerida' }, { status: 400 });
  }

  try {
    await initTable();
    const result = await query(
      `SELECT *,
              TO_CHAR(request_date, 'YYYY-MM-DD') as request_date_fmt,
              TO_CHAR(execution_date, 'YYYY-MM-DD') as execution_date_fmt,
              TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as created_at_fmt
       FROM rpmto001_tasks 
       WHERE ($1 = 'ALL' OR plant = $1)
       ORDER BY 
         CASE 
           WHEN status LIKE '%Azul%' OR status LIKE '%Amarillo%' THEN 1
           ELSE 2
         END,
         criticality DESC NULLS LAST,
         id DESC`,
      [plant]
    );

    return NextResponse.json({ tasks: result.rows });
  } catch (error) {
    console.error('Error fetching RPMTO001 tasks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initTable();
    const data = await request.json();
    const {
      plant,
      status = 'Azul: Posibilidad de realización',
      machine_code,
      pending_work,
      criticality = 50,
      requested_by,
      request_date,
      execution_date,
      supplies_needed,
      supplies_status = 'Recursos disponibles',
      observation
    } = data;

    if (!plant || !pending_work) {
      return NextResponse.json({ error: 'Planta y Trabajo Pendiente son requeridos' }, { status: 400 });
    }

    const insertQ = `
      INSERT INTO rpmto001_tasks (
        plant, status, machine_code, pending_work, criticality,
        requested_by, request_date, execution_date,
        supplies_needed, supplies_status, observation, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING *;
    `;

    const res = await query(insertQ, [
      plant,
      status,
      machine_code || null,
      pending_work,
      parseInt(criticality, 10) || 50,
      requested_by || null,
      request_date || null,
      execution_date || null,
      supplies_needed || null,
      supplies_status || 'Recursos disponibles',
      observation || null
    ]);

    return NextResponse.json({ success: true, task: res.rows[0] });
  } catch (error) {
    console.error('Error creating RPMTO001 task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await initTable();
    const data = await request.json();
    const {
      id,
      status,
      machine_code,
      pending_work,
      criticality,
      requested_by,
      request_date,
      execution_date,
      supplies_needed,
      supplies_status,
      observation
    } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID de tarea requerido' }, { status: 400 });
    }

    const updateQ = `
      UPDATE rpmto001_tasks
      SET status = COALESCE($2, status),
          machine_code = $3,
          pending_work = COALESCE($4, pending_work),
          criticality = COALESCE($5, criticality),
          requested_by = $6,
          request_date = $7,
          execution_date = $8,
          supplies_needed = $9,
          supplies_status = $10,
          observation = $11,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const res = await query(updateQ, [
      id,
      status,
      machine_code,
      pending_work,
      criticality ? parseInt(criticality, 10) : null,
      requested_by,
      request_date || null,
      execution_date || null,
      supplies_needed,
      supplies_status,
      observation
    ]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: res.rows[0] });
  } catch (error) {
    console.error('Error updating RPMTO001 task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await initTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await query('DELETE FROM rpmto001_tasks WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting RPMTO001 task:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
