// Constants
const GAS_URL = "https://script.google.com/macros/s/AKfycbxcCq6xrMkjUhCLaEPtAUtPvLJEaFpDXyowin-WgOOcFefzRgjU8s6EaS4AcgVL029R/exec";

const optionsMaquinas = `<option value="">Seleccione el codigo de la máquina...</option><option value="R31">R31</option><option value="R32">R32</option><option value="R33">R33</option><option value="R34">R34</option><option value="R36">R36</option><option value="R38">R38</option><option value="P05">P05</option><option value="P06">P06</option><option value="PE01">PE01</option><option value="PE02">PE02</option><option value="M01">M01</option><option value="M03">M03</option><option value="M05">M05</option><option value="M06">M06</option><option value="M07">M07</option><option value="M08">M08</option><option value="M09">M09</option><option value="M10">M10</option><option value="M11">M11</option><option value="SEC03">SEC03</option><option value="S08">S08</option><option value="S10">S10</option><option value="SA04">SA04</option><option value="Q03">Q03</option><option value="FL02">FL02</option><option value="X40">X40</option><option value="X42">X42</option>`;
const optionsNaturaleza = `<option value="">Seleccione...</option><option value="Inspección">Inspección</option><option value="Preventivo Programado">Preventivo Programado</option><option value="Preventivo Condicional">Preventivo Condicional</option><option value="Preventivo semanal">Preventivo semanal</option><option value="Preventivo mensual">Preventivo mensual</option><option value="Preventivo trimestral">Preventivo trimestral</option><option value="Preventivo semestral">Preventivo semestral</option><option value="Preventivo Anual">Preventivo Anual</option><option value="Mejoras">Mejoras</option><option value="Falla">Falla</option>`;
const optionsEdilicio = `<option value="">Seleccione Categoría...</option><option value="Orden y limpieza">Orden y limpieza</option><option value="Reunion, capacitacion o asamblea">Reunion, capacitacion o asamblea</option><option value="Planta general">Planta general</option><option value="Taller o pañol">Taller o pañol</option><option value="Asistencia a Logistica">Asistencia a Logistica</option><option value="Asistencia a Produccion">Asistencia a Produccion</option>`;
const optionsAusentismo = `<option value="">Seleccione Motivo...</option><option value="Carpeta medica">Carpeta medica</option><option value="Vacaciones">Vacaciones</option><option value="Salidas personales o retiros">Salidas personales o retiros</option><option value="Feriados">Feriados</option>`;
const optionsTipoRegistro = `<option value="MAQUINA">Mantenimiento de Máquina (OT)</option><option value="EDILICIO">Mantenimiento Edilicio / Varios</option><option value="AUSENTISMO">Ausentismo / No productivo</option>`;

const operatorDict = {
  "SL2": ['Baigorria', 'Saldaña', 'Gonzalez Aguero', 'Gutierrez', 'Aberastain'],
  "SL1": ['Azcurra', 'Beltran', 'Prado', 'Reyes'],
  "RAM": ['Abella', 'Ferrara', 'Rivero', 'Marun'],
  "CBA": ['Contrera', 'Miranda', 'Aguirre', 'Guardia'],
  "PIL": ['Kern'], "PY": [], "RIV": []  // Si se configuran luego, van aquí
};

// Options for custom 10-min step time dropdowns
const optH = `<option value="">HH</option>` + Array.from({ length: 24 }).map((_, i) => `<option value="${String(i).padStart(2, '0')}">${String(i).padStart(2, '0')}</option>`).join('');
const optM = `<option value="">MM</option><option value="00">00</option><option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="40">40</option><option value="50">50</option>`;

// DOM Elements
const viewPlant = document.getElementById('view-plant');
const viewRole  = document.getElementById('view-role');
const viewOp    = document.getElementById('view-operator');
const viewLogin = document.getElementById('view-login');
const viewSup   = document.getElementById('view-supervisor');

const btnOp  = document.getElementById('btn-role-operator');  // ya no existe en header, queda null pero no se usa
const btnSup = document.getElementById('btn-role-supervisor'); // idem
const sltPlant      = document.getElementById('select-plant');
const btnEnterPlant = document.getElementById('btn-enter-plant');

// Global App State (Local Storage Restored)
let tasks = JSON.parse(localStorage.getItem('mantenimiento_tasks')) || [];
let currentPlant = null;
let supervisorLoggedIn = false;
let currentInspectingTask = null;

function saveTasks() {
  localStorage.setItem('mantenimiento_tasks', JSON.stringify(tasks));
}

// init: siempre arrancar desde la pantalla de planta
sessionStorage.removeItem('mantenimiento_current_plant');



// Pantalla de rol inicial (paso 2)
document.getElementById('btn-role-op-init').addEventListener('click', () => {
  viewRole.classList.add('hidden');
  viewOp.classList.remove('hidden');
});

document.getElementById('btn-role-sup-init').addEventListener('click', () => {
  viewRole.classList.add('hidden');
  if(supervisorLoggedIn) {
    viewSup.classList.remove('hidden');
    renderCalendar();
  } else {
    loadSavedProfiles();
    viewLogin.classList.remove('hidden');
  }
});

document.getElementById('btn-back-plant').addEventListener('click', () => {
  viewRole.classList.add('hidden');
  viewPlant.classList.remove('hidden');
});

document.getElementById('btn-sup-go-home').addEventListener('click', () => {
  viewSup.classList.add('hidden');
  viewLogin.classList.add('hidden');
  supervisorLoggedIn = false;
  sltPlant.value = '';
  currentPlant = null;
  viewPlant.classList.remove('hidden');
});

document.getElementById('btn-op-go-home').addEventListener('click', () => {
  viewOp.classList.add('hidden');
  sltPlant.value = '';
  currentPlant = null;
  viewPlant.classList.remove('hidden');
});

// Brand logo → volver al inicio
document.getElementById('btn-brand-home').addEventListener('click', () => {
  if(!confirm('¿Salir y volver al inicio? Se perderá el formulario en curso.')) return;
  [viewRole, viewOp, viewSup, viewLogin].forEach(v => v && v.classList.add('hidden'));
  supervisorLoggedIn = false;
  sltPlant.value = '';
  currentPlant = null;
  viewPlant.classList.remove('hidden');
});

