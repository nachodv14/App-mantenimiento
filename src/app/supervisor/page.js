"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SupervisorView() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  // Dashboard State
  const [tasks, setTasks] = useState([]);
  const [historyTasks, setHistoryTasks] = useState([]);
  const [machinesOut, setMachinesOut] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [quickObs, setQuickObs] = useState({});

  useEffect(() => {
    const savedUser = sessionStorage.getItem("mantenimiento_user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      if (u.role === 'supervisor') {
        setUser(u);
        fetchData(activeTab, u.plant);
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router, activeTab]);

  const handleLogout = () => {
    sessionStorage.removeItem("mantenimiento_user");
    sessionStorage.removeItem("mantenimiento_current_plant");
    router.push('/');
  };

  const fetchData = async (tab, plant) => {
    setLoading(true);
    try {
      if (tab === "pending") {
        const res = await fetch(`/api/tareas/pending?plant=${plant}`, { cache: "no-store" });
        const data = await res.json();
        if (data.tasks) setTasks(data.tasks);
      } else if (tab === "history") {
        const res = await fetch(`/api/tareas/history?plant=${plant}`, { cache: "no-store" });
        const data = await res.json();
        if (data.tasks) setHistoryTasks(data.tasks);
      } else if (tab === "machines") {
        const res = await fetch(`/api/machines/out-of-service?plant=${plant}`, { cache: "no-store" });
        const data = await res.json();
        if (data.machines) setMachinesOut(data.machines);
      } else if (tab === "metrics") {
        const res = await fetch(`/api/tareas/metrics?plant=${plant}`, { cache: "no-store" });
        const data = await res.json();
        if (data) setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, supervisor_obs: quickObs[id] || '' })
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        // Limpiar la observacion
        setQuickObs(prev => { const n = {...prev}; delete n[id]; return n; });
      } else {
        alert("Hubo un error al actualizar la tarea");
      }
    } catch (err) {
      alert("Error de red al actualizar la tarea");
    }
  };

  const saveTaskEdit = async () => {
    try {
      const res = await fetch(`/api/tareas/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: editingTask.start_time,
          end_time: editingTask.end_time,
          description: editingTask.description,
          deviation: editingTask.deviation,
          observaciones: editingTask.observaciones,
          supervisor_obs: editingTask.supervisor_obs
        })
      });
      if (res.ok) {
        setEditingTask(null);
        fetchData(activeTab, user.plant); // Recargar la tabla actual
      } else {
        alert("Error al guardar la edición");
      }
    } catch (err) {
      alert("Error de red al guardar");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>APROBADO</span>;
      case 'REJECTED': return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>RECHAZADO</span>;
      default: return <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PENDIENTE</span>;
    }
  };

  const formatMinutesToHours = (totalMins) => {
    if (!totalMins) return '0h 0m';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h ${m}m`;
  };

  if (!user) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando panel de supervisor...</div>;
  }

  const renderTabs = () => (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
      <button
        onClick={() => setActiveTab('pending')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'pending' ? 'bold' : 'normal', color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'pending' ? '3px solid var(--primary)' : 'none' }}
      >
        Tareas Pendientes
      </button>
      <button
        onClick={() => setActiveTab('history')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'history' ? 'bold' : 'normal', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : 'none' }}
      >
        Historial General
      </button>
      <button
        onClick={() => setActiveTab('machines')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'machines' ? 'bold' : 'normal', color: activeTab === 'machines' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'machines' ? '3px solid var(--primary)' : 'none' }}
      >
        Máquinas Paradas
      </button>
      <button
        onClick={() => setActiveTab('metrics')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'metrics' ? 'bold' : 'normal', color: activeTab === 'metrics' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'metrics' ? '3px solid var(--primary)' : 'none' }}
      >
        Estadísticas (Mes)
      </button>
    </div>
  );

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 5%', background: '#1e293b', color: '#fff' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#fff' }}>
          <img src="/logo-serin.png" alt="Grupo Serin" style={{ height: "32px", borderRadius: "4px" }} />
          <span>MantenimientoApp <small style={{ fontWeight: 'normal', color: '#94a3b8' }}>| Panel Supervisor</small></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem' }}>Planta: <strong>{user.plant}</strong></span>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.4rem 1rem' }}>Cerrar sesión</button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", padding: "2rem", margin: "0 auto" }}>
        {renderTabs()}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={() => fetchData(activeTab, user.plant)} className="btn btn-primary" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
            {loading ? 'Actualizando...' : '↻ Refrescar'}
          </button>
        </div>

        {/* TAB: PENDIENTES */}
        {activeTab === 'pending' && (
          tasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3>¡Al día!</h3>
              <p>No hay registros diarios pendientes de aprobación.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))' }}>
              {tasks.map(t => (
                <div key={t.id} className="card" style={{ borderLeft: '4px solid #facc15', margin: 0, padding: '1.25rem' }}>
                  <div style={{ display: 'block' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        {getStatusBadge(t.status)}
                        <strong style={{ fontSize: '1.1rem' }}>{t.operator_name || 'Operario Desconocido'}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.task_date_fmt} ({t.shift})</span>
                        <button
                          onClick={() => setEditingTask({ ...t, start_time: t.start_time_fmt || t.start_time, end_time: t.end_time_fmt || t.end_time })}
                          style={{ marginLeft: 'auto', background: 'none', border: '1px solid #cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          ✏️ Editar
                        </button>
                      </div>
                      <h4 style={{ margin: '0.5rem 0', color: 'var(--primary)' }}>
                        {t.task_type} {t.machine_name ? `» ${t.machine_name}` : t.category ? `» ${t.category}` : ''}
                      </h4>
                      <p style={{ margin: '0.5rem 0' }}>{t.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span><strong>Hora:</strong> {t.start_time_fmt} - {t.end_time_fmt}</span>
                        {t.nature && <span><strong>Naturaleza:</strong> {t.nature}</span>}
                      </div>
                      {t.deviation && (
                        <div style={{ background: '#fff1f2', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem', color: '#9f1239', marginBottom: '0.5rem' }}>
                          <strong>⚠️ Desviación:</strong> {t.deviation}
                        </div>
                      )}
                      
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        <input 
                          type="text" 
                          placeholder="Agregar observación (opcional)..." 
                          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          value={quickObs[t.id] || ''}
                          onChange={(e) => setQuickObs({...quickObs, [t.id]: e.target.value})}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => updateTaskStatus(t.id, 'APPROVED')} className="btn btn-success" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}>✅ Aprobar</button>
                          <button onClick={() => updateTaskStatus(t.id, 'REJECTED')} className="btn btn-danger" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}>❌ Rechazar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB: HISTORIAL */}
        {activeTab === 'history' && (
          <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem' }}>Fecha</th>
                  <th style={{ padding: '1rem' }}>Operario</th>
                  <th style={{ padding: '1rem' }}>Tipo</th>
                  <th style={{ padding: '1rem' }}>Máquina / Sector</th>
                  <th style={{ padding: '1rem' }}>Tiempo</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historyTasks.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>{t.task_date_fmt}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{t.operator_name}</td>
                    <td style={{ padding: '1rem' }}>{t.task_type}</td>
                    <td style={{ padding: '1rem' }}>{t.machine_name || t.category || '-'}</td>
                    <td style={{ padding: '1rem' }}>{t.start_time_fmt} - {t.end_time_fmt}</td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(t.status)}
                      {t.supervisor_obs && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          <strong>Obs:</strong> {t.supervisor_obs}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {historyTasks.length === 0 && (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No hay registros en el historial.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: MÁQUINAS PARADAS */}
        {activeTab === 'machines' && (
          <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem' }}>Máquina</th>
                  <th style={{ padding: '1rem' }}>Sector</th>
                  <th style={{ padding: '1rem' }}>Reportado por</th>
                  <th style={{ padding: '1rem' }}>Inicio de Parada</th>
                  <th style={{ padding: '1rem' }}>Desviación</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {machinesOut.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb', background: m.is_resolved ? 'transparent' : '#fef2f2' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{m.machine_name}</td>
                    <td style={{ padding: '1rem' }}>{m.sector}</td>
                    <td style={{ padding: '1rem' }}>{m.reporter_name}</td>
                    <td style={{ padding: '1rem' }}>{m.start_time_fmt}</td>
                    <td style={{ padding: '1rem' }}>{m.deviation}</td>
                    <td style={{ padding: '1rem' }}>
                      {m.is_resolved
                        ? <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Resuelto</span>
                        : <span style={{ color: '#dc2626', fontWeight: 'bold' }}>⚠️ PARADA</span>
                      }
                    </td>
                  </tr>
                ))}
                {machinesOut.length === 0 && (
                  <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>No hay máquinas reportadas como fuera de servicio.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: ESTADÍSTICAS */}
        {activeTab === 'metrics' && metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Rendimiento Operarios */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>⏱️ Rendimiento de Operarios</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Horas trabajadas este mes (solo tareas aprobadas).</p>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem' }}>Operario</th>
                    <th style={{ padding: '0.75rem' }}>Tareas</th>
                    <th style={{ padding: '0.75rem' }}>Horas Totales</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.operatorMetrics?.map((op, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{op.operator_name}</td>
                      <td style={{ padding: '0.75rem' }}>{op.total_tasks}</td>
                      <td style={{ padding: '0.75rem', color: '#0ea5e9', fontWeight: 'bold' }}>{formatMinutesToHours(op.total_minutes)}</td>
                    </tr>
                  ))}
                  {(!metrics.operatorMetrics || metrics.operatorMetrics.length === 0) && (
                    <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>Sin datos este mes</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Máquinas Intervenidas */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#b91c1c' }}>⚙️ Máquinas Más Intervenidas</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Top máquinas con mayor cantidad de tareas este mes.</p>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '0.75rem' }}>Máquina</th>
                    <th style={{ padding: '0.75rem' }}>Intervenciones</th>
                    <th style={{ padding: '0.75rem' }}>Tiempo Detenida</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.machineMetrics?.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.machine_name}</td>
                      <td style={{ padding: '0.75rem' }}>{m.total_interventions}</td>
                      <td style={{ padding: '0.75rem', color: '#0ea5e9', fontWeight: 'bold' }}>{formatMinutesToHours(m.total_minutes)}</td>
                    </tr>
                  ))}
                  {(!metrics.machineMetrics || metrics.machineMetrics.length === 0) && (
                    <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>Sin datos este mes</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE EDICIÓN */}
      {editingTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Editar Tarea</h3>
              <button onClick={() => setEditingTask(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
            </div>

            <div className="form-group">
              <label>Hora Desde</label>
              <input type="time" className="form-control" value={editingTask.start_time} onChange={e => setEditingTask({ ...editingTask, start_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Hora Hasta</label>
              <input type="time" className="form-control" value={editingTask.end_time} onChange={e => setEditingTask({ ...editingTask, end_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea className="form-control" rows="3" value={editingTask.description || ''} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}></textarea>
            </div>
            <div className="form-group">
              <label>Desviación</label>
              <textarea className="form-control" rows="2" value={editingTask.deviation || ''} onChange={e => setEditingTask({ ...editingTask, deviation: e.target.value })}></textarea>
            </div>
            <div className="form-group">
              <label>Observaciones del Supervisor</label>
              <textarea className="form-control" rows="2" placeholder="Notas internas para el supervisor..." value={editingTask.supervisor_obs || ''} onChange={e => setEditingTask({ ...editingTask, supervisor_obs: e.target.value })}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setEditingTask(null)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}>Cancelar</button>
              <button onClick={saveTaskEdit} className="btn btn-primary" style={{ flex: 1 }}>💾 Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
