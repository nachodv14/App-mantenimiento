"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [plant, setPlant] = useState("");
  const [step, setStep] = useState(1);
  const [plantasList, setPlantasList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Cargar la lista de plantas desde la DB
    fetch('/api/plantas')
      .then(res => res.json())
      .then(data => {
        if (data.plants) setPlantasList(data.plants);
      })
      .catch(err => console.error("Error cargando plantas:", err));

    const savedPlant = sessionStorage.getItem("mantenimiento_current_plant");
    if (savedPlant) {
      setPlant(savedPlant);
      setStep(2);
    }
  }, []);

  const handlePlantSelect = (selectedPlant) => {
    setPlant(selectedPlant);
    sessionStorage.setItem("mantenimiento_current_plant", selectedPlant);
    setStep(2);
  };

  const handleRoleSelect = (role) => {
    if (role === "operario") {
      router.push("/operario");
    } else {
      router.push("/supervisor");
    }
  };

  return (
    <>
      <header>
        <div 
          className="brand" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} 
          onClick={() => {
            sessionStorage.removeItem("mantenimiento_current_plant");
            setStep(1);
            setPlant("");
          }} 
          title="Volver al inicio"
        >
          <img src="/logo-serin.png" alt="Grupo Serin" style={{ height: "32px", width: "auto", borderRadius: "4px" }} />
          <span>MantenimientoApp</span>
        </div>
      </header>

      <main>
        {step === 1 && (
          <div className="card" style={{ maxWidth: "450px", margin: "2rem auto", textAlign: "center" }}>
            <img 
              src="/logo-serin.png" 
              alt="Grupo Serin" 
              style={{ width: "220px", height: "auto", margin: "0 auto 2rem auto", borderRadius: "8px", boxShadow: "var(--shadow-md)", display: "block" }} 
            />
            
            <div className="form-group" style={{ textAlign: "left" }}>
              <label style={{ fontSize: "1rem", textAlign: "center", display: "block", marginBottom: "1rem" }}>
                Confirmá tu planta de trabajo de hoy:
              </label>
              <select
                value={plant}
                onChange={(e) => setPlant(e.target.value)}
                style={{ marginBottom: "1.5rem" }}
              >
                <option value="">Seleccione Planta...</option>
                {plantasList.length === 0 && <option disabled>Cargando plantas...</option>}
                {plantasList.map(p => (
                  <option key={p} value={p}>Planta {p}</option>
                ))}
              </select>
              
              <button
                className="btn btn-primary"
                onClick={() => plant && handlePlantSelect(plant)}
                disabled={!plant}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card" style={{ maxWidth: "500px", margin: "2rem auto", textAlign: "center" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              Planta seleccionada: <strong style={{ color: "var(--primary)" }}>{plant}</strong>
            </p>
            <h2 className="card-title" style={{ borderBottom: "none", marginBottom: "2rem" }}>
              Seleccioná tu rol para continuar:
            </h2>
            
            <div className="grid-2">
              <button
                onClick={() => handleRoleSelect("operario")}
                className="btn btn-primary"
                style={{ padding: "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "2rem" }}>🔧</span>
                Soy Operario
              </button>
              
              <button
                onClick={() => handleRoleSelect("supervisor")}
                className="btn"
                style={{ padding: "2rem 1rem", border: "2px solid var(--primary)", color: "var(--primary)", backgroundColor: "transparent", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
              >
                <span style={{ fontSize: "2rem" }}>📋</span>
                Soy Supervisor
              </button>
            </div>
            
            <button
              style={{ marginTop: "2rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => {
                sessionStorage.removeItem("mantenimiento_current_plant");
                setStep(1);
                setPlant("");
              }}
            >
              ← Cambiar planta
            </button>
          </div>
        )}
      </main>
    </>
  );
}