btnEnterPlant.addEventListener('click', () => {
  if (!sltPlant.value) return alert("Por favor seleccione una planta válida para continuar.");
  currentPlant = sltPlant.value;
  sessionStorage.setItem('mantenimiento_current_plant', currentPlant);

  const opSelect = document.getElementById('operario');
  const plantOps = operatorDict[currentPlant] || [];
  opSelect.innerHTML = `<option value="">Seleccione Operario...</option>` + plantOps.map(op => `<option value="${op}">${op}</option>`).join('');

  // Al confirmar planta, mostrar pantalla de rol
  viewPlant.classList.add('hidden');
  // Actualizar el label de planta seleccionada en la pantalla de rol
  const rolePlantLabel = document.getElementById('role-plant-label');
  if(rolePlantLabel) rolePlantLabel.textContent = `Planta: ${currentPlant}`;
  viewRole.classList.remove('hidden');

  // Restart rows if they changed plants to recalibrate the Select size
  initRows();
  renderOperatorSidebar();
});

// Navigation legacy (header buttons removed — kept as no-ops for safety)
// btnOp / btnSup are null, so no listeners attached.

// Login Logic — Sistema de perfiles guardados
const loginForm       = document.getElementById('form-login');
const inputLoginUser  = document.getElementById('login_user');
const inputLoginPass  = document.getElementById('login_pass');
const chkRemember     = document.getElementById('login_remember');
const loginSaved      = document.getElementById('login_saved');
const savedProfilesGrp = document.getElementById('saved-profiles-group');

// Cargar perfiles guardados en el selector
function loadSavedProfiles() {
  const profiles = JSON.parse(localStorage.getItem('mantenimiento_sup_profiles') || '[]');
  if (profiles.length > 0) {
    savedProfilesGrp.style.display = 'block';
    loginSaved.innerHTML = '<option value="">— Seleccionar perfil guardado —</option>';
    profiles.forEach((p, i) => {
      loginSaved.innerHTML += `<option value="${i}">${p.user}</option>`;
    });
  } else {
    savedProfilesGrp.style.display = 'none';
  }
  // Siempre limpiar los campos al mostrar el login
  inputLoginUser.value = '';
  inputLoginPass.value = '';
  chkRemember.checked = false;
}

// Al seleccionar un perfil guardado, autocompletar los campos
loginSaved.addEventListener('change', () => {
  const profiles = JSON.parse(localStorage.getItem('mantenimiento_sup_profiles') || '[]');
  const idx = parseInt(loginSaved.value);
  if (!isNaN(idx) && profiles[idx]) {
    inputLoginUser.value = profiles[idx].user;
    inputLoginPass.value = profiles[idx].pass;
  } else {
    inputLoginUser.value = '';
    inputLoginPass.value = '';
  }
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const u = inputLoginUser.value.trim();
  const p = inputLoginPass.value;
  if (u === 'asarchioni' && p === 'Serin') {
    if (chkRemember.checked) {
      const profiles = JSON.parse(localStorage.getItem('mantenimiento_sup_profiles') || '[]');
      const exists = profiles.find(pr => pr.user === u);
      if (!exists) {
        profiles.push({ user: u, pass: p });
        localStorage.setItem('mantenimiento_sup_profiles', JSON.stringify(profiles));
      }
    }
    supervisorLoggedIn = true;
    document.getElementById('login_error').style.display = 'none';
    viewLogin.classList.add('hidden');
    viewSup.classList.remove('hidden');
    renderCalendar();
  } else {
    document.getElementById('login_error').style.display = 'block';
  }
});

function getCompanionOptionsHTML() {
  const opPrin = document.getElementById('operario').value;
  const plantOps = operatorDict[currentPlant] || [];
  let html = `<option value="">Seleccione...</option>`;
  plantOps.forEach(op => {
    if (op !== opPrin) html += `<option value="${op}">${op}</option>`;
  });
  return html;
}
document.getElementById('operario').addEventListener('change', () => {
   document.querySelectorAll('.ot-operarios').forEach(selectOpt => selectOpt.dispatchEvent(new Event('change')));
   updateTiempoTotal();
   renderOperatorSidebar();
});


// Dynamic Tasks Logic
const tareasContainer = document.getElementById('tareas-container');
const btnAddTask = document.getElementById('btn-add-task');
let rowCount = 0;

document.getElementById('fecha').valueAsDate = new Date();

