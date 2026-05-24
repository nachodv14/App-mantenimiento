import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const plant = searchParams.get('plant');

  if (!plant) {
    return NextResponse.json({ error: 'Planta requerida' }, { status: 400 });
  }

  try {
    // 1. Métricas por operario (Mes actual, tareas aprobadas)
    const qOperators = `
      SELECT 
        o.full_name as operator_name,
        COUNT(t.id)::int as total_tasks,
        COALESCE(SUM(t.total_time_minutes), 0)::int as total_minutes
      FROM tasks t
      JOIN users o ON t.operator_id = o.id
      WHERE t.status = 'APPROVED'
        AND ($1 = 'ALL' OR t.plant = $1)
        AND date_trunc('month', t.task_date) = date_trunc('month', CURRENT_DATE)
      GROUP BY o.full_name
      ORDER BY total_minutes DESC NULLS LAST
    `;

    // 2. Máquinas más intervenidas (Mes actual, tareas aprobadas)
    const qMachines = `
      SELECT 
        m.name as machine_name,
        COUNT(t.id)::int as total_interventions,
        COALESCE(SUM(t.total_time_minutes), 0)::int as total_minutes
      FROM tasks t
      JOIN machines m ON t.machine_id = m.id
      WHERE t.status = 'APPROVED'
        AND ($1 = 'ALL' OR t.plant = $1)
        AND date_trunc('month', t.task_date) = date_trunc('month', CURRENT_DATE)
      GROUP BY m.name
      ORDER BY total_interventions DESC
      LIMIT 10
    `;

    const [resOp, resMach] = await Promise.all([
      query(qOperators, [plant]),
      query(qMachines, [plant])
    ]);

    return NextResponse.json({
      operatorMetrics: resOp.rows,
      machineMetrics: resMach.rows
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
