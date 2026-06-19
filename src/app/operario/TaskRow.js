import { useState, useEffect, useRef } from "react";

const optH = ["", ...Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, '0'))];
const optM = ["", "00", "10", "20", "30", "40", "50"];

export default function TaskRow({ index, task, updateTask, removeTask, options, plant, operariosList, currentOperator }) {
  const isMaquina = task.record_type === 'Mantenimiento de máquina (OT)';
  const isEdilicio = task.record_type === 'Mantenimiento edilicio / varios';
  const isAusentismo = task.record_type === 'Ausentismo / no productivo';

  const [selectedSector, setSelectedSector] = useState("");
  const [dictatingField, setDictatingField] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (task.machine_id && !selectedSector) {
      const mach = options.machines.find(m => m.id === task.machine_id);
      if (mach && mach.sector) {
        setSelectedSector(mach.sector);
      }
    }
  }, [task.machine_id, plant, options.machines, selectedSector]);

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
    if (dictatingField === field) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setDictatingField(null);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta audiodictado. Usa Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-AR';
    recognition.continuous = true; // Sigue grabando hasta que el usuario lo pare
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' ';
      }
      handleChange(field, (task[field] || '') + ' ' + transcript.trim());
    };

    recognition.onerror = () => {
      setDictatingField(null);
    };

    recognition.onend = () => {
      setDictatingField(null);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setDictatingField(field);
  };

  const renderDictationBtn = (field) => {
    const isDictating = dictatingField === field;
    return (
      <button 
        type="button" 
        onClick={() => handleVoiceDictation(field)} 
        style={{ 
          background: isDictating ? '#fee2e2' : '#e5e7eb', 
          color: isDictating ? '#dc2626' : '#374151',
          border: isDictating ? '1px solid #dc2626' : '1px solid transparent', 
          borderRadius: '4px', 
          padding: '0.25rem 0.5rem', 
          cursor: 'pointer', 
          marginBottom: '0.25rem',
          fontWeight: isDictating ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        {isDictating ? '⏹️ Detener' : '🎤 Audiodictado'}
      </button>
    );
  };

  // Sectores de las máquinas de esta planta
  const plantSectors = [...new Set(options.machines.filter(m => m.sector).map(m => m.sector))].sort();

  const visibleMachines = selectedSector
    ? options.machines.filter(m => m.sector === selectedSector)
    : options.machines;

  const selectedMachineObj = options.machines.find(m => m.id === task.machine_id);
  const isDruidsRAM = plant?.trim().toUpperCase() === 'RAM' && selectedMachineObj && selectedMachineObj.name?.toUpperCase().replace(/\s/g, '').includes('DRUIDS01');

  const handleMachineChange = (val) => {
    handleChange('machine_id', val);
    if (val) {
      const mach = options.machines.find(m => m.id === val);
      if (mach && mach.sector) {
        setSelectedSector(mach.sector);
      }
    }
  };

  const getTaskEndOptions = () => {
    if (plant?.trim().toUpperCase() === 'RAM') return optH;
    if (!task.start_time_h) return optH;
    return optH.filter(h => h === "" || parseInt(h, 10) >= parseInt(task.start_time_h, 10));
  };

  const getDowntimeEndOptions = () => {
    if (!task.start_out_date || !task.end_out_date || !task.start_out_h) return optH;
    if (task.start_out_date === task.end_out_date) {
      return optH.filter(h => h === "" || parseInt(h, 10) >= parseInt(task.start_out_h, 10));
    }
    return optH;
  };

  return (
    <div className="card" style={{ background: '#f9fafb', padding: '1.5rem', marginTop: '1rem', border: '1px solid var(--border)' }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
        <span>TAREA {index + 1}</span>
        {index > 0 && (
          <button type="button" onClick={() => removeTask(index)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
            &times; Quitar
          </button>
        )}
      </h3>

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
          <span>Descripción de la tarea <span style={{ color: '#dc2626' }}>*</span></span>
          {renderDictationBtn('description')}
        </label>
        <textarea
          required
          rows="2"
          placeholder="Describa el trabajo o presione el micrófono..."
          value={task.description || ""}
          onChange={(e) => handleChange('description', e.target.value)}
          style={{ borderColor: !task.description?.trim() ? '#fca5a5' : undefined }}
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
              {getTaskEndOptions().map(h => <option key={`hh_${h}`} value={h}>{h === "" ? "HH" : h}</option>)}
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
                {operariosList.filter(o => o.id !== currentOperator && (!(task.companions || []).includes(o.id) || o.id === comp)).map(o => (
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

          {plantSectors.length > 0 && (
            <select
              style={{ width: '100%', padding: '0.6rem', borderColor: 'var(--border)', fontSize: '1rem', borderRadius: '4px', marginBottom: '0.75rem', backgroundColor: task.lock_machine ? '#e5e7eb' : 'white', opacity: task.lock_machine ? 0.7 : 1 }}
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              disabled={task.lock_machine}
            >
              <option value="">Todos los sectores...</option>
              {plantSectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          <select
            required
            style={{ width: '100%', padding: '0.6rem', borderColor: 'var(--border)', fontSize: '1rem', borderRadius: '4px', backgroundColor: task.lock_machine ? '#e5e7eb' : 'white', opacity: task.lock_machine ? 0.7 : 1 }}
            value={task.machine_id || ""}
            onChange={(e) => handleMachineChange(e.target.value)}
            disabled={task.lock_machine}
          >
            <option value="">{selectedSector ? `Máquinas de ${selectedSector}...` : "Buscar y seleccionar máquina..."}</option>
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
                <span>Desviación detectada <span style={{ color: '#dc2626' }}>*</span></span>
                {renderDictationBtn('deviation')}
              </label>
              <textarea required placeholder="Detalle el problema detectado..." value={task.deviation || ""} onChange={(e) => handleChange('deviation', e.target.value)} style={{ borderColor: !task.deviation?.trim() ? '#fca5a5' : undefined }} />
            </div>

            <div className="form-group">
              <label style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                Observaciones / tareas recomendadas
                {renderDictationBtn('observaciones')}
              </label>
              <textarea placeholder="Indique si hay tareas pendientes o recomendaciones..." value={task.observaciones || ""} onChange={(e) => handleChange('observaciones', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Horas Hombre (HH) Totales: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{getHHTotales()}</span></label>
            </div>

            <div className="form-group" style={{ background: '#fff3cd', borderColor: '#ffeeba', padding: '1rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: task.affects_availability ? '1rem' : 0 }}>
                <label style={{ margin: 0, fontWeight: 600, color: '#856404' }}>¿Afectó la Disponibilidad Productiva?</label>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={task.affects_availability || false}
                    onChange={(e) => handleChange('affects_availability', e.target.checked)}
                    disabled={task.lock_start_out}
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
              
              {task.affects_availability && (
                <div style={{ borderTop: '1px solid #ffeeba', paddingTop: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#856404' }}>Registro de Parada:</strong>
                  
                  <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.9rem', color: '#856404', display: 'block', marginBottom: '0.25rem', opacity: task.lock_start_out ? 0.7 : 1 }}>
                        Fecha de inicio {task.lock_start_out ? <small>(Bloqueado)</small> : task.final_state === 'Funcional' ? <small>(Opcional, se busca auto.)</small> : ''}
                      </label>
                      <input type="date" required={task.final_state === 'No Funcional' && !task.lock_start_out} disabled={task.lock_start_out} style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: task.lock_start_out ? '#e5e7eb' : 'white', opacity: task.lock_start_out ? 0.7 : 1 }} value={task.start_out_date || ""} onChange={(e) => handleChange('start_out_date', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.9rem', color: '#856404', display: 'block', marginBottom: '0.25rem', opacity: task.final_state === 'No Funcional' ? 0.5 : 1 }}>
                        Fecha de fin {task.final_state === 'Funcional' ? '*' : ''}
                      </label>
                      <input type="date" required={task.final_state === 'Funcional'} disabled={task.final_state === 'No Funcional'} style={{ width: '100%', padding: '0.6rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #d1d5db', backgroundColor: task.final_state === 'No Funcional' ? '#e5e7eb' : 'white', opacity: task.final_state === 'No Funcional' ? 0.6 : 1 }} value={task.end_out_date || ""} onChange={(e) => handleChange('end_out_date', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.9rem', color: '#856404', opacity: task.lock_start_out ? 0.7 : 1 }}>Hora de inicio</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                        <select required={task.final_state === 'No Funcional' && !task.lock_start_out} disabled={task.lock_start_out} style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem', backgroundColor: task.lock_start_out ? '#e5e7eb' : 'white', opacity: task.lock_start_out ? 0.7 : 1 }} value={task.start_out_h || ""} onChange={(e) => handleChange('start_out_h', e.target.value)}>
                          {optH.map(h => <option key={`soh_${h}`} value={h}>{h === "" ? "HH" : h}</option>)}
                        </select>
                        <b style={{ fontSize: '1.2rem', color: task.lock_start_out ? '#9ca3af' : 'black' }}>:</b>
                        <select required={task.final_state === 'No Funcional' && !task.lock_start_out} disabled={task.lock_start_out} style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem', backgroundColor: task.lock_start_out ? '#e5e7eb' : 'white', opacity: task.lock_start_out ? 0.7 : 1 }} value={task.start_out_m || ""} onChange={(e) => handleChange('start_out_m', e.target.value)}>
                          {optM.map(m => <option key={`som_${m}`} value={m}>{m === "" ? "MM" : m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.9rem', color: '#856404', opacity: task.final_state === 'No Funcional' ? 0.5 : 1 }}>
                        Hora de fin {task.final_state === 'Funcional' ? '*' : '(Opcional)'}
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%' }}>
                        <select required={task.final_state === 'Funcional'} style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem', backgroundColor: task.final_state === 'No Funcional' ? '#e5e7eb' : 'white', opacity: task.final_state === 'No Funcional' ? 0.6 : 1 }} value={task.end_out_h || ""} onChange={(e) => handleChange('end_out_h', e.target.value)} disabled={task.final_state === 'No Funcional'}>
                          {getDowntimeEndOptions().map(h => <option key={`eoh_${h}`} value={h}>{h === "" ? "HH" : h}</option>)}
                        </select>
                        <b style={{ fontSize: '1.2rem', color: task.final_state === 'No Funcional' ? '#9ca3af' : 'black' }}>:</b>
                        <select required={task.final_state === 'Funcional'} style={{ flex: 1, padding: '0.6rem', textAlign: 'center', fontSize: '1.1rem', backgroundColor: task.final_state === 'No Funcional' ? '#e5e7eb' : 'white', opacity: task.final_state === 'No Funcional' ? 0.6 : 1 }} value={task.end_out_m || ""} onChange={(e) => handleChange('end_out_m', e.target.value)} disabled={task.final_state === 'No Funcional'}>
                          {optM.map(m => <option key={`eom_${m}`} value={m}>{m === "" ? "MM" : m}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {isDruidsRAM && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid #ffeeba', paddingTop: '1rem' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#856404' }}>Líneas afectadas (DRUIDS01):</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: 600, color: '#b45309' }}>
                          <input 
                            type="checkbox" 
                            checked={task.affected_lines?.includes('Todo el equipo completo') || false} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleChange('affected_lines', ['Todo el equipo completo']);
                              } else {
                                handleChange('affected_lines', []);
                              }
                            }} 
                          /> Todo el equipo completo
                        </label>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <label key={`linea_${num}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', color: '#856404' }}>
                            <input 
                              type="checkbox" 
                              checked={task.affected_lines?.includes(`Línea ${num}`) || false} 
                              onChange={(e) => {
                                const current = task.affected_lines || [];
                                let newLines = current.filter(l => l !== 'Todo el equipo completo');
                                if (e.target.checked) {
                                  newLines.push(`Línea ${num}`);
                                } else {
                                  newLines = newLines.filter(l => l !== `Línea ${num}`);
                                }
                                handleChange('affected_lines', newLines);
                              }} 
                            /> Línea {num}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label style={{ fontWeight: 600 }}>Estado final de la máquina</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                <label style={{ cursor: 'pointer' }}><input type="radio" name={"estado_" + index} value="Funcional" checked={task.final_state === 'Funcional' || !task.final_state} onChange={(e) => handleChange('final_state', e.target.value)} /> Funcional</label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" name={"estado_" + index} value="No Funcional" checked={task.final_state === 'No Funcional'} onChange={(e) => {
                    updateTask(index, { ...task, final_state: 'No Funcional', end_out_h: '', end_out_m: '00' });
                  }} /> No Funcional
                </label>
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