function addTaskRow(isRequired = false) {
  rowCount++;
  const rowId = 'row_' + rowCount;
  const div = document.createElement('div');
  div.className = 'task-row card';
  div.style.background = '#f9fafb';
  div.style.padding = '1.5rem';
  div.style.marginTop = '1rem';
  div.style.border = '1px solid var(--border)';

  const plantOps = operatorDict[currentPlant] || [];
  let opsHtml = '';
  for (let i = 1; i <= plantOps.length; i++) {
    if (i === 1) opsHtml += `<option value="1">1 (Solo yo)</option>`;
    else opsHtml += `<option value="${i}">${i}</option>`;
  }

  div.innerHTML = `
    <h4 style="margin-bottom: 1rem; color:var(--text-main); font-size:1rem; display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:0.5rem;">
      <span>Renglón ${rowCount}</span>
      ${!isRequired ? `<button type="button" class="btn-remove-task" style="color:var(--danger); background:none; border:none; cursor:pointer; font-weight:600;">&times; Quitar</button>` : ''}
    </h4>
    
    <div class="form-group" style="margin-bottom:1rem;">
      <label style="font-weight:600; display:flex; justify-content:space-between; align-items:flex-end;">
        Descripción de la tarea realizada
        <button type="button" class="btn-voice" style="background:#e5e7eb; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer; margin-bottom: 0.25rem;">🎤 Audiodictado</button>
      </label>
      <textarea class="desc-task" rows="2" placeholder="Describa el trabajo o presione el micrófono..." ${isRequired ? 'required' : ''}></textarea>
    </div>
    
    <div class="grid-2" style="margin-bottom:1rem;">
      <div class="form-group" style="margin-bottom:0;">
        <label>Desde</label>
        <div style="display:flex; align-items:center; gap:4px; width:100%;">
           <select class="time-desde-h" style="flex:1; padding:0.6rem; text-align:center; font-size:1.1rem; border-color:var(--border);" ${isRequired ? 'required' : ''}>${optH}</select> <b style="font-size:1.2rem">:</b>
           <select class="time-desde-m" style="flex:1; padding:0.6rem; text-align:center; font-size:1.1rem; border-color:var(--border);" ${isRequired ? 'required' : ''}>${optM}</select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label>Hasta</label>
        <div style="display:flex; align-items:center; gap:4px; width:100%;">
           <select class="time-hasta-h" style="flex:1; padding:0.6rem; text-align:center; font-size:1.1rem; border-color:var(--border);" ${isRequired ? 'required' : ''}>${optH}</select> <b style="font-size:1.2rem">:</b>
           <select class="time-hasta-m" style="flex:1; padding:0.6rem; text-align:center; font-size:1.1rem; border-color:var(--border);" ${isRequired ? 'required' : ''}>${optM}</select>
        </div>
      </div>
    </div>
    <div class="form-group" style="margin-bottom:1.5rem;">
        <small class="row-tiempo" style="color:var(--text-muted); font-weight:500;">Tiempo de la tarea: 0h 0m</small>
    </div>

    <!-- Módulo de Compañeros de Tarea Local al Renglon -->
    <div class="form-group" style="background:#f3f4f6; padding:1rem; border-radius:4px; margin-bottom:1rem; border:1px solid #d1d5db;">
        <label style="font-weight:600; margin-bottom:0.5rem; display:block;">Cantidad Total de Operarios en esta Tarea</label>
        <select class="ot-operarios" style="max-width:300px; margin-bottom:0.5rem;">${opsHtml}</select>
        <div class="ot-companeros-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;"></div>
    </div>

    <!-- Selector de Tipo de Registro -->
    <div class="form-group" style="margin-bottom:1rem; border-bottom: 1px dashed var(--border); padding-bottom: 1rem;">
      <label style="font-weight:600;">Tipo de Registro</label>
      <select class="tipo-registro" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${optionsTipoRegistro}</select>
    </div>

    <!-- Sección Mantenimiento de Máquina (Default) -->
    <div class="section-maquina">
      <div class="form-group" style="background:#eef6fc; padding:1.25rem; border-radius:6px; margin-bottom:1rem; border:1px solid #bcdcf9;">
        <label style="color:var(--primary); font-weight:700; display:block; margin-bottom:0.5rem; font-size:1.05rem;">Máquina Intervenida</label>
        <select class="ot-maquina-trigger" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${optionsMaquinas}</select>
      </div>
    </div>

    <!-- Sección Edilicio / Varios -->
    <div class="section-edilicio hidden">
      <div class="form-group" style="background:#f0fdf4; padding:1.25rem; border-radius:6px; margin-bottom:1rem; border:1px solid #bbf7d0;">
        <label style="color:#15803d; font-weight:700; display:block; margin-bottom:0.5rem; font-size:1.05rem;">Categoría Edilicio / Varios</label>
        <select class="cat-edilicio" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${optionsEdilicio}</select>
      </div>
    </div>

    <!-- Sección Ausentismo -->
    <div class="section-ausentismo hidden">
      <div class="form-group" style="background:#fff1f2; padding:1.25rem; border-radius:6px; margin-bottom:1rem; border:1px solid #fecdd3;">
        <label style="color:#be123c; font-weight:700; display:block; margin-bottom:0.5rem; font-size:1.05rem;">Motivo Ausentismo / No Productivo</label>
        <select class="motivo-ausentismo" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${optionsAusentismo}</select>
      </div>
    </div>

    <!-- Módulo OT interno de la fila (se muestra solo si se selecciona máquina) -->
    <div class="modulo-ot hidden" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px dashed #bcdcf9;">
      <h5 style="margin-bottom:1rem; color:var(--primary); font-size:1rem; display:flex; justify-content:space-between;">
        <span>Detalles Complementarios para la OT</span>
        <span style="font-size:0.8rem; background:#eef6fc; padding:0.2rem 0.4rem; border-radius:4px; color:var(--primary-hover);">RPMT0002</span>
      </h5>

      <div class="form-group">
        <label>Naturaleza del Mantenimiento</label>
        <select class="ot-naturaleza">${optionsNaturaleza}</select>
      </div>

      <div class="form-group">
        <label style="font-weight:600; display:flex; justify-content:space-between; align-items:flex-end;">
          Desviación Detectada
          <button type="button" class="btn-voice-dev" style="background:#e5e7eb; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer; margin-bottom: 0.25rem;">🎤 Audiodictado</button>
        </label>
        <textarea class="ot-desviacion" placeholder="Detalle el problema detectado o pulse el micrófono..."></textarea>
      </div>

      <div class="form-group">
        <label style="font-weight:600; display:flex; justify-content:space-between; align-items:flex-end;">
          Tareas Realizadas
          <button type="button" class="btn-voice-tar" style="background:#e5e7eb; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer; margin-bottom: 0.25rem;">🎤 Audiodictado</button>
        </label>
        <textarea class="ot-tareas" placeholder="Detalle los trabajos finos, respuestos utilizados..."></textarea>
      </div>

      <div class="form-group">
        <label style="font-weight:600; display:flex; justify-content:space-between; align-items:flex-end;">
          Observaciones / Tareas recomendadas
          <button type="button" class="btn-voice-obs" style="background:#e5e7eb; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer; margin-bottom: 0.25rem;">🎤 Audiodictado</button>
        </label>
        <textarea class="ot-observaciones" placeholder="Indique si hay tareas pendientes o recomendaciones para el futuro..."></textarea>
      </div>

      <div class="form-group" style="margin-bottom:1.5rem;">
        <label>Horas Hombre (HH) Totales: <span class="ot-hh" style="font-weight: 700; color: var(--primary);">0</span></label>
      </div>

      <div class="form-group switch-container" style="background:#fff3cd; border-color:#ffeeba;">
        <label style="margin: 0; font-weight:600; color: #856404;">¿Afectó la Disponibilidad Productiva?</label>
        <label class="switch">
          <input type="checkbox" class="chk-disp">
          <span class="slider"></span>
        </label>
      </div>

      <div class="modulo-parada hidden card" style="background:#fffcf2; border:1px solid #fde047; box-shadow:none; padding:1rem; margin-top:1rem;">
        <div style="margin-bottom: 1rem;"><strong>Registro de Parada:</strong></div>
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size:0.8rem">Inicio Fuera de Servicio</label>
            <div style="display:flex; flex-direction:column; gap:0.5rem">
              <input type="date" class="parada-i-fecha" style="width:100%;">
              <div style="display:flex; align-items:center; gap:2px; width:100%;">
                 <select class="parada-i-h" style="flex:1; padding:0.5rem;">${optH}</select> <b>:</b> <select class="parada-i-m" style="flex:1; padding:0.5rem;">${optM}</select>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label style="font-size:0.8rem">Fin Fuera de Servicio</label>
            <div style="display:flex; flex-direction:column; gap:0.5rem">
              <input type="date" class="parada-f-fecha" style="width:100%;">
              <div style="display:flex; align-items:center; gap:2px; width:100%;">
                 <select class="parada-f-h" style="flex:1; padding:0.5rem;">${optH}</select> <b>:</b> <select class="parada-f-m" style="flex:1; padding:0.5rem;">${optM}</select>
              </div>
            </div>
          </div>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <small class="parada-tiempo" style="color: var(--danger); font-weight: 500;">Tiempo de Parada: 0h 0m</small>
        </div>
      </div>

      <div class="form-group" style="margin-top: 1.5rem;">
        <label style="font-weight:600;">Estado Final de la Máquina</label>
        <div style="display: flex; gap: 1.5rem; margin-top: 0.75rem;">
          <label style="font-weight: normal; cursor:pointer;"><input type="radio" name="estado_${rowId}" value="Funcional" checked> Funcional</label>
          <label style="font-weight: normal; cursor:pointer;"><input type="radio" name="estado_${rowId}" value="No Funcional"> No Funcional</label>
        </div>
      </div>
    </div>
  `;

  // UI Setup Map
  const triggerMaquina = div.querySelector('.ot-maquina-trigger');
  const modOt = div.querySelector('.modulo-ot');
  const otOperarios = div.querySelector('.ot-operarios');
  const otCompsGrid = div.querySelector('.ot-companeros-grid');

  const chkDisp = div.querySelector('.chk-disp');
  const modParada = div.querySelector('.modulo-parada');
  const pIF = div.querySelector('.parada-i-fecha');
  const pIH = div.querySelector('.parada-i-h');
  const pIM = div.querySelector('.parada-i-m');
  const pFF = div.querySelector('.parada-f-fecha');
  const pFH = div.querySelector('.parada-f-h');
  const pFM = div.querySelector('.parada-f-m');

  const descTask = div.querySelector('.desc-task');
  const otDesviacion = div.querySelector('.ot-desviacion');
  const otTareas = div.querySelector('.ot-tareas');

  const setupMic = (btn, targetInput) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'es-AR'; rec.interimResults = false;
      rec.onstart = () => { btn.style.background = 'var(--danger)'; btn.style.color = '#fff'; };
      rec.onresult = (e) => { targetInput.value += (targetInput.value ? ' ' : '') + e.results[0][0].transcript; targetInput.dispatchEvent(new Event('input')); };
      rec.onend = () => { btn.style.background = '#e5e7eb'; btn.style.color = 'var(--text-main)'; };
      rec.onerror = () => { alert("Error en micrófono. Revisa permisos."); btn.style.background = '#e5e7eb'; btn.style.color = 'var(--text-main)'; };
      btn.addEventListener('click', () => rec.start());
    } else { btn.style.display = 'none'; }
  };

  setupMic(div.querySelector('.btn-voice'), descTask);
  setupMic(div.querySelector('.btn-voice-dev'), otDesviacion);
  setupMic(div.querySelector('.btn-voice-tar'), otTareas);
  setupMic(div.querySelector('.btn-voice-obs'), div.querySelector('.ot-observaciones'));

  otOperarios.addEventListener('change', (e) => {
    otCompsGrid.innerHTML = '';
    let c = parseInt(e.target.value) || 1;
    if (c > 1) {
      const dynamicOptionsHtml = getCompanionOptionsHTML();
      for (let i = 1; i < c; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'form-group';
        wrap.style.marginBottom = '0';
        wrap.innerHTML = `<label style="font-size:0.85rem">Compañero ${i}</label><select class="ot-companero-select">${dynamicOptionsHtml}</select>`;
        otCompsGrid.appendChild(wrap);
      }
      
      const allSels = otCompsGrid.querySelectorAll('.ot-companero-select');
      const updateDisabledOptions = () => {
        const selected = Array.from(allSels).map(s => s.value).filter(v => v !== "");
        allSels.forEach(s => {
          const currentVal = s.value;
          Array.from(s.options).forEach(opt => {
            if (opt.value && opt.value !== currentVal && selected.includes(opt.value)) {
              opt.disabled = true;
            } else {
              opt.disabled = false;
            }
          });
        });
      };
      allSels.forEach(s => s.addEventListener('change', updateDisabledOptions));
    }
    updateTiempoTotal();
  });

  const triggerRecalc = () => updateTiempoTotal();
  div.querySelector('.time-desde-h').addEventListener('change', triggerRecalc);
  div.querySelector('.time-desde-m').addEventListener('change', triggerRecalc);
  div.querySelector('.time-hasta-h').addEventListener('change', triggerRecalc);
  div.querySelector('.time-hasta-m').addEventListener('change', triggerRecalc);

  // Lógica de Tipo de Registro
  const tipoSel = div.querySelector('.tipo-registro');
  const secMaquina = div.querySelector('.section-maquina');
  const secEdilicio = div.querySelector('.section-edilicio');
  const secAusentismo = div.querySelector('.section-ausentismo');

  tipoSel.addEventListener('change', () => {
    const val = tipoSel.value;
    secMaquina.classList.add('hidden');
    secEdilicio.classList.add('hidden');
    secAusentismo.classList.add('hidden');
    modOt.classList.add('hidden');

    if (val === 'MAQUINA') {
      secMaquina.classList.remove('hidden');
      if (triggerMaquina.value !== "") modOt.classList.remove('hidden');
    } else if (val === 'EDILICIO') {
      secEdilicio.classList.remove('hidden');
    } else if (val === 'AUSENTISMO') {
      secAusentismo.classList.remove('hidden');
    }
    triggerRecalc();
  });

  // Reemplazo fundamental: Mostrar si el operario seleccionó Máquina
  triggerMaquina.addEventListener('change', (e) => {
    const isOt = e.target.value !== "";
    if (isOt && tipoSel.value === 'MAQUINA') {
      modOt.classList.remove('hidden');
      div.querySelector('.ot-naturaleza').required = true;
      if (!otTareas.dataset.edited) otTareas.value = descTask.value;
    } else {
      modOt.classList.add('hidden');
      div.querySelector('.ot-naturaleza').required = false;
    }
    triggerRecalc();
  });

  otTareas.addEventListener('input', () => { otTareas.dataset.edited = 'true'; });
  descTask.addEventListener('input', () => {
    const isOt = triggerMaquina.value !== "";
    if (isOt && !otTareas.dataset.edited) otTareas.value = descTask.value;
  });

  chkDisp.addEventListener('change', (e) => {
    if (e.target.checked) { modParada.classList.remove('hidden');[pIF, pIH, pIM, pFF, pFH, pFM].forEach(x => x.required = true); }
    else { modParada.classList.add('hidden');[pIF, pIH, pIM, pFF, pFH, pFM].forEach(x => x.required = false); }
  });

  const calcParada = () => {
    const pTiempo = div.querySelector('.parada-tiempo');
    if (pIF.value && pIH.value && pIM.value && pFF.value && pFH.value && pFM.value) {
      let idt = new Date(`${pIF.value}T${pIH.value}:${pIM.value}`);
      let fdt = new Date(`${pFF.value}T${pFH.value}:${pFM.value}`);
      if (fdt >= idt) {
        let dh = getStopTimeAdjusted(idt, fdt, currentPlant);
        let totalMins = Math.round(dh * 60);
        let hrs = Math.floor(totalMins / 60);
        let mins = totalMins % 60;
        pTiempo.textContent = `Tiempo de Parada: ${hrs}h ${mins}m`;
        return;
      }
    }
    pTiempo.textContent = `Tiempo de Parada: 0h 0m`;
  };
  [pIF, pIH, pIM, pFF, pFH, pFM].forEach(el => el.addEventListener('change', calcParada));

  if (!isRequired) div.querySelector('.btn-remove-task').addEventListener('click', () => { div.remove(); triggerRecalc(); });

  tareasContainer.appendChild(div);
}

