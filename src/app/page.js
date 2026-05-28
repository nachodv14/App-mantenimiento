"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      // Guardar info en sessionStorage
      sessionStorage.setItem("mantenimiento_user", JSON.stringify(data.user));
      if (data.user.plant) {
        sessionStorage.setItem("mantenimiento_current_plant", data.user.plant);
      }

      // Redirigir según rol
      if (data.user.role === 'admin') {
        router.push("/admin");
      } else if (data.user.role === 'supervisor') {
        router.push("/supervisor");
      } else {
        router.push("/operario");
      }
    } catch (err) {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f0f2f5" }}>
      <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
          <img src="/logo-serin.png" alt="Grupo Serin" style={{ width: "150px", height: "auto", borderRadius: "8px", display: "block" }} />
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "var(--primary)", fontSize: "1.5rem" }}>
          Ingreso a Mantenimiento
        </h2>

        {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "0.75rem", borderRadius: "6px", marginBottom: "1rem", fontSize: "0.9rem", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <label style={{ fontWeight: 600 }}>Usuario</label>
            <input
              type="text"
              required
              style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db" }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: op_juan_a1b2 / admin"
            />
          </div>
          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label style={{ fontWeight: 600 }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                style={{ width: "100%", padding: "0.75rem", paddingRight: "2.5rem", borderRadius: "6px", border: "1px solid #d1d5db" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#6b7280"
                }}
                title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", borderRadius: "6px", background: "var(--primary)", color: "white", border: "none", cursor: "pointer" }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
