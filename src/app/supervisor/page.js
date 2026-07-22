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
  const [machineAvailability, setMachineAvailability] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [quickObs, setQuickObs] = useState({});
  const [operariosList, setOperariosList] = useState([]);
  const [shiftConfigs, setShiftConfigs] = useState([
    { shift_name: 'Turno Mañana', start_time: '06:00', end_time: '14:00' },
    { shift_name: 'Turno Tarde', start_time: '14:00', end_time: '22:00' },
    { shift_name: 'Turno Noche', start_time: '22:00', end_time: '06:00' }
  ]);

  // Filtros Pendientes
  const [pendingDateFrom, setPendingDateFrom] = useState("");
  const [pendingDateTo, setPendingDateTo] = useState("");
  const [pendingOperator, setPendingOperator] = useState("");

  // Filtros Indicadores (Meses & Días Hábiles)
  const now = new Date();
  const defaultYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [metricsFromMonth, setMetricsFromMonth] = useState(defaultYM);
  const [metricsToMonth, setMetricsToMonth] = useState(defaultYM);
  const [businessDaysInput, setBusinessDaysInput] = useState("");
  const [savingBusinessDays, setSavingBusinessDays] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("mantenimiento_user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      if (u.role === 'supervisor') {
        setUser(u);
        fetchData(activeTab, u.plant);
        fetch(`/api/operarios?plant=${u.plant}`)
          .then(res => res.json())
          .then(data => {
            if (data.operators) setOperariosList(data.operators);
          });
      } else {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router, activeTab]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    sessionStorage.removeItem("mantenimiento_user");
    sessionStorage.removeItem("mantenimiento_current_plant");
    router.push('/');
  };

  const fetchData = async (tab, plant, customFromM, customToM) => {
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
      } else if (tab === "availability") {
        const res = await fetch(`/api/machines/availability?plant=${plant}`, { cache: "no-store" });
        const data = await res.json();
        if (data.machines) setMachineAvailability(data.machines);
      } else if (tab === "metrics") {
        const fromM = customFromM !== undefined ? customFromM : metricsFromMonth;
        const toM = customToM !== undefined ? customToM : metricsToMonth;
        const res = await fetch(`/api/tareas/metrics?plant=${plant}&fromMonth=${fromM}&toMonth=${toM}`, { cache: "no-store" });
        const data = await res.json();
        if (data) {
          setMetrics(data);
          const currentMonthDays = data.monthlyDaysBreakdown?.[fromM] !== undefined
            ? data.monthlyDaysBreakdown[fromM]
            : (data.totalBusinessDays || 20);
          setBusinessDaysInput(String(currentMonthDays));
        }
      } else if (tab === "shifts") {
        const res = await fetch(`/api/shifts?plant=${plant}`, { cache: "no-store" });
        const data = await res.json();
        if (data.shifts && data.shifts.length > 0) {
          setShiftConfigs(data.shifts);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessDays = async () => {
    if (!user || !metricsFromMonth) return;
    setSavingBusinessDays(true);
    try {
      const res = await fetch('/api/business-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant: user.plant,
          yearMonth: metricsFromMonth,
          business_days: parseInt(businessDaysInput, 10)
        })
      });
      const json = await res.json();
      if (res.ok) {
        alert('Días hábiles guardados correctamente');
        fetchData('metrics', user.plant);
      } else {
        alert('Error: ' + json.error);
      }
    } catch (e) {
      alert('Error de red al guardar días hábiles');
    } finally {
      setSavingBusinessDays(false);
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
        setQuickObs(prev => { const n = { ...prev }; delete n[id]; return n; });
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
        fetchData(activeTab, user.plant);
      } else {
        alert("Error al guardar la edición");
      }
    } catch (err) {
      alert("Error de red al guardar");
    }
  };

  const handleAvailabilityChange = (id, field, value) => {
    setMachineAvailability(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const saveMachineAvailability = async (id, start, end) => {
    try {
      const res = await fetch('/api/machines/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, productive_start: start, productive_end: end })
      });
      if (res.ok) {
        alert("Horario actualizado correctamente");
      } else {
        alert("Error al actualizar horario");
      }
    } catch (e) {
      alert("Error de red");
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

  const getCompanionsText = (companionsJson) => {
    if (!companionsJson) return null;
    try {
      const comps = typeof companionsJson === 'string' ? JSON.parse(companionsJson) : companionsJson;
      if (!Array.isArray(comps) || comps.length === 0) return null;
      const names = comps.map(cId => {
        const op = operariosList.find(o => o.id === cId);
        return op ? op.full_name : 'Operario Desconocido';
      });
      return `Con ${names.join(', ')} (${comps.length + 1} operarios en total)`;
    } catch (e) {
      return null;
    }
  };

  const renderKpiBadge = (val, isPercentage = true) => {
    if (val === null || val === undefined) {
      return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold' }}>⚠️ Sin Horario</span>;
    }
    let bg = '#dcfce7';
    let color = '#166534';
    if (val < 85) {
      bg = '#fee2e2';
      color = '#991b1b';
    } else if (val < 95) {
      bg = '#fef08a';
      color = '#854d0e';
    }
    return (
      <span style={{ background: bg, color: color, padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '1.35rem', fontWeight: 'bold' }}>
        {val}{isPercentage ? '%' : ''}
      </span>
    );
  };

  if (!user) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando panel de supervisor...</div>;
  }

  const renderTabs = () => (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
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
        onClick={() => setActiveTab('availability')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'availability' ? 'bold' : 'normal', color: activeTab === 'availability' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'availability' ? '3px solid var(--primary)' : 'none' }}
      >
        Disponibilidad máquinas
      </button>
      <button
        onClick={() => setActiveTab('metrics')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'metrics' ? 'bold' : 'normal', color: activeTab === 'metrics' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'metrics' ? '3px solid var(--primary)' : 'none' }}
      >
        Indicadores
      </button>
      <button
        onClick={() => setActiveTab('shifts')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'shifts' ? 'bold' : 'normal', color: activeTab === 'shifts' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'shifts' ? '3px solid var(--primary)' : 'none' }}
      >
        Horarios de Turnos
      </button>
    </div>
  );

  const uniqueOperators = [...new Set(tasks.map(t => t.operator_name))].filter(Boolean);

  const filteredPendingTasks = tasks.filter(t => {
    let match = true;
    if (pendingOperator) {
      match = match && t.operator_name === pendingOperator;
    }
    if (t.task_date) {
      const dateStr = t.task_date.slice(0, 10);
      if (pendingDateFrom && dateStr < pendingDateFrom) match = false;
      if (pendingDateTo && dateStr > pendingDateTo) match = false;
    }
    return match;
  });

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
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem', color: '#64748b' }}>Desde fecha</label>
                <input type="date" value={pendingDateFrom} onChange={(e) => setPendingDateFrom(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem', color: '#64748b' }}>Hasta fecha</label>
                <input type="date" value={pendingDateTo} onChange={(e) => setPendingDateTo(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem', color: '#64748b' }}>Operario</label>
                <select value={pendingOperator} onChange={(e) => setPendingOperator(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  <option value="">Todos los operarios</option>
                  {uniqueOperators.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
            </div>

            {filteredPendingTasks.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3>¡Al día!</h3>
                <p>No hay registros diarios pendientes con estos filtros.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))' }}>
                {filteredPendingTasks.map(t => (
                  <div key={t.id} className="card" style={{ borderLeft: '4px solid #facc15', margin: 0, padding: '1.25rem' }}>
                    <div style={{ display: 'block' }}>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          {getStatusBadge(t.status)}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <strong style={{ fontSize: '1.1rem' }}>{t.operator_name || 'Operario Desconocido'}</strong>
                            {getCompanionsText(t.companions) && (
                              <span style={{ fontSize: '0.8rem', color: '#0369a1', background: '#e0f2fe', padding: '0.1rem 0.4rem', borderRadius: '4px', alignSelf: 'flex-start' }}>
                                👥 {getCompanionsText(t.companions)}
                              </span>
                            )}
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>{t.task_date_fmt} ({t.shift})</span>
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
                            onChange={(e) => setQuickObs({ ...quickObs, [t.id]: e.target.value })}
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
            )}
          </>
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
                  <th style={{ padding: '1rem' }}>Fin de Parada</th>
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
                    <td style={{ padding: '1rem', color: m.is_resolved ? '#16a34a' : 'inherit' }}>{m.resolved_at_fmt || '-'}</td>
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
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>No hay máquinas reportadas como fuera de servicio.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: DISPONIBILIDAD MÁQUINAS */}
        {activeTab === 'availability' && (
          <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem' }}>Máquina</th>
                  <th style={{ padding: '1rem' }}>Sector</th>
                  <th style={{ padding: '1rem' }}>Inicio Productivo</th>
                  <th style={{ padding: '1rem' }}>Fin Productivo</th>
                  <th style={{ padding: '1rem' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {machineAvailability.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '1rem' }}>{m.sector}</td>
                    <td style={{ padding: '1rem' }}>
                      <input
                        type="time"
                        value={m.productive_start || ''}
                        onChange={e => handleAvailabilityChange(m.id, 'productive_start', e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <input
                        type="time"
                        value={m.productive_end || ''}
                        onChange={e => handleAvailabilityChange(m.id, 'productive_end', e.target.value)}
                        style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => saveMachineAvailability(m.id, m.productive_start, m.productive_end)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                ))}
                {machineAvailability.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>No hay máquinas activas en esta planta.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: ESTADÍSTICAS / INDICADORES */}
        {activeTab === 'metrics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Panel de Controles / Filtros de Período y Días Hábiles */}
            <div className="card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📅 Seleccionar Período de Análisis
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.3rem' }}>
                    Mes Desde
                  </label>
                  <input
                    type="month"
                    value={metricsFromMonth}
                    onChange={(e) => {
                      setMetricsFromMonth(e.target.value);
                      fetchData('metrics', user.plant, e.target.value, metricsToMonth);
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.3rem' }}>
                    Mes Hasta (Período multimes)
                  </label>
                  <input
                    type="month"
                    value={metricsToMonth}
                    onChange={(e) => {
                      setMetricsToMonth(e.target.value);
                      fetchData('metrics', user.plant, metricsFromMonth, e.target.value);
                    }}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.3rem' }}>
                    Días Hábiles ({metricsFromMonth})
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={businessDaysInput}
                      onChange={(e) => setBusinessDaysInput(e.target.value)}
                      style={{ width: '90px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', textAlign: 'center' }}
                    />
                    <button
                      onClick={saveBusinessDays}
                      disabled={savingBusinessDays}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      {savingBusinessDays ? 'Guardando...' : '💾 Guardar'}
                    </button>
                  </div>
                </div>

                <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#0369a1' }}>
                  <strong>Período evaluado:</strong> {metrics?.months?.length || 1} mes(es) ({metrics?.totalBusinessDays || 0} días hábiles totales)
                </div>
              </div>
            </div>

            {/* Advertencia de máquinas sin horario productivo */}
            {metrics?.unconfiguredMachines && metrics.unconfiguredMachines.length > 0 && (
              <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px', padding: '1rem 1.5rem', color: '#873800' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚠️ Atención: Máquinas sin Horario Productivo Configurado
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  Las siguientes máquinas en <strong>{user.plant}</strong> no tienen configurado un horario productivo en la solapa <em>"Disponibilidad máquinas"</em>: 
                  <strong> {metrics.unconfiguredMachines.join(', ')}</strong>. 
                  Para calcular su disponibilidad exacta, ingresa a la solapa <em>"Disponibilidad máquinas"</em> y establece sus horas de inicio y fin productivo.
                </p>
              </div>
            )}

            {/* SECCIÓN SL2: INDICADORES MENSUALES CLAVE */}
            {user.plant === 'SL2' && metrics?.sl2KPIs && (
              <>
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Indicadores de Disponibilidad de Equipos (Planta SL2)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    
                    {/* 1) FL02 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>1) Disponibilidad FL02</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Flejadora / Equipo FL02</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadFL02)}
                    </div>

                    {/* 2) M01 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>2) Disponibilidad M01</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina M01</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadM01)}
                    </div>

                    {/* 3) M03 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>3) Disponibilidad M03</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina M03</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadM03)}
                    </div>

                    {/* 4) M05 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>4) Disponibilidad M05</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina M05</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadM05)}
                    </div>

                    {/* 5) M06 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>5) Disponibilidad M06</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina M06</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadM06)}
                    </div>

                    {/* 6) M07 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>6) Disponibilidad M07</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina M07</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadM07)}
                    </div>

                    {/* 7) Media P08-P09 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #0284c7' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>7) Disponibilidad media P08-P09</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio de máquinas P08 y P09</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadMediaP08P09)}
                    </div>

                    {/* 8) Menor disponibilidad Puentes Grúas */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #d97706' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>8) Menor disponibilidad Puentes Grúas</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mínimo valor de puentes grúas</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.menorDisponibilidadPuentesGruas)}
                    </div>

                    {/* 9) Disponibilidad media autoelevadores */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #059669' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>9) Disponibilidad media Autoelevadores</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio de flota autoelevadores</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadMediaAutoelevadores)}
                    </div>

                  </div>
                </div>

                {/* HORAS HOMBRE METRICS (10 AL 13) */}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⏱️ Distribución de Horas Hombre (% HH Aprobadas)
                  </h3>

                  <div style={{ marginBottom: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1.25rem', borderRadius: '6px', fontSize: '0.95rem', color: '#166534', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>📌 Total Horas Hombre cargadas en el período: <strong>{metrics.sl2KPIs.hhMetrics?.totalHHLoaded} hs</strong></span>
                    <span style={{ fontSize: '0.85rem', color: '#15803d' }}>Suma (Indicadores 10 + 11 + 12 + 13) = 100%</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    
                    {/* 10) % HH Correctivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>10) TRABAJOS CORRECTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {metrics.sl2KPIs.hhMetrics?.pctHHCorrectivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl2KPIs.hhMetrics?.hhCorrectivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Tareas en "Fallas"</span>
                    </div>

                    {/* 11) % HH Preventivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>11) TRABAJOS PREVENTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>
                          {metrics.sl2KPIs.hhMetrics?.pctHHPreventivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl2KPIs.hhMetrics?.hhPreventivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Preventivos condicional/periódicos</span>
                    </div>

                    {/* 12) % HH Varios */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>12) TRABAJOS VARIOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
                          {metrics.sl2KPIs.hhMetrics?.pctHHVarios}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl2KPIs.hhMetrics?.hhVarios} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Mantenimiento edilicio / varios</span>
                    </div>

                    {/* 13) % HH Ausentismo */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>13) AUSENTISMO / NO PRODUCTIVO</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#d97706' }}>
                          {metrics.sl2KPIs.hhMetrics?.pctHHAusentismo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl2KPIs.hhMetrics?.hhAusentismo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Ausentismo / no productivo</span>
                    </div>

                  </div>
                </div>
              </>
            )}

            {/* Rendimiento Operarios y Máquinas Intervenidas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Rendimiento Operarios */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>⏱️ Rendimiento de Operarios</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Horas trabajadas en el período seleccionado (solo tareas aprobadas).</p>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem' }}>Operario</th>
                      <th style={{ padding: '0.75rem' }}>Tareas</th>
                      <th style={{ padding: '0.75rem' }}>Horas Totales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.operatorMetrics?.map((op, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{op.operator_name}</td>
                        <td style={{ padding: '0.75rem' }}>{op.total_tasks}</td>
                        <td style={{ padding: '0.75rem', color: '#0ea5e9', fontWeight: 'bold' }}>{formatMinutesToHours(op.total_minutes)}</td>
                      </tr>
                    ))}
                    {(!metrics?.operatorMetrics || metrics.operatorMetrics.length === 0) && (
                      <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>Sin datos en este período</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Máquinas Intervenidas */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#b91c1c' }}>⚙️ Máquinas Más Intervenidas</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Top máquinas con mayor cantidad de intervenciones en el período.</p>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem' }}>Máquina</th>
                      <th style={{ padding: '0.75rem' }}>Intervenciones</th>
                      <th style={{ padding: '0.75rem' }}>Tiempo de Parada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.machineMetrics?.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '0.75rem' }}>{m.interventions}</td>
                        <td style={{ padding: '0.75rem', color: '#0ea5e9', fontWeight: 'bold' }}>{(m.stop_hours || 0).toFixed(1)} hs</td>
                      </tr>
                    ))}
                    {(!metrics?.machineMetrics || metrics.machineMetrics.length === 0) && (
                      <tr><td colSpan="3" style={{ padding: '1rem', textAlign: 'center' }}>Sin datos en este período</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: SHIFTS */}
        {activeTab === 'shifts' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Horarios de Turnos - {user.plant}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configura el rango horario que abarca cada turno en esta planta. Al seleccionar un turno, los operarios solo podrán cargar horas dentro del rango definido.</p>
            
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px' }}>
              {shiftConfigs.map((sc, i) => (
                <div key={sc.shift_name} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{sc.shift_name}</strong>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem', color: '#64748b' }}>Hora Inicio</label>
                    <input type="time" value={sc.start_time} onChange={(e) => {
                      const newConfigs = [...shiftConfigs];
                      newConfigs[i].start_time = e.target.value;
                      setShiftConfigs(newConfigs);
                    }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem', color: '#64748b' }}>Hora Fin</label>
                    <input type="time" value={sc.end_time} onChange={(e) => {
                      const newConfigs = [...shiftConfigs];
                      newConfigs[i].end_time = e.target.value;
                      setShiftConfigs(newConfigs);
                    }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
              ))}
              
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem', padding: '0.75rem', fontSize: '1.1rem' }}
                onClick={async () => {
                  try {
                    setLoading(true);
                    await fetch('/api/shifts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ plant: user.plant, shifts: shiftConfigs })
                    });
                    alert('Horarios guardados correctamente');
                  } catch(e) {
                    alert('Error al guardar');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Guardar Horarios
              </button>
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