function getStopTimeAdjusted(di, df, plant) {
  if (plant !== 'SL2') return (df - di) / (1000 * 60 * 60);
  
  // Rango productivo SL2: 06:00 a 14:48
  const shiftStartMin = 6 * 60; // 360
  const shiftEndMin = 14 * 60 + 48; // 888
  
  let totalMinutesOverlap = 0;
  let cursor = new Date(di.getTime());
  
  while (cursor < df) {
    let y = cursor.getFullYear(), m = cursor.getMonth(), d = cursor.getDate();
    
    // Inicio y fin del turno para el día del cursor
    let sStart = new Date(y, m, d, 6, 0, 0);
    let sEnd   = new Date(y, m, d, 14, 48, 0);
    
    let overlapStart = new Date(Math.max(cursor.getTime(), sStart.getTime()));
    let overlapEnd   = new Date(Math.min(df.getTime(), sEnd.getTime()));
    
    if (overlapStart < overlapEnd) {
      totalMinutesOverlap += (overlapEnd - overlapStart) / (1000 * 60);
    }
    
    // Avanzar al inicio del día siguiente
    cursor = new Date(y, m, d + 1, 0, 0, 0);
  }
  
  return totalMinutesOverlap / 60;
}

function initRows() {
  tareasContainer.innerHTML = '';
  rowCount = 0;
  addTaskRow(true);
}

