export default function TaskRow({ index, task, updateTask, removeTask, options }) {
  const isMaquina = task.record_type === 'Mantenimiento de máquina (OT)';
  const isEdilicio = task.record_type === 'Mantenimiento edilicio / varios';
  const isAusentismo = task.record_type === 'Ausentismo / no productivo';

  const handleChange = (field, value) => {
    updateTask(index, { ...task, [field]: value });
  };

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
          value={task.record_type}
          onChange={(e) => handleChange('record_type', e.target.value)}
        >
          <option value="">Seleccione...</option>
          {options.recordTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 600 }}>Descripción de la tarea</label>
        <textarea 
          required
          rows="2" 
          placeholder="Describa el trabajo..."
          value={task.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      <div className="grid-2" style={{ marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Desde (Hora)</label>
          <input type="time" required value={task.start_time} onChange={(e) => handleChange('start_time', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Hasta (Hora)</label>
          <input type="time" required value={task.end_time} onChange={(e) => handleChange('end_time', e.target.value)} />
        </div>
      </div>

      {isMaquina && (
        <div style={{ background: '#eef6fc', padding: '1.25rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #bcdcf9' }}>
          <label style={{ color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Máquina intervenida</label>
          <select 
            required
            value={task.machine_id}
            onChange={(e) => handleChange('machine_id', e.target.value)}
          >
            <option value="">Seleccione la máquina...</option>
            {options.machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Naturaleza del mantenimiento</label>
            <select required value={task.nature} onChange={(e) => handleChange('nature', e.target.value)}>
              <option value="">Seleccione...</option>
              {options.natureTypes.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Desviación detectada</label>
            <textarea placeholder="Detalle el problema..." value={task.deviation} onChange={(e) => handleChange('deviation', e.target.value)} />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Estado final de la máquina</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
              <label><input type="radio" name={"estado_"+index} value="Funcional" checked={task.final_state === 'Funcional'} onChange={(e) => handleChange('final_state', e.target.value)} /> Funcional</label>
              <label><input type="radio" name={"estado_"+index} value="No Funcional" checked={task.final_state === 'No Funcional'} onChange={(e) => handleChange('final_state', e.target.value)} /> No Funcional</label>
            </div>
          </div>
        </div>
      )}

      {isEdilicio && (
        <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #bbf7d0' }}>
          <label style={{ color: '#15803d', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Categoría edilicio / varios</label>
          <select required value={task.category} onChange={(e) => handleChange('category', e.target.value)}>
            <option value="">Seleccione categoría...</option>
            {options.buildingCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {isAusentismo && (
        <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #fecdd3' }}>
          <label style={{ color: '#be123c', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Motivo ausentismo</label>
          <select required value={task.category} onChange={(e) => handleChange('category', e.target.value)}>
            <option value="">Seleccione motivo...</option>
            {options.absenceReasons.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
