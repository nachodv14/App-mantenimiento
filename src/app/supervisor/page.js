"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SupervisorView() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard State
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    // Si ya había una sesión
    const savedUser = sessionStorage.getItem("mantenimiento_supervisor");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      fetchTasks(u.plant);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        sessionStorage.setItem("mantenimiento_supervisor", JSON.stringify(data.user));
        setUser(data.user);
        fetchTasks(data.user.plant);
      } else {
        setErrorMsg(data.message || "Error al iniciar sesión");
      }
    } catch (err) {
      setErrorMsg("Error de red");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("mantenimiento_supervisor");
    setUser(null);
    setTasks([]);
  };

  const fetchTasks = async (plant) => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/tareas/pending?plant=${plant}`);
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Remover la tarea aprobada/rechazada de la lista visual
        setTasks(prev => prev.filter(t => t.id !== id));
      } else {
        alert("Hubo un error al actualizar la tarea");
      }
    } catch (err) {
      alert("Error de red al actualizar la tarea");
    }
  };

  if (!user) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo-serin.png" alt="Serin" style={{ width: '150px', borderRadius: '4px', marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--primary)', margin: 0 }}>Acceso Supervisores</h2>
          </div>
          
          <form onSubmit={handleLogin}>
            {errorMsg && (
              <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
                {errorMsg}
              </div>
            )}
            <div className="form-group">
              <label>Usuario</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoggingIn}>
              {isLoggingIn ? 'Iniciando...' : 'Ingresar'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>← Volver al inicio</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }}>
          <img src="/logo-serin.png" alt="Grupo Serin" style={{ height: "32px", borderRadius: "4px" }} />
          <span>MantenimientoApp <small style={{ fontWeight: 'normal', color: '#cbd5e1' }}>| Panel Supervisor</small></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff' }}>
          <span style={{ fontSize: '0.9rem' }}>Planta: <strong>{user.plant}</strong></span>
          <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.4rem 1rem' }}>Cerrar sesión</button>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", padding: "2rem", margin: "0 auto" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Tareas Pendientes de Revisión</h2>
          <button onClick={() => fetchTasks(user.plant)} className="btn btn-primary" disabled={loadingTasks}>
            {loadingTasks ? 'Actualizando...' : '↻ Refrescar'}
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3>¡Al día!</h3>
            <p>No hay registros diarios pendientes de aprobación.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {tasks.map(t => (
              <div key={t.id} className="card" style={{ borderLeft: '4px solid #facc15', margin: 0, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PENDIENTE</span>
                      <strong style={{ fontSize: '1.1rem' }}>{t.operator_name || 'Operario Desconocido'}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.task_date} ({t.shift})</span>
                    </div>
                    <h4 style={{ margin: '0.5rem 0', color: 'var(--primary)' }}>
                      {t.task_type} {t.machine_name ? `» ${t.machine_name}` : t.category ? `» ${t.category}` : ''}
                    </h4>
                    <p style={{ margin: '0.5rem 0' }}>{t.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <span><strong>Hora:</strong> {t.start_time} - {t.end_time}</span>
                      {t.nature && <span><strong>Naturaleza:</strong> {t.nature}</span>}
                    </div>
                    {t.deviation && (
                      <div style={{ background: '#fef2f2', padding: '0.75rem', borderRadius: '4px', marginTop: '0.75rem', color: '#991b1b', fontSize: '0.9rem' }}>
                        <strong>Desviación:</strong> {t.deviation}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                    <button onClick={() => updateTaskStatus(t.id, 'APPROVED')} className="btn btn-success" style={{ padding: '0.5rem' }}>✓ Aprobar</button>
                    <button onClick={() => updateTaskStatus(t.id, 'REJECTED')} className="btn" style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.5rem' }}>✗ Rechazar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
