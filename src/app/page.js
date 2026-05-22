"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
            <input
              type="password"
              required
              style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid #d1d5db" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
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