btnAddTask.addEventListener('click', () => addTaskRow(false));


// --- VALIDATIONS ---
function diffHours(start, end) {
  if (!start || !end || start.includes('MM') || end.includes('MM')) return 0;
  const s = start.split(':'), e = end.split(':');
  const dStart = new Date(2000, 0, 1, s[0], s[1]), dEnd = new Date(2000, 0, 1, e[0], e[1]);
  if (dEnd <= dStart) return -1;
  return (dEnd - dStart) / (1000 * 60 * 60);
}

document.getElementById('fecha').addEventListener('change', () => {
  updateTiempoTotal();
  renderOperatorSidebar();
});

function updateTiempoTotal() {
  let totalH = 0, hasError = false, validIntervals = [];
  const curDate = document.getElementById('fecha').value;
  const curOp = document.getElementById('operario').value;
  const outputTiempoTotal = document.getElementById('tiempo_total');
  const pastTasks = tasks.filter(t => {
    if (t.date !== curDate) return false;
    if (t.operator === curOp) return true;
    if (t.companions) {
      const comps = t.companions.split(',').map(c => c.trim());
      return comps.includes(curOp);
    }
    return false;
  });

  let companionOverlapAlertTriggered = false;

  document.querySelectorAll('.task-row').forEach((row, index) => {
    let dhs = row.querySelector('.time-desde-h').value, dms = row.querySelector('.time-desde-m').value;
    let d = (dhs && dms) ? `${dhs}:${dms}` : '';
    let hhs = row.querySelector('.time-hasta-h').value, hms = row.querySelector('.time-hasta-m').value;
    let h = (hhs && hms) ? `${hhs}:${hms}` : '';

    let rowTiempo = row.querySelector('.row-tiempo');
    let hhOut = row.querySelector('.ot-hh');

    // El estado OT ahora depende únicamente de que se haya elegido una Máquina
    const representsOT = row.querySelector('.ot-maquina-trigger').value !== "";

    if (d && h) {
      let dh = diffHours(d, h);
      if (dh < 0) {
        hasError = true; rowTiempo.textContent = `Error: Hora 'Hasta' inválida`; rowTiempo.style.color = 'var(--danger)';
        if (hhOut) hhOut.textContent = "0";
      } else {
        let formOverlap = validIntervals.find(inv => d < inv.h && inv.d < h);
        let passedOverlap = null;
        if (curDate && curOp) passedOverlap = pastTasks.find(t => t.from && t.to && d < t.to && t.from < h);

        if (formOverlap) {
          hasError = true; rowTiempo.textContent = `Solapa con Renglón ${formOverlap.index}`; rowTiempo.style.color = 'var(--danger)';
          if (hhOut) hhOut.textContent = "0";
        } else if (passedOverlap) {
          hasError = true;
          if (passedOverlap.operator !== curOp) {
            companionOverlapAlertTriggered = true;
            rowTiempo.textContent = `Ya fuiste cargado como acompañante de ${passedOverlap.operator}`;
          } else {
            rowTiempo.textContent = `Horario superpuesto usado antes`;
          }
          rowTiempo.style.color = 'var(--danger)';
          if (hhOut) hhOut.textContent = "0";
        } else {
          totalH += dh; validIntervals.push({ d, h, index: index + 1 });
          let hrs = Math.floor(dh); rowTiempo.textContent = `Tiempo tarea: ${hrs}h ${Math.round((dh - hrs) * 60)}m`; rowTiempo.style.color = 'var(--text-muted)';
          if (representsOT) {
            let ops = parseInt(row.querySelector('.ot-operarios').value) || 1;
            if (hhOut) hhOut.textContent = (dh * ops).toFixed(2);
          }
        }
      }
    } else {
      rowTiempo.textContent = `Tiempo de la tarea: 0h 0m`; rowTiempo.style.color = 'var(--text-muted)';
      if (hhOut) hhOut.textContent = "0";
    }
  });

  if (hasError) {
    outputTiempoTotal.textContent = `Error en horas (Verifica colores rojos)`; outputTiempoTotal.style.color = 'var(--danger)';
    outputTiempoTotal.dataset.companionOverlap = companionOverlapAlertTriggered ? 'true' : 'false';
  } else {
    outputTiempoTotal.textContent = `Tiempo total jornada: ${Math.floor(totalH)}h ${Math.round((totalH - Math.floor(totalH)) * 60)}m`; outputTiempoTotal.style.color = 'var(--primary)';
    outputTiempoTotal.dataset.companionOverlap = 'false';
  }
}

