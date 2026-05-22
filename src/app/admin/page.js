"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "", full_name: "", role: "operario", plant: "CBA", is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userRaw = sessionStorage.getItem("mantenimiento_user");
    if (!userRaw) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userRaw);
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ username: "", password: "", full_name: "", role: "operario", plant: "CBA", is_active: true });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditingId(u.id);
    setFormData({
      username: u.username || "",
      password: "", // Hide password
      full_name: u.full_name || "",
      role: u.role || "operario",
      plant: u.plant || "CBA",
      is_active: u.is_active !== false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/users/${editingId}` : "/api/admin/users";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Usuario guardado exitosamente");
        setShowModal(false);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Error al guardar usuario");
      }
    } catch (e) {
      alert("Error de red");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando panel de administración...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2>Panel de Administración (Admin)</h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn btn-primary"
            onClick={openNewModal}
            style={{ padding: "0.5rem 1rem", borderRadius: "4px", background: "var(--primary)", color: "white", border: "none", cursor: "pointer" }}
          >
            + Nuevo Usuario
          </button>
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push("/");
            }}
            style={{ padding: "0.5rem 1rem", borderRadius: "4px", background: "#ef4444", color: "white", border: "none", cursor: "pointer" }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "1rem" }}>Nombre Completo</th>
              <th style={{ padding: "1rem" }}>Usuario (Login)</th>
              <th style={{ padding: "1rem" }}>Rol</th>
              <th style={{ padding: "1rem" }}>Planta</th>
              <th style={{ padding: "1rem" }}>Estado</th>
              <th style={{ padding: "1rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb", opacity: u.is_active ? 1 : 0.5 }}>
                <td style={{ padding: "1rem" }}>{u.full_name}</td>
                <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "1.1rem" }}>{u.username}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{
                    padding: "0.25rem 0.5rem", borderRadius: "1rem", fontSize: "0.85rem",
                    background: u.role === 'supervisor' ? '#dbeafe' : '#fef3c7',
                    color: u.role === 'supervisor' ? '#1e40af' : '#92400e'
                  }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "1rem", fontWeight: 600 }}>{u.plant}</td>
                <td style={{ padding: "1rem" }}>{u.is_active ? "🟢 Activo" : "🔴 Inactivo"}</td>
                <td style={{ padding: "1rem" }}>
                  <button
                    onClick={() => openEditModal(u)}
                    style={{ padding: "0.4rem 0.8rem", cursor: "pointer", background: "#e5e7eb", border: "1px solid #d1d5db", borderRadius: "4px" }}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="7" style={{ padding: "2rem", textAlign: "center" }}>No hay usuarios creados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Nombre Completo (Para los reportes)</label>
                <input required type="text" style={{ width: "100%", padding: "0.5rem" }} value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Nombre de Usuario (Para el login - ej: Apellido)</label>
                <input required type="text" style={{ width: "100%", padding: "0.5rem" }} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>{editingId ? "Nueva Contraseña (dejar vacío para mantener la actual)" : "Contraseña"}</label>
                <input type="text" style={{ width: "100%", padding: "0.5rem" }} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editingId} />
              </div>
              <div className="grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Rol</label>
                  <select required style={{ width: "100%", padding: "0.5rem" }} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="operario">Operario</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Planta</label>
                  <select required style={{ width: "100%", padding: "0.5rem" }} value={formData.plant} onChange={e => setFormData({ ...formData, plant: e.target.value })}>
                    {['CBA', 'SL1', 'SL2', 'PY', 'PIL', 'RIV', 'RAM'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: "18px", height: "18px" }} />
                <label htmlFor="isActive" style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}>Usuario Activo (Habilitado para ingresar)</label>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", background: "white", borderRadius: "4px", cursor: "pointer" }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  {saving ? "Guardando..." : "Guardar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
