"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DictionaryAdmin from "./components/DictionaryAdmin";
import MachineAdmin from "./components/MachineAdmin";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [plantsList, setPlantsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlant, setFilterPlant] = useState("");

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ username: "", password: "", full_name: "", role: "operario", plant: "", is_active: true });
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
    fetchPlants();
  }, [router]);

  const fetchPlants = async () => {
    try {
      const res = await fetch("/api/admin/dictionaries/plants");
      const json = await res.json();
      if (json.data) setPlantsList(json.data.map(p => p.name));
    } catch (e) { }
  };

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

  const handleSyncSheets = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/sync-sheets", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Sincronización con Google Sheets exitosa.");
      } else {
        alert("Error al sincronizar: " + (data.error || "Desconocido"));
      }
    } catch (e) {
      alert("Error de red al intentar sincronizar.");
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
            onClick={handleSyncSheets}
            disabled={saving}
            style={{ padding: "0.5rem 1rem", borderRadius: "4px", background: "#10b981", color: "white", border: "none", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Sincronizando..." : "Sincronizar Google Sheets"}
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

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem", overflowX: "auto" }}>
        <button onClick={() => setActiveTab('users')} style={{ background: "none", border: "none", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer", fontWeight: activeTab === 'users' ? 'bold' : 'normal', color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : 'none' }}>Usuarios</button>
        <button onClick={() => setActiveTab('machines')} style={{ background: "none", border: "none", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer", fontWeight: activeTab === 'machines' ? 'bold' : 'normal', color: activeTab === 'machines' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'machines' ? '3px solid var(--primary)' : 'none' }}>Máquinas</button>
        <button onClick={() => setActiveTab('plants')} style={{ background: "none", border: "none", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer", fontWeight: activeTab === 'plants' ? 'bold' : 'normal', color: activeTab === 'plants' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'plants' ? '3px solid var(--primary)' : 'none' }}>Plantas</button>
        <button onClick={() => setActiveTab('record_types')} style={{ background: "none", border: "none", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer", fontWeight: activeTab === 'record_types' ? 'bold' : 'normal', color: activeTab === 'record_types' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'record_types' ? '3px solid var(--primary)' : 'none' }}>Tipos de Registro</button>
        <button onClick={() => setActiveTab('nature_types')} style={{ background: "none", border: "none", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer", fontWeight: activeTab === 'nature_types' ? 'bold' : 'normal', color: activeTab === 'nature_types' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'nature_types' ? '3px solid var(--primary)' : 'none' }}>Nat. de mtto</button>
        <button onClick={() => setActiveTab('absence_reasons')} style={{ background: "none", border: "none", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer", fontWeight: activeTab === 'absence_reasons' ? 'bold' : 'normal', color: activeTab === 'absence_reasons' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'absence_reasons' ? '3px solid var(--primary)' : 'none' }}>Ausentismo</button>
        <button onClick={() => setActiveTab('building_categories')} style={{ background: "none", border: "none", padding: "0.5rem 1rem", fontSize: "1rem", cursor: "pointer", fontWeight: activeTab === 'building_categories' ? 'bold' : 'normal', color: activeTab === 'building_categories' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'building_categories' ? '3px solid var(--primary)' : 'none' }}>Categorías Edilicias</button>
      </div>

      {activeTab === 'users' && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0 }}>Gestión de Usuarios</h3>
            <button
              className="btn btn-primary"
              onClick={openNewModal}
              style={{ padding: "0.5rem 1rem", borderRadius: "4px", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", width: "auto" }}
            >
              + Nuevo Usuario
            </button>
          </div>

          <div className="card" style={{ padding: "1rem", marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db" }}
            />
            <select
              value={filterPlant}
              onChange={e => setFilterPlant(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db", minWidth: "150px", width: "auto" }}
            >
              <option value="">Todas las plantas</option>
              {plantsList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="card" style={{ padding: "1rem", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "1rem" }}>Nombre Completo</th>
                  <th style={{ padding: "1rem" }}>Usuario (Login)</th>
                  <th style={{ padding: "1rem" }}>Rol</th>
                  <th style={{ padding: "1rem" }}>Planta</th>
                  <th style={{ padding: "1rem" }}>Último Login</th>
                  <th style={{ padding: "1rem" }}>Estado</th>
                  <th style={{ padding: "1rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => {
                  const matchSearch = u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || u.username.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchPlant = filterPlant ? u.plant === filterPlant : true;
                  return matchSearch && matchPlant;
                }).map(u => (
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
                    <td style={{ padding: "1rem", fontSize: "0.85rem", color: "#64748b" }}>
                      {u.last_login ? new Date(u.last_login).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : 'Nunca'}
                    </td>
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
                        <option value="" disabled>Seleccione planta...</option>
                        {plantsList.map(p => <option key={p} value={p}>{p}</option>)}
                        {plantsList.length === 0 && <option value="CBA">CBA</option>}
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
        </>
      )}

      {activeTab === 'machines' && <MachineAdmin />}
      {activeTab === 'plants' && <DictionaryAdmin table="plants" title="Plantas" />}
      {activeTab === 'record_types' && <DictionaryAdmin table="record_types" title="Tipos de Registro" />}
      {activeTab === 'nature_types' && <DictionaryAdmin table="nature_types" title="Naturaleza de Falla" />}
      {activeTab === 'absence_reasons' && <DictionaryAdmin table="absence_reasons" title="Motivos de Ausentismo" />}
      {activeTab === 'building_categories' && <DictionaryAdmin table="building_categories" title="Categorías Edilicias" />}

    </div>
  );
}