// FORM SUBMIT (LOCAL SAVE TO CACHE)
document.getElementById('form-operator').addEventListener('submit', (e) => {
  e.preventDefault();
  updateTiempoTotal();
  const timeOutput = document.getElementById('tiempo_total');

  if (timeOutput.dataset.companionOverlap === 'true') {
    return alert("ACCIÓN RESTRINGIDA\n\nEn este rango de horarios y fecha ya te encuentras asignado como operador acompañante en otra tarea.\n\nEn caso de querer modificarlo, debes comunicarte con el Supervisor para que éste lo detalle en las Observaciones de las tareas ya cargadas.");
  }
  if (timeOutput.textContent.includes('Error')) {
    return alert("Por favor corrige los solapamientos de tiempo remarcados en rojo.");
  }

  let validRows = [], processFailed = false;

  document.querySelectorAll('.task-row').forEach((row) => {
    if (processFailed) return;
    const desc = row.querySelector('.desc-task').value.trim();
    let dhs = row.querySelector('.time-desde-h').value, dms = row.querySelector('.time-desde-m').value;
    const desde = (dhs && dms) ? `${dhs}:${dms}` : '';
    let hhs = row.querySelector('.time-hasta-h').value, hms = row.querySelector('.time-hasta-m').value;
    const hasta = (hhs && hms) ? `${hhs}:${hms}` : '';

    const tipo = row.querySelector('.tipo-registro').value;
    const triggerMachineCode = row.querySelector('.ot-maquina-trigger').value;
    const catEdilicio = row.querySelector('.cat-edilicio').value;
    const motAusentismo = row.querySelector('.motivo-ausentismo').value;
    
    const isOt = tipo === 'MAQUINA' && triggerMachineCode !== "";

    if (!desc || !desde || !hasta) return;
    const dh = diffHours(desde, hasta);
    let taskData = { desc, desde, hasta, time: dh, hasOT: isOt, type: tipo };

    if (tipo === 'MAQUINA') taskData.machine = triggerMachineCode;
    else if (tipo === 'EDILICIO') taskData.category = catEdilicio;
    else if (tipo === 'AUSENTISMO') taskData.category = motAusentismo;

    taskData.opsCount = row.querySelector('.ot-operarios').value;
    const compSelects = row.querySelectorAll('.ot-companero-select');
    for (let s of compSelects) {
      if (!s.value) { alert("Por favor, selecciona los nombres de todos los compañeros en la tarea."); processFailed = true; return; }
    }
    taskData.companions = Array.from(compSelects).map(s => s.value).filter(v => v).join(', ');

    // Validación de categorías para Edilicio y Ausentismo
    if (tipo === 'EDILICIO' && !catEdilicio) { alert("Por favor selecciona una categoría para el registro Edilicio."); processFailed = true; return; }
    if (tipo === 'AUSENTISMO' && !motAusentismo) { alert("Por favor selecciona un motivo para el Ausentismo."); processFailed = true; return; }

    if (isOt) {
      taskData.machine = triggerMachineCode;
      taskData.nature = row.querySelector('.ot-naturaleza').value;
      taskData.deviation = row.querySelector('.ot-desviacion').value;
      taskData.tasksDone = row.querySelector('.ot-tareas').value;
      taskData.recommendations = row.querySelector('.ot-observaciones').value;
      taskData.manHours = (dh * parseInt(taskData.opsCount)).toFixed(2);
      const isDisp = row.querySelector('.chk-disp').checked;
      taskData.affectsDisp = isDisp;
      taskData.finalState = Array.from(row.querySelectorAll('input[type="radio"]')).find(r => r.checked)?.value || '';

      if (isDisp) {
        const pIH = row.querySelector('.parada-i-h').value; const pIM = row.querySelector('.parada-i-m').value;
        const pFH = row.querySelector('.parada-f-h').value; const pFM = row.querySelector('.parada-f-m').value;
        const pIF = row.querySelector('.parada-i-fecha').value; const pFF = row.querySelector('.parada-f-fecha').value;
        let di = new Date(`${pIF}T${pIH}:${pIM}`);
        let df = new Date(`${pFF}T${pFH}:${pFM}`);
        if (df < di) { alert(`Error en fechas de parada.`); processFailed = true; return; }
        taskData.startOut = `${pIF} ${pIH}:${pIM}`;
        taskData.endOut = `${pFF} ${pFH}:${pFM}`;
        taskData.stopTime = getStopTimeAdjusted(di, df, currentPlant).toFixed(2);
      }
    }
    validRows.push(taskData);
  });

  if (processFailed) return;
  if (validRows.length === 0) return alert("Completa al menos un renglón.");

  const date = document.getElementById('fecha').value;
  const operator = document.getElementById('operario').value;
  const shift = document.getElementById('turno').value;
  const batchId = Date.now().toString();

  const finalTasks = validRows.map((r, idx) => {
    let out = {
      id: batchId + '_' + idx, status: 'PENDING',
      plant: currentPlant, date, shift, operator,
      from: r.desde, to: r.hasta, totalTime: r.time.toFixed(2),
      description: r.desc, hasOT: r.hasOT, opsCount: r.opsCount, companions: r.companions,
      type: r.type, category: r.category || ''
    };
    if (r.hasOT) {
      Object.assign(out, {
        machine: r.machine, nature: r.nature,
        deviation: r.deviation, tasksDone: r.tasksDone, recommendations: r.recommendations, manHours: r.manHours, affectsDisp: r.affectsDisp,
        finalState: r.finalState, startOut: r.startOut, endOut: r.endOut, stopTime: r.stopTime
      });
    }
    return out;
  });

  // LOCAL MEMORY PUSH
  tasks = [...tasks, ...finalTasks];
  saveTasks();

  // NUBE MEMORY PUSH (Pendientes - En segundo plano)
  fetch(GAS_URL, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'save_pending', tasks: finalTasks })
  }).catch(e => console.log('Envío background fallido', e));

  alert("¡Jornada subida con éxito! Las tareas ingresaron como 'Pendientes' en la Nube y aguardan revisión del supervisor acá mismo.");
  document.getElementById('form-operator').reset();
  initRows(); document.getElementById('fecha').valueAsDate = new Date();
  updateTiempoTotal();
  renderOperatorSidebar();
});

