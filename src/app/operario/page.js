"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TaskRow from "./TaskRow";

export default function OperarioView() {
  const router = useRouter();
  const [plant, setPlant] = useState("");
  const [fecha, setFecha] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [turno, setTurno] = useState("");

  const [operariosList, setOperariosList] = useState([]);
  const [options, setOptions] = useState({ machines: [], recordTypes: [], natureTypes: [], buildingCategories: [], absenceReasons: [] });

  const [tasks, setTasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayTasks, setTodayTasks] = useState([]);
  const [machinesOut, setMachinesOut] = useState([]);

  useEffect(() => {
    const savedPlant = sessionStorage.getItem("mantenimiento_current_plant");
    if (!savedPlant) {
      router.push("/");
    } else {
      setPlant(savedPlant);
      setFecha(new Date().toISOString().split('T')[0]);

      let uId = null;
      const userRaw = sessionStorage.getItem("mantenimiento_user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setCurrentUser(user);
        uId = user.id;
      }

      // Cargar operarios (para los acompañantes)
      fetch(`/api/operarios?plant=${savedPlant}`)
        .then(res => res.json())
        .then(data => {
          if (data.operators) setOperariosList(data.operators);
        });

      // Cargar datos de listas y máquinas
      fetch(`/api/data?plant=${savedPlant}`)
        .then(res => res.json())
        .then(data => {
          setOptions(data);
          setTasks(prev => prev.length === 0 ? [{
            record_type: '', description: '', start_time_h: '', start_time_m: '00', end_time_h: '', end_time_m: '00',
            start_out_date: '', start_out_h: '', start_out_m: '00', end_out_date: '', end_out_h: '', end_out_m: '00',
            machine_id: '', nature: '', deviation: '', category: '', final_state: 'Funcional', companions: []
          }] : prev);
        });

      fetchSidebarData(savedPlant, uId);
    }
  }, [router]);

  const fetchSidebarData = async (p, uId, f) => {
    if (!p || !uId) return;
    try {
      // Tareas del operario
      const resT = await fetch(`/api/tareas/history?plant=${p}`);
      const dataT = await resT.json();
      if (dataT.tasks) {
        const targetDate = f || new Date().toISOString().split('T')[0];
        setTodayTasks(dataT.tasks.filter(t => {
          let hasUser = t.operator_id === uId;
          if (!hasUser) {
            try {
              const comps = typeof t.companions === 'string' ? JSON.parse(t.companions) : (t.companions || []);
              if (Array.isArray(comps) && comps.includes(uId)) hasUser = true;
            } catch(e){}
          }
          return hasUser && t.task_date && t.task_date.startsWith(targetDate);
        }));
      }
      // Máquinas caídas
      const resM = await fetch(`/api/machines/out-of-service?plant=${p}`);
      const dataM = await resM.json();
      if (dataM.machines) {
        setMachinesOut(dataM.machines.filter(m => !m.is_resolved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (plant && currentUser && fecha) {
      fetchSidebarData(plant, currentUser.id, fecha);
    }
  }, [fecha, plant, currentUser]);

  const addTask = () => {
    setTasks(prev => {
      let nextStartH = '';
      let nextStartM = '00';

      if (prev.length > 0) {
        const lastTask = prev[prev.length - 1];
        if (lastTask.end_time_h) nextStartH = lastTask.end_time_h;
        if (lastTask.end_time_m) nextStartM = lastTask.end_time_m;
      }

      return [...prev, {
        record_type: '', description: '', start_time_h: nextStartH, start_time_m: nextStartM, end_time_h: '', end_time_m: '00',
        start_out_date: '', start_out_h: '', start_out_m: '00', end_out_date: '', end_out_h: '', end_out_m: '00',
        machine_id: '', nature: '', deviation: '', category: '', final_state: 'Funcional', companions: []
      }];
    });
  };

  const addTaskForMachine = (m) => {
    let sDate = '';
    let sH = '00';
    let sM = '00';
    if (m.start_time_fmt) {
      const parts = m.start_time_fmt.split(' ');
      if (parts.length === 2) {
        const [day, month, year] = parts[0].split('/');
        sDate = `${year}-${month}-${day}`;
        const [hh, mm] = parts[1].split(':');
        sH = hh;
        sM = mm;
      }
    }

    setTasks([{
      record_type: 'Mantenimiento de máquina (OT)',
      description: '',
      start_time_h: '', start_time_m: '00', end_time_h: '', end_time_m: '00',
      start_out_date: sDate, start_out_h: sH, start_out_m: sM, end_out_date: '', end_out_h: '', end_out_m: '00',
      machine_id: m.machine_id,
      nature: 'Falla',
      deviation: m.deviation || '',
      category: '',
      final_state: 'Funcional',
      affects_availability: true,
      lock_start_out: true,
      lock_machine: true,
      companions: []
    }]);
  };

  const updateTask = (index, updatedTask) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    setTasks(newTasks);
  };

  const removeTask = (index) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validar que todas las tareas tengan descripción completada
      const tasksSinDescripcion = tasks.filter(t => !t.description?.trim());
      if (tasksSinDescripcion.length > 0) {
        alert(`Por favor, completa el campo "Descripción de la tarea" en ${tasksSinDescripcion.length > 1 ? 'todas las tareas' : 'la tarea'} antes de enviar.`);
        setIsSubmitting(false);
        return;
      }

      // Validar que todos los registros de mantenimiento tengan desviación completada
      const tasksSinDesviacion = tasks.filter(t => t.record_type === 'Mantenimiento de máquina (OT)' && !t.deviation?.trim());
      if (tasksSinDesviacion.length > 0) {
        alert(`Por favor, completa el campo "Desviación detectada" en ${tasksSinDesviacion.length > 1 ? 'todas las tareas' : 'la tarea'} antes de enviar.`);
        setIsSubmitting(false);
        return;
      }


      // Procesar tiempos para el backend
      const formattedTasks = tasks.map(t => ({
        ...t,
        start_time: `${t.start_time_h}:${t.start_time_m}`,
        end_time: `${t.end_time_h}:${t.end_time_m}`
      }));

      // Formato para enviar al backend
      const payload = {
        plant,
        task_date: fecha,
        shift: turno,
        operator_id: currentUser?.id,
        tasks: formattedTasks
      };

      const response = await fetch('/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (response.ok) {
        alert("¡Jornada guardada con éxito!");
        // Reiniciar tareas
        setTasks([]);
        addTask();
        fetchSidebarData(plant, currentUser?.id, fecha);
      } else {
        alert("Error al guardar: " + resData.error);
      }
    } catch (error) {
      alert("Error de red al guardar: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!plant) return <p style={{ padding: "2rem", textAlign: "center" }}>Cargando...</p>;

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 5%', background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo-serin.png" alt="Grupo Serin" style={{ height: "32px", borderRadius: "4px" }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Planta {plant}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Operario: {currentUser.full_name}</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
          Salir
        </button>
      </header>

      <main style={{ maxWidth: "100%", padding: "2rem 5%" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "nowrap" }}>

          {/* Panel Lateral: Historial y Máquinas */}
          <div style={{ flex: 1, minWidth: "280px", maxWidth: "380px", position: "sticky", top: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ margin: 0 }}>
              <h2 className="card-title" style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1rem", marginTop: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <span>Tus tareas del día</span>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: "0.3rem", fontSize: "0.9rem", border: "1px solid #d1d5db", borderRadius: "4px", width: "100%" }} />
              </h2>
              {todayTasks.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", padding: "1.5rem 0" }}>
                  Aún no has guardado tareas para esta fecha.
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {todayTasks.map(t => (
                    <li key={t.id} style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', fontSize: '0.9rem' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block' }}>{t.task_type}</strong>
                      {t.machine_name && <span>{t.machine_name} <br /></span>}
                      <span style={{ color: '#64748b' }}>{t.start_time_fmt} - {t.end_time_fmt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card" style={{ margin: 0, border: "1px solid #fecaca", background: "#fff5f5" }}>
              <h2 className="card-title" style={{ fontSize: "1.1rem", borderBottom: "1px solid #fecaca", paddingBottom: "0.75rem", marginBottom: "1rem", marginTop: 0, color: "#dc2626" }}>
                Máquinas fuera de servicio
              </h2>
              {machinesOut.length === 0 ? (
                <div style={{ textAlign: "center", color: "#dc2626", fontSize: "0.9rem", padding: "1.5rem 0" }}>
                  No hay máquinas caídas registradas.
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {machinesOut.map(m => (
                    <li key={m.id} style={{ padding: '0.75rem', borderBottom: '1px solid #fecaca', fontSize: '0.9rem' }}>
                      <strong style={{ color: '#b91c1c', display: 'block' }}>{m.machine_name}</strong>
                      <span style={{ color: '#991b1b' }}>Desde: {m.start_time_fmt}</span>
                      <button
                        type="button"
                        onClick={() => addTaskForMachine(m)}
                        className="btn btn-primary"
                        style={{ display: 'block', marginTop: '0.5rem', width: '100%', fontSize: '0.8rem', padding: '0.4rem', background: '#dc2626', borderColor: '#b91c1c' }}
                      >
                        🛠️ Generar OT y Poner Funcional
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Panel Principal Derecho: Formulario */}
          <div className="card" style={{ flex: 2, minWidth: "320px" }}>
            <h2 className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>REGISTRO DIARIO DE ACTIVIDADES</span>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", background: "var(--bg-color)", padding: "0.25rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>Planta: {plant}</span>
              </div>
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Fecha</label>
                  <input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Turno</label>
                  <select required value={turno} onChange={(e) => setTurno(e.target.value)}>
                    <option value="">Seleccione...</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label>Operario principal</label>
                <div style={{ padding: "0.75rem", background: "#f3f4f6", borderRadius: "6px", border: "1px solid #d1d5db", fontWeight: 600 }}>
                  {currentUser ? currentUser.full_name : "Cargando..."}
                </div>
              </div>

              {/* Contenedor Dinámico de Tareas */}
              <div id="tareas-container">
                {tasks.map((task, index) => (
                  <TaskRow
                    key={index}
                    index={index}
                    task={task}
                    updateTask={updateTask}
                    removeTask={removeTask}
                    options={options}
                    plant={plant}
                    operariosList={operariosList}
                    currentOperator={currentUser?.id}
                  />
                ))}
              </div>

              {tasks.length > 0 && (() => {
                let total = 0;
                tasks.forEach(t => {
                  if (t.start_time_h && t.start_time_m && t.end_time_h && t.end_time_m) {
                    const sh = parseInt(t.start_time_h, 10) || 0;
                    const sm = parseInt(t.start_time_m, 10) || 0;
                    const eh = parseInt(t.end_time_h, 10) || 0;
                    const em = parseInt(t.end_time_m, 10) || 0;

                    let diff = (eh * 60 + em) - (sh * 60 + sm);
                    if (diff < 0) diff += 24 * 60; // cruza la medianoche
                    total += diff;
                  }
                });
                const h = Math.floor(total / 60);
                const m = total % 60;
                return (
                  <div style={{ textAlign: "right", marginTop: "1rem", marginBottom: "-1rem", fontSize: "1.1rem" }}>
                    Total acumulado: <span style={{ fontWeight: 700, color: "var(--primary)" }}>{h}h {m}m</span>
                  </div>
                );
              })()}

              <div className="form-group" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
                <button
                  type="button"
                  onClick={addTask}
                  className="btn"
                  style={{ width: "100%", background: "#2563eb", color: "#fff", border: "none", padding: "1rem", fontSize: "1.15rem", fontWeight: 700, borderRadius: "0.75rem", cursor: "pointer" }}
                >
                  ➕ AGREGAR OTRA TAREA A ESTA JORNADA
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-success"
                disabled={isSubmitting}
                style={{ width: "100%", fontSize: "1.15rem", padding: "1rem", fontWeight: 700, borderRadius: "0.75rem", cursor: "pointer" }}
              >
                {isSubmitting ? "GUARDANDO..." : "💾 FINALIZAR Y GUARDAR JORNADA"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
