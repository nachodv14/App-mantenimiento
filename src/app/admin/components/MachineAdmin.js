"use client";
import { useState, useEffect } from "react";

export default function MachineAdmin() {
  const [data, setData] = useState([]);
  const [plantsList, setPlantsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlant, setFilterPlant] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", plant: "", sector: "", is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const res = await fetch("/api/admin/dictionaries/plants");
      const json = await res.json();
      if (json.data) setPlantsList(json.data.map(p => p.name));
    } catch (e) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/machines`);
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: "", plant: "CBA", sector: "", is_active: true });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name, plant: item.plant, sector: item.sector || "", is_active: item.is_active });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/machines/${editingId}` : `/api/admin/machines`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const json = await res.json();
        alert(json.error || "Error al guardar");
      }
    } catch (e) {
      alert("Error de red");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Cargando máquinas...</div>;

  const sectorsList = [...new Set(data.filter(m => m.sector).map(m => m.sector))].sort();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ margin: 0 }}>Gestión de Máquinas</h3>
        <button onClick={openNewModal} className="btn btn-primary" style={{ padding: "0.5rem 1rem", width: "auto" }}>+ Nueva Máquina</button>
      </div>

      <div className="card" style={{ padding: "1rem", marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <input 
          type="text" 
          placeholder="Buscar máquina..." 
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
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "0.75rem" }}>Planta</th>
              <th style={{ padding: "0.75rem" }}>Sector</th>
              <th style={{ padding: "0.75rem" }}>Nombre de Máquina</th>
              <th style={{ padding: "0.75rem" }}>Estado</th>
              <th style={{ padding: "0.75rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.filter(m => {
              const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
              const matchPlant = filterPlant ? m.plant === filterPlant : true;
              return matchSearch && matchPlant;
            }).map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb", opacity: item.is_active ? 1 : 0.6 }}>
                <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{item.plant}</td>
                <td style={{ padding: "0.75rem", color: "#64748b" }}>{item.sector || "-"}</td>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "0.75rem" }}>{item.is_active ? "🟢 Activa" : "🔴 Inactiva"}</td>
                <td style={{ padding: "0.75rem" }}>
                  <button onClick={() => openEditModal(item)} className="btn" style={{ padding: "0.3rem 0.6rem", background: "#f1f5f9" }}>✏️ Editar</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="5" style={{ padding: "1rem", textAlign: "center" }}>No hay registros</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar Máquina" : "Nueva Máquina"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Nombre de la Máquina</label>
                <input required type="text" style={{ width: "100%", padding: "0.5rem" }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Planta</label>
                  <select required style={{ width: "100%", padding: "0.5rem" }} value={formData.plant} onChange={e => setFormData({ ...formData, plant: e.target.value })}>
                    <option value="" disabled>Seleccione planta...</option>
                    {plantsList.map(p => <option key={p} value={p}>{p}</option>)}
                    {plantsList.length === 0 && <option value="CBA">CBA</option>}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Sector (Opcional)</label>
                  <input type="text" list="sectores-list" style={{ width: "100%", padding: "0.5rem" }} value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} placeholder="Escriba o seleccione..." />
                  <datalist id="sectores-list">
                    {sectorsList.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" id="mIsActive" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: "18px", height: "18px" }} />
                <label htmlFor="mIsActive" style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}>Máquina Activa</label>
              </div>

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn">Cancelar</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
