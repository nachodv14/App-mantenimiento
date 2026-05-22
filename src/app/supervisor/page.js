"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SupervisorView() {
  const router = useRouter();
  const [plant, setPlant] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedPlant = sessionStorage.getItem("mantenimiento_current_plant");
    if (!savedPlant) {
      router.push("/");
    } else {
      setPlant(savedPlant);
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (user && pass) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Credenciales incorrectas.");
    }
  };

  if (!plant) return <p style={{ padding: "2rem", textAlign: "center" }}>Cargando...</p>;

  if (!isLoggedIn) {
    return (
      <>
        <header>
          <Link 
            href="/" 
            className="brand" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }} 
            title="Volver al inicio"
          >
            <img src="/logo-serin.png" alt="Grupo Serin" style={{ height: "32px", width: "auto", borderRadius: "4px" }} />
            <span>MantenimientoApp</span>
          </Link>
        </header>

        <main style={{ maxWidth: "100%", padding: "2rem 5%" }}>
          <div className="card" style={{ maxWidth: "400px", margin: "2rem auto" }}>
            <h2 className="card-title">Acceso de Supervisor</h2>
            <form onSubmit={handleLogin} autoComplete="off">
              
              <div className="form-group">
                <label>Usuario</label>
                <input 
                  type="text" 
                  required 
                  autoComplete="off"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  required 
                  autoComplete="off"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "-0.5rem", marginBottom: "1.5rem" }}>
                <input type="checkbox" id="login_remember" style={{ width: "auto", cursor: "pointer" }} />
                <label htmlFor="login_remember" style={{ margin: 0, fontWeight: "normal", fontSize: "0.875rem", cursor: "pointer" }}>
                  Guardar este usuario para la próxima vez
                </label>
              </div>
              
              {error && (
                <div className="form-group">
                  <p style={{ color: "var(--danger)", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>
                </div>
              )}
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary">Ingresar</button>
                <Link href="/" className="btn" style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", textDecoration: "none" }}>
                  Volver al inicio
                </Link>
              </div>
            </form>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header>
        <Link 
          href="/" 
          className="brand" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textDecoration: 'none' }} 
          title="Volver al inicio"
        >
          <img src="/logo-serin.png" alt="Grupo Serin" style={{ height: "32px", width: "auto", borderRadius: "4px" }} />
          <span>MantenimientoApp</span>
        </Link>
      </header>

      <main style={{ maxWidth: "100%", padding: "2rem 5%" }}>
        <div style={{ width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "0.5rem" }}>
              <h2 className="card-title" style={{ margin: 0, border: "none", padding: 0 }}>Calendario de tareas pendientes</h2>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <label style={{ fontWeight: "bold", color: "var(--text-muted)", fontSize: "0.85rem", marginRight: "0.25rem" }}>Zoom</label>
                    <button className="btn" style={{ width: "28px", height: "28px", padding: 0, fontSize: "1.2rem", background: "#fff", border: "1px solid var(--border)", color: "var(--text-main)" }}>-</button>
                    <button className="btn" style={{ width: "28px", height: "28px", padding: 0, fontSize: "1.2rem", background: "#fff", border: "1px solid var(--border)", color: "var(--text-main)" }}>+</button>
                 </div>
                 <label style={{ fontWeight: "bold", color: "var(--text-muted)" }}>Fecha:</label>
                 <input type="date" style={{ padding: "0.4rem", fontSize: "1rem", borderColor: "var(--border)", borderRadius: "4px", width: "auto" }} />
                 <button className="btn" style={{ width: "auto", padding: "0.4rem 0.9rem", fontSize: "0.9rem", background: "#3b82f6", border: "none", color: "#fff" }}>
                   Historial aprobadas
                 </button>
                 <button 
                   onClick={() => setIsLoggedIn(false)}
                   className="btn" 
                   style={{ width: "auto", padding: "0.4rem 0.9rem", fontSize: "0.9rem", background: "none", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                 >
                   ← Volver (Logout)
                 </button>
              </div>
            </div>
            
            <div style={{ overflow: "auto", maxHeight: "65vh", background: "#fffcf2", padding: "0.5rem", borderRadius: "var(--radius)", border: "1px solid #fde047", minHeight: "400px" }}>
              <div style={{ display: "flex", minWidth: "900px", position: "relative" }}>
                 <div style={{ width: "60px", flexShrink: 0, position: "relative", borderRight: "2px solid var(--border)" }}>
                    <div style={{ position: "absolute", top: "100px", right: "4px", fontSize: "0.75rem", color: "var(--text-muted)", background: "#fffcf2" }}>08:00</div>
                 </div>
                 <div style={{ flex: 1, display: "flex", position: "relative", paddingLeft: "0.5rem", gap: "0.5rem" }}>
                    <div style={{ flex: 1, minWidth: "150px", borderLeft: "1px dashed var(--border)", position: "relative" }}>
                      <div style={{ background: "var(--bg-color)", textAlign: "center", padding: "0.5rem", fontWeight: "bold", borderBottom: "2px solid var(--primary)", position: "sticky", top: 0, zIndex: 10 }}>Operario 1</div>
                      <div style={{ position: "absolute", top: "120px", left: "2px", right: "2px", background: "#dbeafe", border: "1px solid #3b82f6", borderRadius: "4px", padding: "4px", fontSize: "0.75rem" }}>08:30 Tarea X</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