// --- OPERATOR SIDEBAR RENDERER ---
function renderOperatorSidebar() {
    const listDiv = document.getElementById('operator-tasks-list');
    if(!listDiv) return;

    const curDate = document.getElementById('fecha').value;
    const curOp = document.getElementById('operario').value;
    
    if(!curDate || !curOp) {
       listDiv.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:1.5rem 0;">Aguardando selección de operario...</div>';
       return;
    }

    listDiv.innerHTML = '';
    
    const myTasks = tasks.filter(t => {
        if (t.date !== curDate || t.plant !== currentPlant) return false;
        if (t.operator === curOp) return true;
        if (t.companions) {
            const comps = t.companions.split(',').map(c => c.trim());
            return comps.includes(curOp);
        }
        return false;
    });

    if(myTasks.length === 0) {
        listDiv.innerHTML = '<div style="text-align:center; color:var(--text-muted); font-size:0.9rem; padding:1.5rem 0;">Aún no tienes tareas cargadas en esta jornada.</div>';
    } else {
        myTasks.sort((a,b) => a.from.localeCompare(b.from)).forEach(t => {
           let theHtml = `
             <div style="background:#f9fafb; border:1px solid #e5e7eb; border-left:4px solid ${t.hasOT ? '#0284c7' : (t.type === 'AUSENTISMO' ? '#be123c' : '#10b981')}; border-radius:4px; padding:0.75rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                   <strong style="color:var(--text-main); font-size:0.95rem;">${t.from} a ${t.to} (${t.totalTime}h)</strong>
                </div>
                <div style="margin-bottom:0.25rem; font-size:0.9rem; color:var(--text-main);">${t.description}</div>
           `;
           if(t.hasOT) {
              theHtml += `<div style="font-size:0.8rem; color:var(--primary); margin-top:0.25rem;"><strong>OT Máquina:</strong> ${t.machine}</div>`;
           } else if(t.type === 'EDILICIO' || t.type === 'AUSENTISMO') {
              theHtml += `<div style="font-size:0.8rem; color:${t.type === 'EDILICIO' ? '#15803d' : '#be123c'}; margin-top:0.25rem;"><strong>${t.type === 'EDILICIO' ? 'Edilicio/Varios' : 'Ausentismo'}:</strong> ${t.category}</div>`;
           }
           if (t.operator !== curOp) {
              theHtml += `<div style="font-size:0.8rem; color:#8b5cf6; margin-top:0.25rem;"><strong>Trabajaste asistiendo a:</strong> ${t.operator}</div>`;
           }
           theHtml += `</div>`;
           listDiv.innerHTML += theHtml;
        });
    }
}

// --- SUPERVISOR GOOGLE CALENDAR LOGIC ---

document.getElementById('visor-fecha').valueAsDate = new Date();
document.getElementById('visor-fecha').addEventListener('change', () => { if (supervisorLoggedIn) renderCalendar(); });

const PIXEL_PER_MINUTE = 1.5;

function renderCalendar() {
  const visorDate = document.getElementById('visor-fecha').value;
  drawCalendarGrid(visorDate);
}

function drawCalendarGrid(visorDate) {
  const axis = document.getElementById('calendar-time-axis');
  const opsDiv = document.getElementById('calendar-operators');
  axis.innerHTML = ''; opsDiv.innerHTML = '';

  axis.style.height = (24 * 60 * PIXEL_PER_MINUTE) + 'px';
  for (let h = 0; h < 24; h++) {
    const lbl = document.createElement('div');
    lbl.style.cssText = `position:absolute; top:${h * 60 * PIXEL_PER_MINUTE}px; left:0; width:100%; border-top:1px solid #d1d5db; color:var(--text-muted); font-size:0.75rem; text-align:right; padding-right:4px; height:${60 * PIXEL_PER_MINUTE}px; box-sizing:border-box;`;
    lbl.innerHTML = `<span style="position:relative; top:-8px; background:#fffcf2; padding:0 2px;">${String(h).padStart(2, '0')}:00</span>`;
    axis.appendChild(lbl);
  }

  const opsForCol = operatorDict[currentPlant] || [];

  // Paleta de colores distinguibles por operario
  const OPERATOR_PALETTE = [
    { border: '#7c3aed', bg: 'rgba(124, 58, 237, 0.13)' },  // violeta
    { border: '#db2777', bg: 'rgba(219, 39, 119, 0.13)' },  // rosa
    { border: '#d97706', bg: 'rgba(217, 119, 6, 0.13)'  },  // naranja
    { border: '#0891b2', bg: 'rgba(8, 145, 178, 0.13)'  },  // cian
    { border: '#16a34a', bg: 'rgba(22, 163, 74, 0.13)'  },  // verde
  ];

  // Mapa de: nombre_operario -> índice de color
  const opColorIndex = {};
  opsForCol.forEach((name, i) => { opColorIndex[name] = i % OPERATOR_PALETTE.length; });

  opsForCol.forEach(opName => {
    // EXTRAE TAREAS DONDE ES PRINCIPAL O APARECE COMO COMPAÑERO
    const opTasks = tasks.filter(t => {
      if (t.date !== visorDate || t.plant !== currentPlant || t.status !== 'PENDING') return false;
      if (t.operator === opName) return true;
      if (t.companions) {
        const compsArr = t.companions.split(',').map(c => c.trim());
        if (compsArr.includes(opName)) return true;
      }
      return false;
    });

    const col = document.createElement('div');
    col.style.cssText = `flex:1; position:relative; min-width:180px; border-left:1px dashed #e5e7eb;`;

    const header = document.createElement('div');
    const opIdx = opColorIndex[opName] ?? 0;
    const opColor = OPERATOR_PALETTE[opIdx];
    header.style.cssText = `position:sticky; top:0; z-index:10; background:${opColor.bg}; text-align:center; font-weight:bold; padding:0.5rem; border-bottom:3px solid ${opColor.border}; box-shadow: 0 2px 4px rgba(0,0,0,0.08); color:${opColor.border};`;
    header.textContent = opName;

    const timeline = document.createElement('div');
    timeline.style.cssText = `position:relative; width:100%; height:${24 * 60 * PIXEL_PER_MINUTE}px; background:rgba(255,255,255,0.5);`;

    opTasks.forEach(t => {
      const tStart = t.from.split(':');
      const tMin = parseInt(tStart[0]) * 60 + parseInt(tStart[1]);
      const tDurMin = Math.round(parseFloat(t.totalTime) * 60);

      const block = document.createElement('div');

      // El color lo determina el OPERARIO PRINCIPAL de la tarea (dueño), 
      // así las tareas compartidas quedan del mismo color en ambas columnas.
      const ownerIdx = opColorIndex[t.operator] ?? 0;
      const colorBorder = OPERATOR_PALETTE[ownerIdx].border;
      const colorBg    = OPERATOR_PALETTE[ownerIdx].bg;

      block.style.cssText = `
            position:absolute; top:${tMin * PIXEL_PER_MINUTE}px; left:2%; width:96%; height:${tDurMin * PIXEL_PER_MINUTE}px;
            background:${colorBg}; border:1px solid ${colorBorder}; border-left:4px solid ${colorBorder};
            border-radius:4px; padding:4px; font-size:0.75rem; overflow:hidden; cursor:pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition:transform 0.1s; display:flex; flex-direction:column;
         `;
      if (tDurMin < 30) block.style.flexDirection = 'row';

      block.addEventListener('mouseover', () => block.style.transform = 'scale(1.02)');
      block.addEventListener('mouseout', () => block.style.transform = 'none');
      block.addEventListener('click', () => openSupervisorModal(t));

      block.innerHTML = `
            <strong style="color:${colorBorder}; margin-right:4px;">${t.from}-${t.to}</strong>
            <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden; display:block;">
               ${t.type === 'MAQUINA' ? (t.machine + ': ' + t.description) : (t.category + ': ' + t.description)}
            </span>
         `;
      timeline.appendChild(block);
    });

    col.appendChild(header);
    col.appendChild(timeline);
    opsDiv.appendChild(col);
  });

  if (opsForCol.length === 0) {
    opsDiv.innerHTML = `<div style="text-align:center; padding: 2rem; width:100%;">Esta planta no tiene operarios configurados en la lista de recursos humanos.</div>`;
  }
}

