"use client";
import { useState, useEffect } from "react";

export default function DictionaryAdmin({ table, title }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [table]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dictionaries/${table}`);
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
    setFormData({ name: "" });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({ name: item.name });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/dictionaries/${table}/${editingId}` : `/api/admin/dictionaries/${table}`;
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

  if (loading) return <div style={{ padding: "2rem" }}>Cargando {title}...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h3>{title}</h3>
        <button onClick={openNewModal} className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>+ Nuevo</button>
      </div>

      <div className="card" style={{ padding: "1rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th style={{ padding: "0.75rem" }}>ID</th>
              <th style={{ padding: "0.75rem" }}>Nombre</th>
              <th style={{ padding: "0.75rem" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "0.75rem", color: "#64748b" }}>{item.id}</td>
                <td style={{ padding: "0.75rem", fontWeight: 600 }}>{item.name}</td>
                <td style={{ padding: "0.75rem" }}>
                  <button onClick={() => openEditModal(item)} className="btn" style={{ padding: "0.3rem 0.6rem", background: "#f1f5f9" }}>✏️ Editar</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan="3" style={{ padding: "1rem", textAlign: "center" }}>No hay registros</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
            <h3 style={{ marginBottom: "1.5rem" }}>{editingId ? "Editar" : "Nuevo"} {title}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label>Nombre</label>
                <input required type="text" style={{ width: "100%", padding: "0.5rem" }} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
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
