import { useState } from "react";

const optH = ["", ...Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, '0'))];
const optM = ["", "00", "10", "20", "30", "40", "50"];

export default function TaskRow({ index, task, updateTask, removeTask, options, plant, operariosList, currentOperator }) {
  const isMaquina = task.record_type === 'Mantenimiento de máquina (OT)';
  const isEdilicio = task.record_type === 'Mantenimiento edilicio / varios';
  const isAusentismo = task.record_type === 'Ausentismo / no productivo';

  const [selectedSector, setSelectedSector] = useState("");

  const handleChange = (field, value) => {
    updateTask(index, { ...task, [field]: value });
  };

  const handleCompanionChange = (compIndex, value) => {
    const newCompanions = [...(task.companions || [])];
    newCompanions[compIndex] = value;
    handleChange('companions', newCompanions);
  };

  const handleCompanionsCount = (count) => {
    const current = task.companions || [];
    if (count === 0) {
      handleChange('companions', []);
    } else {
      // Ajustar el array para tener la longitud de (count)
      const newCompanions = Array(count).fill("").map((_, i) => current[i] || "");
      handleChange('companions', newCompanions);
    }
  };

  const getDuration = () => {
    if (!task.start_time_h || !task.start_time_m || !task.end_time_h || !task.end_time_m) return '0h 0m';
    const sh = parseInt(task.start_time_h, 10);
    const sm = parseInt(task.start_time_m, 10);
    const eh = parseInt(task.end_time_h, 10);
    const em = parseInt(task.end_time_m, 10);

    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff < 0) diff += 24 * 60;

    const decimalHours = diff / 60;

    return {
      text: `${Math.floor(diff / 60)}h ${diff % 60}m`,
      decimal: decimalHours
    };
  };

  const getHHTotales = () => {
    const dur = getDuration().decimal;
    const numWorkers = 1 + (task.companions || []).length;
    const hh = (dur * numWorkers).toFixed(2);
    // Remover decimales si termina en .00 para mayor legibilidad
    return hh.endsWith('.00') ? hh.slice(0, -3) : hh;
  };

  const handleVoiceDictation = (field) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta audiodictado. Usa Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleChange(field, (task[field] || '') + ' ' + transcript);
    };
    recognition.start();
  };

  // Sectores para CBA
  const cbaSectors = plant === 'CBA'
    ? [...new Set(options.machines.filter(m => m.sector).map(m => m.sector))].sort()
    : [];

  const visibleMachines = plant === 'CBA' && selectedSector
    ? options.machines.filter(m => m.sector === selectedSector)
    : options.machines;

  return (
    <div className="card" style={{ background: '#f9fafb', padding: '1.5rem', marginTop: '1rem', border: '1px solid var(--border)' }}>
      <h4 style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
        <span>Renglón {index + 1}</span>
        {index > 0 && (
          <button type="button" onClick={() => removeTask(index)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            &times; Quitar
          </button>
        )}
      </h4>

      <div className="form-group" style={{ marginBottom: '1rem', borderBottom: '1px dashed var(--border)', paddingBottom: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Tipo de registro</label>
        <select
          required
          style={{ width: '100%', padding: '0.6rem', borderColor: 'var(--border)', fontSize: '1rem', borderRadius: '4px' }}
          value={task.record_type || ""}
          onChange={(e) => handleChange('record_type', e.target.value)}
        >
          <option value="">Seleccione...</option>
          {options.recordTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          Descripción de la tarea
          <button type="button" onClick={() => handleVoiceDictation('description')} style={{ background: '#e5e7eb', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', marginBottom: '0.25rem' }}>
            🎤 Audiodictado
          </button>
        </label>
        <textarea
          required
          rows="2"
          placeholder="Describa el trabajo o presione el micrófono..."
          value={task.description || ""}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Desde</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
            <select required className="time-desde-h" style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem' }} value={task.start_time_h || ""} onChange={(e) => handleChange('start_time_h', e.target.value)}>
              {optH.map(h => <option key={`dh_${h}`} value={h}>{h === "" ? "HH" : h}</option>)}
            </select>
            <b style={{ fontSize: '1.2rem' }}>:</b>
            <select required className="time-desde-m" style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem' }} value={task.start_time_m || ""} onChange={(e) => handleChange('start_time_m', e.target.value)}>
              {optM.map(m => <option key={`dm_${m}`} value={m}>{m === "" ? "MM" : m}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Hasta</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
            <select required className="time-hasta-h" style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem' }} value={task.end_time_h || ""} onChange={(e) => handleChange('end_time_h', e.target.value)}>
              {optH.map(h => <option key={`hh_${h}`} value={h}>{h === "" ? "HH" : h}</option>)}
            </select>
            <b style={{ fontSize: '1.2rem' }}>:</b>
            <select required className="time-hasta-m" style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem' }} value={task.end_time_m || ""} onChange={(e) => handleChange('end_time_m', e.target.value)}>
              {optM.map(m => <option key={`hm_${m}`} value={m}>{m === "" ? "MM" : m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
        <small style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Tiempo de la tarea: {getDuration().text}</small>
      </div>

      <div className="form-group" style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #d1d5db' }}>
        <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Cantidad total de operarios en esta tarea</label>
        <select
          style={{ maxWidth: '300px', marginBottom: '0.5rem' }}
          value={(task.companions || []).length}
          onChange={(e) => handleCompanionsCount(parseInt(e.target.value, 10))}
        >
          {Array.from({ length: operariosList.length }).map((_, i) => (
            <option key={`c_${i}`} value={i}>{i === 0 ? "1 (Solo yo)" : i + 1}</option>
          ))}
        </select>

        {(task.companions || []).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {(task.companions || []).map((comp, cIdx) => (
              <select key={cIdx} value={comp} onChange={(e) => handleCompanionChange(cIdx, e.target.value)}>
                <option value="">Seleccione compañero...</option>
                {operariosList.filter(o => o.id !== currentOperator).map(o => (
                  <option key={o.id} value={o.id}>{o.full_name}</option>
                ))}
              </select>
            ))}
          </div>
        )}
      </div>

      {isMaquina && (
        <div style={{ background: '#eef6fc', padding: '1.25rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #bcdcf9' }}>
          <label style={{ color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>Máquina intervenida</label>

          {plant === 'CBA' && (
            <select
              style={{ width: '100%', padding: '0.6rem', borderColor: 'var(--border)', fontSize: '1rem', borderRadius: '4px', marginBottom: '0.75rem' }}
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
            >
              <option value="">Seleccione el sector...</option>
              {cbaSectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          <select
            required
            style={{ width: '100%', padding: '0.6rem', borderColor: 'var(--border)', fontSize: '1rem', borderRadius: '4px' }}
            value={task.machine_id || ""}
            onChange={(e) => handleChange('machine_id', e.target.value)}
          >
            <option value="">{plant === 'CBA' && !selectedSector ? "Seleccione primero un sector..." : "Seleccione el código de la máquina..."}</option>
            {visibleMachines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed #bcdcf9' }}>
            <h5 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Detalles complementarios para la OT</span>
              <span style={{ fontSize: '0.8rem', background: '#eef6fc', padding: '0.2rem 0.4rem', borderRadius: '4px', color: '#1d4ed8' }}>RPMT0002</span>
            </h5>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Naturaleza del mantenimiento</label>
              <select required value={task.nature || ""} onChange={(e) => handleChange('nature', e.target.value)}>
                <option value="">Seleccione...</option>
                {options.natureTypes.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                Desviación detectada
                <button type="button" onClick={() => handleVoiceDictation('deviation')} style={{ background: '#e5e7eb', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', marginBottom: '0.25rem' }}>
                  🎤 Audiodictado
                </button>
              </label>
              <textarea placeholder="Detalle el problema detectado..." value={task.deviation || ""} onChange={(e) => handleChange('deviation', e.target.value)} />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                Observaciones / tareas recomendadas
                <button type="button" onClick={() => handleVoiceDictation('observaciones')} style={{ background: '#e5e7eb', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer', marginBottom: '0.25rem' }}>
                  🎤 Audiodictado
                </button>
              </label>
              <textarea placeholder="Indique si hay tareas pendientes o recomendaciones..." value={task.observaciones || ""} onChange={(e) => handleChange('observaciones', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Horas Hombre (HH) Totales: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{getHHTotales()}</span></label>
            </div>

            <div className="form-group" style={{ background: '#fff3cd', borderColor: '#ffeeba', padding: '1rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ margin: 0, fontWeight: 600, color: '#856404' }}>¿Afectó la Disponibilidad Productiva?</label>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                <input
                  type="checkbox"
                  checked={task.affects_availability || false}
                  onChange={(e) => handleChange('affects_availability', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: task.affects_availability ? '#2196F3' : '#ccc', borderRadius: '34px',
                  transition: '.4s'
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: '16px', width: '16px', left: '4px', bottom: '4px',
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                    transform: task.affects_availability ? 'translateX(26px)' : 'none'
                  }}></span>
                </span>
              </label>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ fontWeight: 600 }}>Estado final de la máquina</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                <label style={{ cursor: 'pointer' }}><input type="radio" name={"estado_" + index} value="Funcional" checked={task.final_state === 'Funcional' || !task.final_state} onChange={(e) => handleChange('final_state', e.target.value)} /> Funcional</label>
                <label style={{ cursor: 'pointer' }}><input type="radio" name={"estado_" + index} value="No Funcional" checked={task.final_state === 'No Funcional'} onChange={(e) => handleChange('final_state', e.target.value)} /> No Funcional</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEdilicio && (
        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
          <label style={{ color: '#15803d', fontWeight: 700, display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>Categoría edilicio / varios</label>
          <select required style={{ width: '100%', padding: '0.6rem', borderColor: 'var(--border)', fontSize: '1rem', borderRadius: '4px' }} value={task.category || ""} onChange={(e) => handleChange('category', e.target.value)}>
            <option value="">Seleccione categoría...</option>
            {options.buildingCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {isAusentismo && (
        <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
          <label style={{ color: '#be123c', fontWeight: 700, display: 'block', marginBottom: '0.5rem', fontSize: '1.05rem' }}>Motivo ausentismo / no productivo</label>
          <select required style={{ width: '100%', padding: '0.6rem', borderColor: 'var(--border)', fontSize: '1rem', borderRadius: '4px' }} value={task.category || ""} onChange={(e) => handleChange('category', e.target.value)}>
            <option value="">Seleccione motivo...</option>
            {options.absenceReasons.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