// MODAL LOGIC
const modalSup = document.getElementById('modal-supervisor');
const obsField = document.getElementById('modal-obs');
document.getElementById('btn-modal-close-icon').addEventListener('click', () => { modalSup.classList.add('hidden'); });

function openSupervisorModal(t) {
  currentInspectingTask = t;
  const content = document.getElementById('modal-content');
  obsField.value = t.obsSup || '';

  let html = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
       <div><strong>Operario:</strong> ${t.operator} ${t.companions ? `(y ${t.companions})` : ''}</div>
       <div><strong>Sede/Planta:</strong> <span class="tag">${t.plant}</span></div>
       <div><strong>Horario:</strong> ${t.from} a ${t.to} (${t.totalTime}h)</div>
       <div><strong>Turno:</strong> ${t.shift}</div>
    </div>
    <div style="background:#f3f4f6; padding:0.75rem; border-radius:4px; margin-bottom:1rem;">
       <strong>Descripción:</strong><br/> ${t.description}
    </div>
  `;
  if (t.hasOT) {
    html += `
       <h4 style="color:var(--primary); margin-bottom:0.5rem; text-decoration:underline;">Orden de Trabajo</h4>
       <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div><strong>Máquina:</strong> ${t.machine}</div><div><strong>Naturaleza:</strong> ${t.nature}</div>
          <div><strong>Horas Hombre Calc:</strong> ${t.manHours} HH</div><div><strong>Estado Final:</strong> ${t.finalState}</div>
       </div><div style="margin-top:0.5rem;"><strong>Desviación:</strong> ${t.deviation || '-'}</div>
       <div style="margin-top:0.5rem;"><strong>Tareas Explicitas:</strong> ${t.tasksDone || '-'}</div>
       <div style="margin-top:0.5rem;"><strong>Observaciones / Tareas recomendadas:</strong> ${t.recommendations || '-'}</div>
     `;
    if (t.affectsDisp) {
      html += `<div style="margin-top:0.75rem; color:var(--danger)"><strong>Máquina parada:</strong> Desde ${t.startOut} hasta ${t.endOut} (${t.stopTime}h paradas).</div>`;
    }
  }
  content.innerHTML = html;
  modalSup.classList.remove('hidden');
}

// --------------------------------------------------------
// CLOUD HYBRID PIPELINE
// Las promesas se disparan solo cuando el supervisor aprueba
// --------------------------------------------------------
const apiHybridPush = (btnId) => {
   if(!currentInspectingTask) return;
   const btn = document.getElementById(btnId);
   const prevText = btn.textContent;
   btn.textContent = 'Guardando...'; btn.disabled = true;
   
   const taskToPush = { ...currentInspectingTask };
   
   fetch(GAS_URL, {
       method: 'POST', mode: 'no-cors',
       headers: { 'Content-Type': 'text/plain;charset=utf-8' },
       body: JSON.stringify({ action: 'approve_pending', id: taskToPush.id, obs: obsField.value.trim() })
   })
   .then(() => new Promise(res => setTimeout(res, 400))) // Leve margen
   .then(() => {
       tasks = tasks.filter(t => t.id !== taskToPush.id);
       saveTasks();
       modalSup.classList.add('hidden');
       renderCalendar();
   }).finally(() => {
       btn.textContent = prevText; btn.disabled = false;
   });
};

document.getElementById('btn-modal-approve').addEventListener('click', () => apiHybridPush('btn-modal-approve'));

document.getElementById('btn-modal-reject').addEventListener('click', (e) => {
   if(!currentInspectingTask) return;
   if(!confirm("⚠️ ATERTENCIA\n\n¿Seguro que deseas ELIMINAR esta tarea de tu Tablet y también de la hoja de 'Pendientes' de Google Sheets permanentemente?")) return;
   
   const targetBtn = e.target;
   const prevText = targetBtn.textContent;
   targetBtn.textContent = 'Borrando...'; targetBtn.disabled = true;

   fetch(GAS_URL, {
       method: 'POST', mode: 'no-cors',
       headers: { 'Content-Type': 'text/plain;charset=utf-8' },
       body: JSON.stringify({ action: 'reject_pending', id: currentInspectingTask.id })
   })
   .then(() => new Promise(res => setTimeout(res, 400)))
   .then(() => {
       tasks = tasks.filter(t => t.id !== currentInspectingTask.id);
       saveTasks();
       modalSup.classList.add('hidden');
       renderCalendar();
   }).finally(() => {
       targetBtn.textContent = prevText; targetBtn.disabled = false;
   });
});
