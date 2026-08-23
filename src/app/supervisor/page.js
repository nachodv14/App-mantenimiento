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

  // Estado y Filtros Agenda RPMTO001
  const [rpmtoTasks, setRpmtoTasks] = useState([]);
  const [rpmtoShowAll, setRpmtoShowAll] = useState(false);
  const [rpmtoFilterStatus, setRpmtoFilterStatus] = useState("");
  const [rpmtoFilterMachine, setRpmtoFilterMachine] = useState("");
  const [rpmtoSearch, setRpmtoSearch] = useState("");
  const [rpmtoModalOpen, setRpmtoModalOpen] = useState(false);
  const [rpmtoEditingTask, setRpmtoEditingTask] = useState(null);
  const [rpmtoSaving, setRpmtoSaving] = useState(false);
  const [rpmtoForm, setRpmtoForm] = useState({
    id: null,
    status: 'Azul: En posibilidad de realización',
    machine_code: '',
    pending_work: '',
    criticality: 50,
    requested_by: '',
    request_date: new Date().toISOString().slice(0, 10),
    execution_date: '',
    supplies_needed: '',
    supplies_status: 'Recursos disponibles',
    observation: ''
  });

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
      } else if (tab === "rpmto001") {
        const [resTasks, resMach] = await Promise.all([
          fetch(`/api/rpmto001?plant=${plant}`, { cache: "no-store" }),
          fetch(`/api/machines/availability?plant=${plant}`, { cache: "no-store" })
        ]);
        const dataTasks = await resTasks.json();
        const dataMach = await resMach.json();
        if (dataTasks.tasks) setRpmtoTasks(dataTasks.tasks);
        if (dataMach.machines) setMachineAvailability(dataMach.machines);
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

  const renderReliabilityKpis = (reliability) => {
    if (!reliability) return null;
    const { tmdr_minutes, tmdr_hours, tmef_hours, total_failures, total_stop_minutes, total_operating_hours } = reliability;

    return (
      <div style={{ marginTop: '0.5rem', marginBottom: '1.75rem' }}>
        <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📈 Indicadores de Eficiencia y Confiabilidad (TMDR y TMEF)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {/* TMDR: Tiempo Promedio de Reparación */}
          <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #ea580c', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Eficiencia del Equipo Técnico
                </span>
                <h4 style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: 700 }}>
                  ⏱️ Tiempo promedio de reparación (TMDR)
                </h4>
              </div>
              <span style={{ background: '#ffedd5', color: '#9a3412', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                MTTR
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.75rem 0' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ea580c' }}>
                {tmdr_minutes > 0 ? `${tmdr_minutes} min` : '0 min'}
              </span>
              {tmdr_hours > 0 && (
                <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>
                  ({tmdr_hours} hs)
                </span>
              )}
            </div>

            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
              Duración media de las intervenciones correctivas para solucionar una falla técnica.
            </p>

            <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Minutos totales de parada por falla: <strong>{total_stop_minutes || 0} min</strong></span>
              <span>Intervenciones correctivas: <strong>{total_failures || 0}</strong></span>
            </div>
          </div>

          {/* TMEF: Tiempo Promedio Entre Fallas */}
          <div className="card" style={{ padding: '1.5rem', borderLeft: '5px solid #0284c7', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confiabilidad del Activo
                </span>
                <h4 style={{ margin: '0.35rem 0 0.5rem 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: 700 }}>
                  🛡️ Tiempo promedio entre fallas (TMEF)
                </h4>
              </div>
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                MTBF
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.75rem 0' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: '800', color: tmef_hours !== null ? '#0284c7' : '#16a34a' }}>
                {tmef_hours !== null ? `${tmef_hours} hs` : 'Sin fallas'}
              </span>
              {tmef_hours === null && (
                <span style={{ fontSize: '0.9rem', color: '#16a34a', fontWeight: '600' }}>
                  (100% Operativo)
                </span>
              )}
            </div>

            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
              Intervalo promedio de operación continua de los equipos sin presentar fallas.
            </p>

            <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>Tiempo total operativo: <strong>{total_operating_hours || 0} hs</strong></span>
              <span>Número total de paradas: <strong>{total_failures || 0}</strong></span>
            </div>
          </div>
        </div>
      </div>
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
        onClick={() => setActiveTab('rpmto001')}
        style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: activeTab === 'rpmto001' ? 'bold' : 'normal', color: activeTab === 'rpmto001' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'rpmto001' ? '3px solid var(--primary)' : 'none' }}
      >
        📋 RPMTO001
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

  // Opciones Oficiales RPMTO001
  const RPMTO_STATUSES = [
    { value: 'Azul: En posibilidad de realización', label: '🔵 Azul: En posibilidad de realización (insumos disponibles)', short: 'Posibilidad de realización', bg: '#dbeafe', color: '#1e3a8a', border: '#93c5fd', badgeBg: '#1e40af' },
    { value: 'Amarillo: Tarea pendiente insumos', label: '🟡 Amarillo: Tarea pendiente (comprar/fabricar insumos)', short: 'Pendiente insumos', bg: '#fef9c3', color: '#713f12', border: '#fde047', badgeBg: '#854d0e' },
    { value: 'Verde: Tarea realizada', label: '🟢 Verde: Tarea realizada', short: 'Realizada', bg: '#dcfce7', color: '#14532d', border: '#86efac', badgeBg: '#166534' },
    { value: 'Rojo: Tarea cancelada', label: '🔴 Rojo: Tarea cancelada', short: 'Cancelada', bg: '#fee2e2', color: '#7f1d1d', border: '#fca5a5', badgeBg: '#991b1b' }
  ];

  const formatMachineCodeOnly = (str) => {
    if (!str) return '-';
    const clean = str.trim();
    const parenMatch = clean.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1].trim().length <= 10) {
      return parenMatch[1].trim();
    }
    if (clean.includes(' - ')) {
      const parts = clean.split(' - ').map(p => p.trim());
      if (parts[0].length <= 8) return parts[0];
      if (parts[1] && parts[1].length <= 8) return parts[1];
      return parts[0];
    }
    return clean;
  };

  const getRpmtoRowStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('verde') || s.includes('realizada')) {
      return { background: '#dcfce7', color: '#14532d', borderBottom: '1px solid #bbf7d0', isClosed: true };
    }
    if (s.includes('amarillo') || s.includes('pendiente')) {
      return { background: '#fef9c3', color: '#713f12', borderBottom: '1px solid #fef08a', isClosed: false };
    }
    if (s.includes('azul') || s.includes('posibilidad')) {
      return { background: '#dbeafe', color: '#1e3a8a', borderBottom: '1px solid #bfdbfe', isClosed: false };
    }
    if (s.includes('rojo') || s.includes('cancelada')) {
      return { background: '#fee2e2', color: '#7f1d1d', borderBottom: '1px solid #fecaca', isClosed: true };
    }
    return { background: '#ffffff', color: '#1e293b', borderBottom: '1px solid #e2e8f0', isClosed: false };
  };

  const getCriticalityBadge = (val) => {
    const n = parseInt(val, 10) || 50;
    let bg = '#e0f2fe';
    let text = '#0369a1';
    if (n >= 80) {
      bg = '#fee2e2';
      text = '#991b1b';
    } else if (n >= 50) {
      bg = '#fef3c7';
      text = '#92400e';
    }
    return (
      <span style={{ background: bg, color: text, padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
        {n} / 100
      </span>
    );
  };

  const handleOpenRpmtoModal = (taskToEdit = null) => {
    if (taskToEdit) {
      setRpmtoEditingTask(taskToEdit);
      setRpmtoForm({
        id: taskToEdit.id,
        status: taskToEdit.status || 'Azul: En posibilidad de realización',
        machine_code: taskToEdit.machine_code || '',
        pending_work: taskToEdit.pending_work || '',
        criticality: taskToEdit.criticality || 50,
        requested_by: taskToEdit.requested_by || '',
        request_date: taskToEdit.request_date_fmt || (taskToEdit.request_date ? taskToEdit.request_date.slice(0, 10) : new Date().toISOString().slice(0, 10)),
        execution_date: taskToEdit.execution_date_fmt || (taskToEdit.execution_date ? taskToEdit.execution_date.slice(0, 10) : ''),
        supplies_needed: taskToEdit.supplies_needed || '',
        supplies_status: taskToEdit.supplies_status || 'Recursos disponibles',
        observation: taskToEdit.observation || ''
      });
    } else {
      setRpmtoEditingTask(null);
      setRpmtoForm({
        id: null,
        status: 'Azul: En posibilidad de realización',
        machine_code: '',
        pending_work: '',
        criticality: 50,
        requested_by: '',
        request_date: new Date().toISOString().slice(0, 10),
        execution_date: '',
        supplies_needed: '',
        supplies_status: 'Recursos disponibles',
        observation: ''
      });
    }
    setRpmtoModalOpen(true);
  };

  const handleSaveRpmtoTask = async (e) => {
    e.preventDefault();
    if (!rpmtoForm.pending_work.trim()) {
      alert('Por favor describe el trabajo pendiente.');
      return;
    }
    setRpmtoSaving(true);
    try {
      const isEdit = Boolean(rpmtoForm.id);
      const url = '/api/rpmto001';
      const method = isEdit ? 'PUT' : 'POST';
      const payload = {
        ...rpmtoForm,
        plant: user.plant
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setRpmtoModalOpen(false);
        fetchData('rpmto001', user.plant);
      } else {
        alert(data.error || 'Error al guardar la tarea');
      }
    } catch (err) {
      console.error('Error saving RPMTO task:', err);
      alert('Error de conexión al guardar tarea');
    } finally {
      setRpmtoSaving(false);
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      setRpmtoTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      const res = await fetch('/api/rpmto001', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });
      if (!res.ok) {
        fetchData('rpmto001', user.plant);
      }
    } catch (err) {
      console.error('Error changing status:', err);
      fetchData('rpmto001', user.plant);
    }
  };

  const handleDeleteRpmtoTask = async (taskId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea de la agenda?')) return;
    try {
      const res = await fetch(`/api/rpmto001?id=${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setRpmtoTasks(prev => prev.filter(t => t.id !== taskId));
      } else {
        alert('Error al eliminar la tarea');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Filtrado dinámico de tareas RPMTO001
  const uniqueRpmtoMachines = [...new Set(rpmtoTasks.map(t => formatMachineCodeOnly(t.machine_code)))].filter(x => x && x !== '-').sort();

  const filteredRpmtoTasks = rpmtoTasks.filter(t => {
    const rowStyle = getRpmtoRowStyle(t.status);
    // Si no está en "ver todas", ocultar realizadas y canceladas
    if (!rpmtoShowAll && rowStyle.isClosed) {
      return false;
    }
    if (rpmtoFilterStatus && t.status !== rpmtoFilterStatus) {
      return false;
    }
    if (rpmtoFilterMachine && formatMachineCodeOnly(t.machine_code) !== rpmtoFilterMachine) {
      return false;
    }
    if (rpmtoSearch) {
      const term = rpmtoSearch.toLowerCase();
      const mach = (t.machine_code || '').toLowerCase();
      const work = (t.pending_work || '').toLowerCase();
      const req = (t.requested_by || '').toLowerCase();
      const sup = (t.supplies_needed || '').toLowerCase();
      const obs = (t.observation || '').toLowerCase();
      if (!mach.includes(term) && !work.includes(term) && !req.includes(term) && !sup.includes(term) && !obs.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const exportRpmtoCSV = () => {
    if (filteredRpmtoTasks.length === 0) return;
    const headers = ['ID', 'Estado Tarea', 'Codigo Maquina', 'Trabajos Pendientes', 'Criterio Criticidad', 'Solicito', 'Fecha Solicitud', 'Fecha Ejecucion', 'Insumos Necesarios', 'Estado Insumos', 'Observacion'];
    const rows = filteredRpmtoTasks.map(t => [
      t.id,
      `"${t.status || ''}"`,
      `"${t.machine_code || ''}"`,
      `"${(t.pending_work || '').replace(/"/g, '""')}"`,
      t.criticality || 50,
      `"${t.requested_by || ''}"`,
      t.request_date_fmt || t.request_date || '',
      t.execution_date_fmt || t.execution_date || '',
      `"${(t.supplies_needed || '').replace(/"/g, '""')}"`,
      `"${t.supplies_status || ''}"`,
      `"${(t.observation || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RPMTO001_Agenda_${user?.plant || 'PLANTA'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

        {/* TAB: RPMTO001 */}
        {activeTab === 'rpmto001' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Panel de Controles y Cabecera de la Agenda RPMTO001 */}
            <div className="card" style={{ padding: '1.5rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.35rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📋 Agenda de Tareas Pendientes (RPMTO001)
                  </h2>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Planta: <strong>{user.plant}</strong> | Gestión y planificación de trabajos pendientes, criticidad y recursos
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Toggle para ver todas vs solo pendientes */}
                  <button
                    onClick={() => setRpmtoShowAll(!rpmtoShowAll)}
                    className="btn"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      background: rpmtoShowAll ? '#334155' : '#e2e8f0',
                      color: rpmtoShowAll ? '#fff' : '#1e293b',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {rpmtoShowAll ? '👁️ Mostrando Todas (incluye cerradas)' : '⏳ Mostrando solo Activas / Pendientes'}
                  </button>

                  <button
                    onClick={() => handleOpenRpmtoModal()}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 'bold' }}
                  >
                    ➕ Nueva Tarea Pendiente
                  </button>

                  <button
                    onClick={exportRpmtoCSV}
                    disabled={filteredRpmtoTasks.length === 0}
                    className="btn"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#0284c7', color: '#fff' }}
                  >
                    📥 Exportar CSV
                  </button>
                </div>
              </div>

              {/* Leyenda de Estados y Colores Oficiales */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', color: '#1e3a8a', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  🔵 <strong>Azul:</strong> Posibilidad de realización (insumos listos)
                </div>
                <div style={{ background: '#fef9c3', border: '1px solid #fde047', color: '#713f12', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  🟡 <strong>Amarillo:</strong> Pendiente (comprar/fabricar insumos)
                </div>
                <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#14532d', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  🟢 <strong>Verde:</strong> Tarea realizada (cerrada)
                </div>
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#7f1d1d', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
                  🔴 <strong>Rojo:</strong> Tarea cancelada (cerrada)
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.3rem' }}>
                    Filtrar por Estado
                  </label>
                  <select
                    value={rpmtoFilterStatus}
                    onChange={(e) => setRpmtoFilterStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="">Todos los estados visibles</option>
                    {RPMTO_STATUSES.map(st => (
                      <option key={st.value} value={st.value}>{st.short}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.3rem' }}>
                    Filtrar por Máquina / Código
                  </label>
                  <select
                    value={rpmtoFilterMachine}
                    onChange={(e) => setRpmtoFilterMachine(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="">Todas las máquinas</option>
                    {uniqueRpmtoMachines.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', marginBottom: '0.3rem' }}>
                    Buscar en Agenda
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar tarea, solicitó, insumos..."
                    value={rpmtoSearch}
                    onChange={(e) => setRpmtoSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Tabla Agenda RPMTO001 con Renglones Pintados */}
            <div className="card" style={{ padding: '0', overflowX: 'auto', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#fff', borderBottom: '2px solid #0f172a' }}>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '180px' }}>Estado tarea</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '90px' }}>Código</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '240px' }}>Trabajos pendientes</th>
                    <th style={{ padding: '0.85rem 0.65rem', textAlign: 'center', minWidth: '95px' }}>Criterio</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '110px' }}>Solicitó</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '115px' }}>Fecha solicitud</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '115px' }}>Fecha ejecución</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '160px' }}>Insumos necesarios</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '150px' }}>Estado insumos</th>
                    <th style={{ padding: '0.85rem 0.65rem', minWidth: '160px' }}>Observación</th>
                    <th style={{ padding: '0.85rem 0.65rem', textAlign: 'center', minWidth: '90px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRpmtoTasks.map(t => {
                    const rowStyle = getRpmtoRowStyle(t.status);
                    return (
                      <tr
                        key={t.id}
                        style={{
                          background: rowStyle.background,
                          color: rowStyle.color,
                          borderBottom: rowStyle.borderBottom,
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {/* 1. Estado tarea (Selector dinámico in-situ) */}
                        <td style={{ padding: '0.75rem 0.65rem' }}>
                          <select
                            value={t.status}
                            onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.82rem',
                              fontWeight: 'bold',
                              border: '1px solid rgba(0,0,0,0.15)',
                              background: '#fff',
                              color: rowStyle.color,
                              cursor: 'pointer'
                            }}
                          >
                            {RPMTO_STATUSES.map(st => (
                              <option key={st.value} value={st.value}>{st.short}</option>
                            ))}
                          </select>
                        </td>

                        {/* 2. Código */}
                        <td style={{ padding: '0.75rem 0.65rem', fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          {formatMachineCodeOnly(t.machine_code)}
                        </td>

                        {/* 3. Trabajos pendientes */}
                        <td style={{ padding: '0.75rem 0.65rem', fontWeight: 600 }}>
                          {t.pending_work}
                        </td>

                        {/* 4. Criterio (10 a 100) */}
                        <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center' }}>
                          {getCriticalityBadge(t.criticality)}
                        </td>

                        {/* 5. Solicitó */}
                        <td style={{ padding: '0.75rem 0.65rem' }}>
                          {t.requested_by || '-'}
                        </td>

                        {/* 6. Fecha solicitud */}
                        <td style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap' }}>
                          {t.request_date_fmt || t.request_date || '-'}
                        </td>

                        {/* 7. Fecha ejecución */}
                        <td style={{ padding: '0.75rem 0.65rem', whiteSpace: 'nowrap' }}>
                          {t.execution_date_fmt || t.execution_date || '-'}
                        </td>

                        {/* 8. Insumos necesarios */}
                        <td style={{ padding: '0.75rem 0.65rem' }}>
                          {t.supplies_needed || '-'}
                        </td>

                        {/* 9. Estado insumos */}
                        <td style={{ padding: '0.75rem 0.65rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 'bold',
                            background: t.supplies_status === 'Recursos disponibles' ? '#dcfce7' : '#fee2e2',
                            color: t.supplies_status === 'Recursos disponibles' ? '#166534' : '#991b1b'
                          }}>
                            {t.supplies_status || 'Recursos disponibles'}
                          </span>
                        </td>

                        {/* 10. Observación */}
                        <td style={{ padding: '0.75rem 0.65rem', fontSize: '0.85rem' }}>
                          {t.observation || '-'}
                        </td>

                        {/* 11. Acciones */}
                        <td style={{ padding: '0.75rem 0.65rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleOpenRpmtoModal(t)}
                            title="Editar tarea completa"
                            style={{
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              marginRight: '0.35rem'
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteRpmtoTask(t.id)}
                            title="Eliminar de la agenda"
                            style={{
                              background: '#fff',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRpmtoTasks.length === 0 && (
                    <tr>
                      <td colSpan="11" style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b', background: '#fff' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>No hay tareas en la agenda con los filtros actuales</h4>
                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem' }}>
                          {!rpmtoShowAll ? 'Las tareas realizadas o canceladas están ocultas. Puedes usar el botón "Mostrando solo Activas" para ver el histórico completo.' : 'No se encontraron registros.'}
                        </p>
                        <button
                          onClick={() => handleOpenRpmtoModal()}
                          className="btn btn-primary"
                          style={{ padding: '0.5rem 1.25rem' }}
                        >
                          ➕ Agregar Primera Tarea
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MODAL CREAR / EDITAR TAREA RPMTO001 */}
            {rpmtoModalOpen && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
              }}>
                <div className="card" style={{
                  width: '100%',
                  maxWidth: '700px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  background: '#fff',
                  padding: '2rem',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>
                      {rpmtoEditingTask ? '✏️ Editar Tarea de Agenda RPMTO001' : '➕ Nueva Tarea Pendiente (RPMTO001)'}
                    </h3>
                    <button
                      onClick={() => setRpmtoModalOpen(false)}
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSaveRpmtoTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Fila 1: Estado tarea y Código máquina */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Estado tarea *
                        </label>
                        <select
                          value={rpmtoForm.status}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, status: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          {RPMTO_STATUSES.map(st => (
                            <option key={st.value} value={st.value}>{st.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Código máquina *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: S07, H01, P05"
                          list="rpmto-plant-machines"
                          value={rpmtoForm.machine_code}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, machine_code: e.target.value.toUpperCase() })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                        <datalist id="rpmto-plant-machines">
                          {machineAvailability.map(m => {
                            const code = formatMachineCodeOnly(m.name);
                            return (
                              <option key={m.id} value={code}>
                                {code} - {m.name} ({m.sector})
                              </option>
                            );
                          })}
                        </datalist>
                      </div>
                    </div>

                    {/* Fila 2: Trabajos pendientes */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                        Trabajos pendientes a resolver *
                      </label>
                      <textarea
                        rows="3"
                        placeholder="Ej: Realizar un análisis de proveedores para filtros del autoelevador S07..."
                        value={rpmtoForm.pending_work}
                        onChange={(e) => setRpmtoForm({ ...rpmtoForm, pending_work: e.target.value })}
                        required
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                      />
                    </div>

                    {/* Fila 3: Criterio criticidad y Solicitó */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Criterio (Criticidad 10 a 100) *
                        </label>
                        <select
                          value={rpmtoForm.criticality}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, criticality: parseInt(e.target.value, 10) })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
                            <option key={val} value={val}>
                              {val} {val >= 80 ? '(Alta Criticidad)' : val >= 50 ? '(Media)' : '(Baja)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Solicitó (Persona / Área)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Aguirre, Producción, etc."
                          value={rpmtoForm.requested_by}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, requested_by: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    {/* Fila 4: Fechas de Solicitud y Ejecución */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Fecha solicitud
                        </label>
                        <input
                          type="date"
                          value={rpmtoForm.request_date}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, request_date: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Fecha estimada de ejecución
                        </label>
                        <input
                          type="date"
                          value={rpmtoForm.execution_date}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, execution_date: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    {/* Fila 5: Insumos necesarios y Estado insumos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Insumos necesarios
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 2 Filtros de aceite, sellos hidráulicos..."
                          value={rpmtoForm.supplies_needed}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, supplies_needed: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                          Estado insumos *
                        </label>
                        <select
                          value={rpmtoForm.supplies_status}
                          onChange={(e) => setRpmtoForm({ ...rpmtoForm, supplies_status: e.target.value })}
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        >
                          <option value="Recursos disponibles">Recursos disponibles</option>
                          <option value="Necesario compra/fabricación">Necesario compra/fabricación</option>
                        </select>
                      </div>
                    </div>

                    {/* Fila 6: Observaciones */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: '#334155', marginBottom: '0.3rem' }}>
                        Observación
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Observaciones adicionales, seguimiento con compras, etc..."
                        value={rpmtoForm.observation}
                        onChange={(e) => setRpmtoForm({ ...rpmtoForm, observation: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', resize: 'vertical' }}
                      />
                    </div>

                    {/* Botones de acción */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                      <button
                        type="button"
                        onClick={() => setRpmtoModalOpen(false)}
                        className="btn"
                        style={{ padding: '0.6rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={rpmtoSaving}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.5rem', fontWeight: 'bold' }}
                      >
                        {rpmtoSaving ? 'Guardando...' : (rpmtoEditingTask ? '💾 Actualizar Tarea' : '➕ Guardar en Agenda')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
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

            {/* SECCIÓN SL1: INDICADORES MENSUALES CLAVE */}
            {user.plant === 'SL1' && metrics?.sl1KPIs && (
              <>
                {renderReliabilityKpis(metrics.sl1KPIs.reliabilityMetrics || metrics.reliabilityMetrics)}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Indicadores de Disponibilidad de Equipos (Planta SL1)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    
                    {/* 1) H08 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>1) Disponibilidad H08</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina H08</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadH08)}
                    </div>

                    {/* 2) H09 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>2) Disponibilidad H09</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina H09</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadH09)}
                    </div>

                    {/* 3) MEP02 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>3) Disponibilidad MEP02</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina MEP02</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadMEP02)}
                    </div>

                    {/* 4) Media P08-P09 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #0284c7' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>4) Disponibilidad media P08-P09</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio de máquinas P08 y P09</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadMediaP08P09)}
                    </div>

                    {/* 5) Menor disponibilidad Puentes Grúas */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #d97706' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>5) Menor disponibilidad Puentes Grúas</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {metrics.sl1KPIs.menorPuenteGruaNombre ? `Equipo: ${metrics.sl1KPIs.menorPuenteGruaNombre}` : 'Mínimo valor de puentes grúas'}
                        </span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.menorDisponibilidadPuentesGruas)}
                    </div>

                    {/* 6) Menor disponibilidad Tejedoras */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #7c3aed' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>6) Menor disponibilidad Tejedoras</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {metrics.sl1KPIs.menorTejedoraNombre ? `Equipo: ${metrics.sl1KPIs.menorTejedoraNombre}` : 'Mínimo valor de tejedoras'}
                        </span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.menorDisponibilidadTejedoras)}
                    </div>

                    {/* 7) Disponibilidad media autoelevadores */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #059669' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>7) Disponibilidad media Autoelevadores</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio de máquinas S16 y SA02</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadMediaAutoelevadores)}
                    </div>

                  </div>
                </div>

                {/* SUCURSAL COMERCIAL SAN LUIS */}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🏪 Indicadores de Disponibilidad — Sucursal Comercial San Luis
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>

                    {/* 1) R39 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>1) Disponibilidad R39</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina R39</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadR39)}
                    </div>

                    {/* 2) R40 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>2) Disponibilidad R40</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina R40</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadR40)}
                    </div>

                    {/* 3) R43 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>3) Disponibilidad R43</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina R43</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadR43)}
                    </div>

                    {/* 4) R44 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>4) Disponibilidad R44</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina R44</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadR44)}
                    </div>

                    {/* 5) Q03 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>5) Disponibilidad Q03</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina Q03</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadQ03)}
                    </div>

                    {/* 6) S09 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>6) Disponibilidad S09</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina S09</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadS09)}
                    </div>

                    {/* 7) S14 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>7) Disponibilidad S14</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina S14</span>
                      </div>
                      {renderKpiBadge(metrics.sl1KPIs.disponibilidadS14)}
                    </div>

                  </div>
                </div>

                {/* HORAS HOMBRE METRICS (8 AL 11 DE SL1) */}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⏱️ Distribución de Horas Hombre (% HH Aprobadas)
                  </h3>

                  <div style={{ marginBottom: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1.25rem', borderRadius: '6px', fontSize: '0.95rem', color: '#166534', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>📌 Total Horas Hombre cargadas en el período: <strong>{metrics.sl1KPIs.hhMetrics?.totalHHLoaded} hs</strong></span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    
                    {/* 8) % HH Correctivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>8) TRABAJOS CORRECTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {metrics.sl1KPIs.hhMetrics?.pctHHCorrectivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl1KPIs.hhMetrics?.hhCorrectivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Tareas en "Fallas"</span>
                    </div>

                    {/* 9) % HH Preventivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>9) TRABAJOS PREVENTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>
                          {metrics.sl1KPIs.hhMetrics?.pctHHPreventivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl1KPIs.hhMetrics?.hhPreventivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Preventivos condicional/sistemáticos</span>

                      {metrics.sl1KPIs.hhMetrics?.preventivoBreakdown && metrics.sl1KPIs.hhMetrics.preventivoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #bbf7d0', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.sl1KPIs.hhMetrics.preventivoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 10) % HH Varios */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>10) TRABAJOS VARIOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
                          {metrics.sl1KPIs.hhMetrics?.pctHHVarios}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl1KPIs.hhMetrics?.hhVarios} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Mantenimiento edilicio / varios</span>

                      {metrics.sl1KPIs.hhMetrics?.variosBreakdown && metrics.sl1KPIs.hhMetrics.variosBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.sl1KPIs.hhMetrics.variosBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 11) % HH Ausentismo */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>11) AUSENTISMO / NO PRODUCTIVO</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#d97706' }}>
                          {metrics.sl1KPIs.hhMetrics?.pctHHAusentismo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.sl1KPIs.hhMetrics?.hhAusentismo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Ausentismo / no productivo</span>

                      {metrics.sl1KPIs.hhMetrics?.ausentismoBreakdown && metrics.sl1KPIs.hhMetrics.ausentismoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #fed7aa', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.sl1KPIs.hhMetrics.ausentismoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </>
            )}

            {/* SECCIÓN CBA: INDICADORES MENSUALES CLAVE */}
            {user.plant === 'CBA' && metrics?.cbaKPIs && (
              <>
                {renderReliabilityKpis(metrics.cbaKPIs.reliabilityMetrics || metrics.reliabilityMetrics)}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Indicadores de Disponibilidad de Equipos (Planta CBA)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {[
                      { num: 1, code: 'H01', desc: 'Schnell Formula' },
                      { num: 2, code: 'H02', desc: 'Schnell Coil' },
                      { num: 3, code: 'H03', desc: 'Schnell Pilotera CM PRO 1600' },
                      { num: 4, code: 'H04', desc: 'Schnell Acu6' },
                      { num: 5, code: 'H07', desc: 'Reta 12' },
                      { num: 6, code: 'P03', desc: 'Compresor Schulz Tornillo' },
                      { num: 7, code: 'T01', desc: 'Máquina T01' },
                      { num: 8, code: 'S02', desc: 'Autoelevador S02' },
                      { num: 9, code: 'S03', desc: 'Autoelevador S03' },
                      { num: 10, code: 'S04', desc: 'Autoelevador S04' },
                      { num: 11, code: 'PL01', desc: 'Planchadora Marafon' },
                      { num: 12, code: 'SR01', desc: 'Fraccionadora alambre' },
                      { num: 13, code: 'SR07', desc: 'Fraccionadora alambre' },
                      { num: 14, code: 'SR11', desc: 'Fraccionadora alambre' },
                      { num: 15, code: 'SR13', desc: 'Fraccionadora alambre grande' },
                      { num: 16, code: 'SR02', desc: 'Máquina de púas' },
                      { num: 17, code: 'SR03', desc: 'Máquina de púas' },
                      { num: 18, code: 'U01', desc: 'Separadora hierros' },
                      { num: 19, code: 'G07', desc: 'Dobladora de hierros' },
                      { num: 20, code: 'Q01', desc: 'Guillotina chapa acanalada' },
                      { num: 21, code: 'Q02', desc: 'Guillotina chapa trapezoidal' },
                      { num: 22, code: 'R03', desc: 'Puente Grúa PRODUCCION' },
                      { num: 23, code: 'R04', desc: 'Puente Grúa PRODUCCION' },
                      { num: 24, code: 'R05', desc: 'Puente Grúa PRODUCCION' },
                      { num: 25, code: 'R06', desc: 'Puente Grúa PRODUCCION' },
                      { num: 26, code: 'R20', desc: 'Puente Grúa PRODUCCION' },
                      { num: 27, code: 'R21', desc: 'Puente Grúa PRODUCCION' },
                      { num: 28, code: 'R22', desc: 'Puente Grúa PRODUCCION' },
                      { num: 29, code: 'R07', desc: 'Puente Grúa DEPOSITO' },
                      { num: 30, code: 'R08', desc: 'Puente Grúa DEPOSITO' },
                      { num: 31, code: 'R09', desc: 'Puente Grúa DEPOSITO' },
                      { num: 32, code: 'R10', desc: 'Puente Grúa DEPOSITO' },
                      { num: 33, code: 'R11', desc: 'Puente Grúa DEPOSITO' },
                      { num: 34, code: 'R12', desc: 'Puente Grúa DEPOSITO' },
                      { num: 35, code: 'R13', desc: 'Puente Grúa DEPOSITO' },
                      { num: 36, code: 'R14', desc: 'Puente Grúa DEPOSITO' },
                      { num: 37, code: 'R15', desc: 'Puente Grúa DEPOSITO' },
                      { num: 38, code: 'R16', desc: 'Puente Grúa DEPOSITO' },
                      { num: 39, code: 'R17', desc: 'Puente Grúa DEPOSITO' },
                      { num: 40, code: 'R18', desc: 'Puente Grúa DEPOSITO' },
                      { num: 41, code: 'R19', desc: 'Puente Grúa DEPOSITO' },
                      { num: 42, code: 'R23', desc: 'Puente Grúa DEPOSITO' },
                      { num: 43, code: 'R24', desc: 'Puente Grúa DEPOSITO' },
                      { num: 44, code: 'UR07', desc: 'Punzonadora neumatica aluminio' },
                      { num: 45, code: 'UR13', desc: 'Soldadora doble cabezal ozgenc' },
                      { num: 46, code: 'UR15', desc: 'Soldadora pvc 4 cabazales' },
                      { num: 47, code: 'UR16', desc: 'Limpiadora ozgenc' },
                      { num: 48, code: 'X100', desc: 'Balanza de camiones' }
                    ].map(item => (
                      <div key={item.code} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>{item.num}) Disponibilidad {item.code}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.desc}</span>
                        </div>
                        {renderKpiBadge(metrics.cbaKPIs.availabilities?.[item.code])}
                      </div>
                    ))}
                  </div>
                </div>

                {/* HORAS HOMBRE METRICS (49 AL 52 DE CBA) */}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⏱️ Distribución de Horas Hombre (% HH Aprobadas)
                  </h3>

                  <div style={{ marginBottom: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1.25rem', borderRadius: '6px', fontSize: '0.95rem', color: '#166534', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>📌 Total Horas Hombre cargadas en el período: <strong>{metrics.cbaKPIs.hhMetrics?.totalHHLoaded} hs</strong></span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>

                    {/* 49) % HH Correctivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>49) TRABAJOS CORRECTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {metrics.cbaKPIs.hhMetrics?.pctHHCorrectivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.cbaKPIs.hhMetrics?.hhCorrectivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Tareas en "Fallas"</span>
                    </div>

                    {/* 50) % HH Preventivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>50) TRABAJOS PREVENTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>
                          {metrics.cbaKPIs.hhMetrics?.pctHHPreventivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.cbaKPIs.hhMetrics?.hhPreventivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Preventivos condicional/sistemáticos</span>

                      {metrics.cbaKPIs.hhMetrics?.preventivoBreakdown && metrics.cbaKPIs.hhMetrics.preventivoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #bbf7d0', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.cbaKPIs.hhMetrics.preventivoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 51) % HH Varios */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>51) TRABAJOS VARIOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
                          {metrics.cbaKPIs.hhMetrics?.pctHHVarios}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.cbaKPIs.hhMetrics?.hhVarios} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Mantenimiento edilicio / varios</span>

                      {metrics.cbaKPIs.hhMetrics?.variosBreakdown && metrics.cbaKPIs.hhMetrics.variosBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.cbaKPIs.hhMetrics.variosBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 52) % HH Ausentismo */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>52) AUSENTISMO / NO PRODUCTIVO</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#d97706' }}>
                          {metrics.cbaKPIs.hhMetrics?.pctHHAusentismo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.cbaKPIs.hhMetrics?.hhAusentismo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Ausentismo / no productivo</span>

                      {metrics.cbaKPIs.hhMetrics?.ausentismoBreakdown && metrics.cbaKPIs.hhMetrics.ausentismoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #fed7aa', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.cbaKPIs.hhMetrics.ausentismoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </>
            )}

            {/* SECCIÓN PIL: INDICADORES MENSUALES CLAVE */}
            {user.plant === 'PIL' && metrics?.pilKPIs && (
              <>
                {renderReliabilityKpis(metrics.pilKPIs.reliabilityMetrics || metrics.reliabilityMetrics)}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Indicadores de Disponibilidad de Equipos (Planta PIL)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>

                    {/* 1) P10 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>1) Disponibilidad P10</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Compresor P10</span>
                      </div>
                      {renderKpiBadge(metrics.pilKPIs.disponibilidadP10)}
                    </div>

                    {/* 2) Menor disponibilidad Puentes Grúas */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #d97706' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>2) Menor disponibilidad Puentes Grúas</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {metrics.pilKPIs.menorPuenteGruaNombre ? `Equipo: ${metrics.pilKPIs.menorPuenteGruaNombre}` : 'Mínimo valor de puentes grúas'}
                        </span>
                      </div>
                      {renderKpiBadge(metrics.pilKPIs.menorDisponibilidadPuentesGruas)}
                    </div>

                    {/* 3) S11 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #059669' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>3) Disponibilidad S11</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Autoelevador S11</span>
                      </div>
                      {renderKpiBadge(metrics.pilKPIs.disponibilidadS11)}
                    </div>

                  </div>
                </div>

                {/* HORAS HOMBRE METRICS (4 AL 7 DE PIL) */}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⏱️ Distribución de Horas Hombre (% HH Aprobadas)
                  </h3>

                  <div style={{ marginBottom: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1.25rem', borderRadius: '6px', fontSize: '0.95rem', color: '#166534', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>📌 Total Horas Hombre cargadas en el período: <strong>{metrics.pilKPIs.hhMetrics?.totalHHLoaded} hs</strong></span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>

                    {/* 4) % HH Correctivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>4) TRABAJOS CORRECTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {metrics.pilKPIs.hhMetrics?.pctHHCorrectivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.pilKPIs.hhMetrics?.hhCorrectivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Tareas en "Fallas"</span>
                    </div>

                    {/* 5) % HH Preventivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>5) TRABAJOS PREVENTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>
                          {metrics.pilKPIs.hhMetrics?.pctHHPreventivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.pilKPIs.hhMetrics?.hhPreventivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Preventivos condicional/sistemáticos</span>

                      {metrics.pilKPIs.hhMetrics?.preventivoBreakdown && metrics.pilKPIs.hhMetrics.preventivoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #bbf7d0', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.pilKPIs.hhMetrics.preventivoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 6) % HH Varios */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>6) TRABAJOS VARIOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
                          {metrics.pilKPIs.hhMetrics?.pctHHVarios}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.pilKPIs.hhMetrics?.hhVarios} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Mantenimiento edilicio / varios</span>

                      {metrics.pilKPIs.hhMetrics?.variosBreakdown && metrics.pilKPIs.hhMetrics.variosBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.pilKPIs.hhMetrics.variosBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 7) % HH Ausentismo */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>7) AUSENTISMO / NO PRODUCTIVO</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#d97706' }}>
                          {metrics.pilKPIs.hhMetrics?.pctHHAusentismo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.pilKPIs.hhMetrics?.hhAusentismo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Ausentismo / no productivo</span>

                      {metrics.pilKPIs.hhMetrics?.ausentismoBreakdown && metrics.pilKPIs.hhMetrics.ausentismoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #fed7aa', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.pilKPIs.hhMetrics.ausentismoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </>
            )}

            {/* SECCIÓN RAM: INDICADORES MENSUALES CLAVE */}
            {user.plant === 'RAM' && metrics?.ramKPIs && (
              <>
                {renderReliabilityKpis(metrics.ramKPIs.reliabilityMetrics || metrics.reliabilityMetrics)}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Indicadores de Disponibilidad de Equipos (Planta RAM)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>

                    {/* 1) H06 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>1) Disponibilidad H06</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina H06</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadH06)}
                    </div>

                    {/* 2) Media REC01-REC02 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #0284c7' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>2) Disponibilidad media REC01-REC02</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio de máquinas REC01 y REC02</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadMediaREC01REC02)}
                    </div>

                    {/* 3) MEP01 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>3) Disponibilidad MEP01</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina MEP01</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadMEP01)}
                    </div>

                    {/* 4) P04 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>4) Disponibilidad P04</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina P04</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadP04)}
                    </div>

                    {/* 5) Menor disponibilidad Puentes Grúas */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #d97706' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>5) Menor disponibilidad Puentes Grúas</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {metrics.ramKPIs.menorPuenteGruaNombre ? `Equipo: ${metrics.ramKPIs.menorPuenteGruaNombre}` : 'Mínimo valor de puentes grúas'}
                        </span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.menorDisponibilidadPuentesGruas)}
                    </div>

                    {/* 6) TR02 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>6) Disponibilidad TR02</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina TR02</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadTR02)}
                    </div>

                    {/* 7) TR03 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>7) Disponibilidad TR03</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina TR03</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadTR03)}
                    </div>

                    {/* 8) TR04 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>8) Disponibilidad TR04</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Máquina TR04</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadTR04)}
                    </div>

                    {/* 9) DRUIDS01 */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0284c7' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>9) Disponibilidad DRUIDS01</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio general de las 8 líneas</span>
                        </div>
                        {renderKpiBadge(metrics.ramKPIs.disponibilidadDRUIDS01)}
                      </div>

                      {metrics.ramKPIs.druidsLineBreakdown && metrics.ramKPIs.druidsLineBreakdown.length > 0 && (
                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                          <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                            Desglose por líneas individuales:
                          </strong>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                            {metrics.ramKPIs.druidsLineBreakdown.map((item, idx) => {
                              const pct = item.availability_pct;
                              let bg = '#dcfce7';
                              let color = '#166534';
                              if (pct < 93) {
                                bg = '#fee2e2';
                                color = '#991b1b';
                              } else if (pct <= 96) {
                                bg = '#fef08a';
                                color = '#854d0e';
                              }
                              return (
                                <div key={idx} style={{ background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{item.line}:</span>
                                  <span style={{ background: bg, color: color, padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {pct}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 10) Media Autoelevadores */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #059669' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>10) Disponibilidad media Autoelevadores</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio de máquinas S05, S06 y S07</span>
                      </div>
                      {renderKpiBadge(metrics.ramKPIs.disponibilidadMediaAutoelevadores)}
                    </div>

                  </div>
                </div>

                {/* HORAS HOMBRE METRICS (11 AL 14 DE RAM) */}
                <div>
                  <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⏱️ Distribución de Horas Hombre (% HH Aprobadas)
                  </h3>

                  <div style={{ marginBottom: '1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1.25rem', borderRadius: '6px', fontSize: '0.95rem', color: '#166534', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span>📌 Total Horas Hombre cargadas en el período: <strong>{metrics.ramKPIs.hhMetrics?.totalHHLoaded} hs</strong></span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>

                    {/* 11) % HH Correctivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #dc2626' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>11) TRABAJOS CORRECTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#dc2626' }}>
                          {metrics.ramKPIs.hhMetrics?.pctHHCorrectivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.ramKPIs.hhMetrics?.hhCorrectivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Tareas en "Fallas"</span>
                    </div>

                    {/* 12) % HH Preventivos */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>12) TRABAJOS PREVENTIVOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>
                          {metrics.ramKPIs.hhMetrics?.pctHHPreventivo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.ramKPIs.hhMetrics?.hhPreventivo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Preventivos condicional/sistemáticos</span>

                      {metrics.ramKPIs.hhMetrics?.preventivoBreakdown && metrics.ramKPIs.hhMetrics.preventivoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #bbf7d0', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.ramKPIs.hhMetrics.preventivoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 13) % HH Varios */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #2563eb' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>13) TRABAJOS VARIOS</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2563eb' }}>
                          {metrics.ramKPIs.hhMetrics?.pctHHVarios}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.ramKPIs.hhMetrics?.hhVarios} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Mantenimiento edilicio / varios</span>

                      {metrics.ramKPIs.hhMetrics?.variosBreakdown && metrics.ramKPIs.hhMetrics.variosBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.ramKPIs.hhMetrics.variosBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 14) % HH Ausentismo */}
                    <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #d97706' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>14) AUSENTISMO / NO PRODUCTIVO</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#d97706' }}>
                          {metrics.ramKPIs.hhMetrics?.pctHHAusentismo}%
                        </span>
                        <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                          {metrics.ramKPIs.hhMetrics?.hhAusentismo} hs
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Ausentismo / no productivo</span>

                      {metrics.ramKPIs.hhMetrics?.ausentismoBreakdown && metrics.ramKPIs.hhMetrics.ausentismoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #fed7aa', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.ramKPIs.hhMetrics.ausentismoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </>
            )}

            {/* SECCIÓN SL2: INDICADORES MENSUALES CLAVE */}
            {user.plant === 'SL2' && metrics?.sl2KPIs && (
              <>
                {renderReliabilityKpis(metrics.sl2KPIs.reliabilityMetrics || metrics.reliabilityMetrics)}
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

                    {/* 7) Media P05-P06 */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #0284c7' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>7) Disponibilidad media P05-P06</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Promedio de máquinas P05 y P06</span>
                      </div>
                      {renderKpiBadge(metrics.sl2KPIs.disponibilidadMediaP05P06 ?? metrics.sl2KPIs.disponibilidadMediaP08P09)}
                    </div>

                    {/* 8) Menor disponibilidad Puentes Grúas */}
                    <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #d97706' }}>
                      <div>
                        <strong style={{ fontSize: '1.1rem', display: 'block', color: '#1e293b' }}>8) Menor disponibilidad Puentes Grúas</strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {metrics.sl2KPIs.menorPuenteGruaNombre ? `Equipo: ${metrics.sl2KPIs.menorPuenteGruaNombre}` : 'Mínimo valor de puentes grúas'}
                        </span>
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
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Preventivos condicional/sistemáticos</span>

                      {metrics.sl2KPIs.hhMetrics?.preventivoBreakdown && metrics.sl2KPIs.hhMetrics.preventivoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #bbf7d0', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.sl2KPIs.hhMetrics.preventivoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

                      {metrics.sl2KPIs.hhMetrics?.variosBreakdown && metrics.sl2KPIs.hhMetrics.variosBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.sl2KPIs.hhMetrics.variosBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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

                      {metrics.sl2KPIs.hhMetrics?.ausentismoBreakdown && metrics.sl2KPIs.hhMetrics.ausentismoBreakdown.length > 0 && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed #fed7aa', fontSize: '0.75rem', color: '#475569' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#1e293b' }}>Desglose por subcategoría:</strong>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            {metrics.sl2KPIs.hhMetrics.ausentismoBreakdown.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {item.name}:</span>
                                <strong>{item.hours} hs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#b91c1c' }}>⚙️ Máquinas Más Intervenidas y Confiabilidad</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Top máquinas con mayor cantidad de intervenciones y sus indicadores de TMDR y TMEF.</p>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem' }}>Máquina</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Total Tareas</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Fallas</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Parada Falla</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: '#ea580c' }}>TMDR</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: '#0284c7' }}>TMEF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.machineMetrics?.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{m.interventions}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: m.failure_interventions > 0 ? '#dc2626' : '#16a34a' }}>
                          {m.failure_interventions || 0}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>
                          {m.failure_stop_minutes > 0 ? `${m.failure_stop_minutes} min` : '-'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#ea580c' }}>
                          {m.tmdr_minutes > 0 ? `${m.tmdr_minutes} min` : '-'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', color: '#0284c7' }}>
                          {m.tmef_hours !== null ? `${m.tmef_hours} hs` : (m.operating_hours > 0 ? `${m.operating_hours} hs (Sin fallas)` : '-')}
                        </td>
                      </tr>
                    ))}
                    {(!metrics?.machineMetrics || metrics.machineMetrics.length === 0) && (
                      <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>Sin datos en este período</td></tr>
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
