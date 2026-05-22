"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TaskRow from "./TaskRow";

export default function OperarioView() {
  const router = useRouter();
  const [plant, setPlant] = useState("");
  const [fecha, setFecha] = useState("");
  const [operario, setOperario] = useState("");
  const [turno, setTurno] = useState("");
  
  const [operariosList, setOperariosList] = useState([]);
  const [options, setOptions] = useState({ machines: [], recordTypes: [], natureTypes: [], buildingCategories: [], absenceReasons: [] });
  
  const [tasks, setTasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedPlant = sessionStorage.getItem("mantenimiento_current_plant");
    if (!savedPlant) {
      router.push("/");
    } else {
      setPlant(savedPlant);
      setFecha(new Date().toISOString().split('T')[0]);

      // Cargar operarios
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
          // Inicializar el primer renglón una vez cargadas las opciones
          addTask();
        });
    }
  }, [router]);

  const addTask = () => {
    setTasks(prev => [...prev, {
      record_type: '', description: '', start_time: '', end_time: '',
      machine_id: '', nature: '', deviation: '', category: '', final_state: 'Funcional'
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
      const response = await fetch('/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant,
          task_date: fecha,
          shift: turno,
          operator_id: operario,
          tasks: tasks
        })
      });
      
      const resData = await response.json();
      if (response.ok) {
        alert("¡Jornada guardada con éxito!");
        // Reiniciar tareas
        setTasks([]);
        addTask();
      } else {
        alert("Error al guardar: " + resData.error);
      }
    } catch (error) {
      alert("Error de red al guardar: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plant) return <p style={{ padding: "2rem", textAlign: "center" }}>Cargando...</p>;

  return (
    <>
      <header>
        <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }}>
          <img src="/logo-serin.png" alt="Grupo Serin" style={{ height: "32px", borderRadius: "4px" }} />
          <span>MantenimientoApp</span>
        </Link>
      </header>

      <main style={{ maxWidth: "100%", padding: "2rem 5%" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "nowrap" }}>
          
          {/* Panel Lateral: Historial y Máquinas */}
          <div style={{ flex: 1, minWidth: "280px", maxWidth: "380px", position: "sticky", top: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ margin: 0 }}>
              <h2 className="card-title" style={{ fontSize: "1.1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1rem", marginTop: 0 }}>
                Tareas cargadas
              </h2>
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", padding: "1.5rem 0" }}>
                Aún no has guardado tareas hoy.
              </div>
            </div>
            <div className="card" style={{ margin: 0, border: "1px solid #fecaca", background: "#fff5f5" }}>
              <h2 className="card-title" style={{ fontSize: "1.1rem", borderBottom: "1px solid #fecaca", paddingBottom: "0.75rem", marginBottom: "1rem", marginTop: 0, color: "#dc2626" }}>
                Máquinas fuera de servicio
              </h2>
              <div style={{ textAlign: "center", color: "#dc2626", fontSize: "0.9rem", padding: "1.5rem 0" }}>
                No hay máquinas caídas registradas.
              </div>
            </div>
          </div>

          {/* Panel Principal Derecho: Formulario */}
          <div className="card" style={{ flex: 2, minWidth: "320px" }}>
            <h2 className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Registro Diario de Actividades</span>
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
                <select required value={operario} onChange={(e) => setOperario(e.target.value)}>
                  <option value="">Seleccione Operario...</option>
                  {operariosList.length === 0 && <option disabled>No hay operarios cargados para esta planta</option>}
                  {operariosList.map(op => (
                    <option key={op.id} value={op.id}>{op.full_name}</option>
                  ))}
                </select>
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
                  />
                ))}
              </div>

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
