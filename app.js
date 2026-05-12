// Constants
const GAS_URL = "https://script.google.com/macros/s/AKfycbwNollSq7D-EYekloM94WS_s-xixcw00NwasNLTBg_s6Gu2aCXTbWIhO8pzMnCGxqUD/exec";

const machineDict = {
  "SL2": [
    "R31 - Puente grúa 3TN",
    "R32 - Puente grúa 3TN",
    "R33 - Puente grúa 15TN",
    "R34 - Puente grúa Forvis 5TN",
    "R36 - Puente grúa 5TN",
    "R38 - Puente grúa Jaso 20TN",
    "FL02 - Flejadora",
    "P05 - Compresor CSB tornillo 8 BAR Ceccato",
    "P06 - Schulz SRP 3030 30 HP",
    "PE01 - Perfiladora chapa sinusoidal - OND 18",
    "PE02 - Perfiladora chapa trapezoidal - TP 101",
    "M01 - Conformadora Gallega MEP 2\" / 2mm Termathool 200KW",
    "M03 - Conformadora de caños",
    "M05 - Conformadora de perfil C",
    "M06 - Conformadora 1 1/2\" / 2mm con soldadora Termathool 100 KW",
    "M07 - Conformadora de tubos Olimpia 80",
    "M08 - Conformadora de perfiles Dry Wall Double Rows Roll - Omega",
    "M09 - Conformadora de perfiles Dry Wall Montante",
    "M10 - Conformadora de perfiles Dry Wall Solera U",
    "M11 - Conformadora de perfiles Dry Wall Triple Rows Roll - Cantonera",
    "SEC03 - Secador de aire - SRS 190 - Schulz",
    "S08 - Autoelevador motor Fiat 3 cilindros",
    "S10 - Autoelevador Maximal 25M 2,5TN",
    "SA04 - Autoelevador alquilado",
    "X40 - Balanza - Pilon - Integral Trade 021208 - 20TN",
    "X42 - Balanza - Pilon - Integral Trade 065123 - 3TN"
  ],
  "SL1": [
    "TEJ01 - Tejedora Bergandi F500", "TEJ02 - Tejedora Vitari MG3", "TEJ03 - Tejedora Servet generico", "TEJ04 - Tejedora Vitari MG1", "TEJ05 - Tejedora Servet generico", "TEJ06 - Tejedora Vitari MG2", "TEJ07 - Tejedora Servet generico", "TEJ08 - Tejedora Servet generico", "TEJ09 - Tejedora Servet generico", "TEJ12 - Tejedora 760-76.2mm", "TEJ13 - Tejedora 630-63.5mm", "R35 - Puente grua 3TN", "R37 - Puente grua3TN - Nave 3 Sur", "R39 - Puente grua FORVIS 5TN", "R40 - Puente grua MSV 7TN", "R41 - Puente grua Jaso 5TN - Nave 1", "R42 - Puente grua Jaso 3,2TN - Nave 2 Norte", "R43 - Puente grua Jaso 5TN", "R44 - Puente grua Jaso 3,2TN - Nave 3", "R45 - Puente grua Jaso 5TN - Nave 3 Norte", "S09 - Autoelevador Toyota 3,5TN", "S14 - Autoelevador Xinchai 3TN", "S16 - Autoelevador Liugong 2.5 TN", "SA02 - Autoelevador alq. Michigan", "P08 - Compresor Sullair 4509", "P09 - Compresor Sullair 4509", "P12 - Compresor de aire FMT", "H08 - Schnell Reta Enderezadora", "H09 - Mep Bitronic 16-2 Enderezadora", "Q03 - Guillotina de chapas sinusoidal", "Q07 - Guillotina de chapas trapesoidal", "K13 - Soldadora a tope varillas", "EM02 - Empaqueradora Feiyu YC-420B", "MEP02 - Malladora Mep P-WELD-HA 24 Hilos", "CLA01 - Clavos Enkotec M101", "ESP01 - Espiraladora Enkotec TR01", "ALA01 - Alimentador de alambre", "SEC02 - Secador Sullair", "X23 - Balanza AHS - 5TN - AHS - II R - NARANJA", "X26 - Balanza AHS - 5TN -AHS - II R - NARANJA", "X27 - Balanza AHS - 5TN - AHS - I R - AMARILLA", "X28 - Balanza AHS - 5TN - AHS - II R MINI CRANE", "X29 - Balanza AHS - 100KG - AHS - I M - AMARILLA", "X60 - Balanza ASH - 2TN - ASH - I - AMARILLA", "X59 - Balanza Systel - Bumer 30 V2 - 31KG", "X55 - Balanza DRE-1 - 100KG - PLATEADA", "X101 - Bascula camiones Datta 100 TN", "X103 - Bascula camiones Datta  80 TN", "X30 - Balanza AHS - 5TN - AHS - II R - Naranja", "X53 - Balanza AHS - 7,5TN - AHS - I R - Amarilla", "X58 - Balanza AHS-I - 7,5TN - Amarilla", "X54 - Balanza AHS - 5TN - AHS - I R - Pañol - Amarilla", "G09 - Dobladora de hierro", "PUL06 - Pulmon de aire", "PUL07 - Pulmon de aire", "FIL01 - Sist. de filtro y carcasa de ingreso de agua a planta", "AU01 - Auto Volkswagen GOL 1.6"
  ],
  "PIL": [
    "R46 - Puente grua Jaso 6,3TN",
    "R47 - Puente grua Jaso 6,3TN",
    "R48 - Puente grua Jaso 6,3TN",
    "R49 - Puente grua Jaso 6,3TN",
    "P10 - Compresor Fema Santochi VOL330 5,5HP 330L",
    "Q04 - Guillotina sinusoidal",
    "Q06 - Guillotina de chapas trapezoidal",
    "S11 - Auto elevador Yale 2,5TN",
    "T03 - Grupo electrogeno Weg GTA",
    "G08 - Dobladora de hierro WAF",
    "G10 - Dobladora de columnas neumatica",
    "X47 - Balanza Nor1 A&L Integral Trade 5TN",
    "X48 - Balanza A&L Integral Trade AHS II Intec 5TN",
    "X49 - Balanza A&L Integral Trade 7,5TN",
    "X50 - Balanza sur2 A&L Integral Trade 5TN",
    "X51 - Balanza de piso Serin EL05B 3TN",
    "X102 - Bascula camiones Gama 80TN"
  ],
  "PY": [
    "TR01 - Trefiladora Eurolls 3P",
    "TR05 - Trefiladora Druids 11P",
    "TEJ10 - Tejedora Servet",
    "TEJ11 - Tejedora Servet",
    "H05 - Schnell Reta 12",
    "SR23 - Maquina procesado alambre pua",
    "SR24 - Maquina procesado alambre pua",
    "SR25 - Maquina procesado alambre pua",
    "SR26 - Procesado alambre pua",
    "CLA01 - Clavos Wafios N41",
    "PU01 - Pulidora Wafios PT1",
    "EM01 - Empaquetadora Xingfei",
    "P13 - Compresor a tornillo EMAX",
    "S13 - Autoelevador Hangcha",
    "SEC03 - Secador EMAX",
    "RT01 - Rectificadora WAFIOS MsE500",
    "DRUIDS02 - Linea galvanizado Druids",
    "R24 - Puente grua 6,3TN",
    "FUS01 - Camion Fuso 8TN",
    "T04 - Grupo electrogeno",
    "PUL08 - Pulmon de aire"
  ],
  "RIV": [
    "R50 - Puente grua 6 TN",
    "R51 - Puente grua 8 TN",
    "P11 - Compresor",
    "Q05 - Guillotina de chapas sinusoidal",
    "S12 - Autoelevador 2.5TN",
    "XB2 - Balanza amarilla 5TN - AHS-l",
    "X56 - Balanza 5TN Hanito"
  ],
  "RAM": [
    "TR02 - Trefiladora 9 pasos Eurolls",
    "TR03 - Trefiladora 9 pasos MFL",
    "TR04 - Trefiladora 3 pasos MFL",
    "REC01 - Horno recocido de alambre Schmitz & Apelt",
    "REC02 - Horno recocido de alambre Schmitz & Apelt",
    "H06 - Enderezadora Schnell Reta 12",
    "MEP01 - Malladora MEP 48 hilos MRP",
    "R25 - Puente grua MSV 5TN",
    "R26 - Puente grua chino 5TN",
    "R27 - Puente grua Jaso 5,2TN",
    "R28 - Puente grua Jaso 3,2TN",
    "R29 - Puente grua Jaso 3,2TN - malladora",
    "R30 - Puente grua Jaso 3,2TN - galvanizado",
    "P04 - Compresor Sullair Energy 5507",
    "SEC01 - Secador de aire Sullair RD400",
    "S05 - Autoelevador Toyota",
    "S06 - Autoelevador Hangcha",
    "S07 - Autoelevador Maximal",
    "DRUIDS01 - Galvanizadora 8 hilos Druids",
    "T02 - Grupo electrogeno Bounous 110KVA",
    "K08 - Soldadora MIG Kempi 3200",
    "X31 - Balanza de gancho AHS-II - 5TN",
    "X32 - Balanza piso desarrollo - 5TN - Datta",
    "X33 - Balanza de gancho AHS-DIN - 5TN",
    "X34 - Balanza de gancho AHS-I - 4,75TN",
    "X35 - Balanza de gancho AHS-I - 4,75TN",
    "X36 - Balanza de gancho AHS-I - 4,75TN",
    "X37 - Balanza de gancho AHS-II - 4,75TN",
    "HD01 - Hidrolavadora",
    "HD02 - Hidrolavadora Avenjex",
    "PUL01 - Pulmon",
    "PUL02 - Pulmon",
    "PUL03 - Pulmon",
    "PUL04 - Pulmon",
    "K17 - Soldadora de trefilado",
    "K18 - Soldadora de alambron en trefilado (pay off)",
    "K19 - Soldadora de galvanizado",
    "V01 - Volteador de carretes"
  ],
  "CBA": {
    "Deposito": [
      "G07 - Dobladora hierro longitudinal 6m",
      "Q01 - Cortadora de chapa acanalada",
      "Q02 - Cortadora de chapa trapezoidal",
      "R07 - Puente Grúa 5TN",
      "R08 - Puente Grúa 5TN",
      "R09 - Puente Grúa 8TN",
      "R10 - Puente Grúa 8TN",
      "R11 - Puente Grúa 8TN",
      "R12 - Puente Grúa 8TN",
      "R13 - Puente Grúa 8TN",
      "R14 - Puente Grúa 8TN",
      "R15 - Puente Grúa 5TN",
      "R16 - Puente Grúa 6TN",
      "R17 - Puente Grúa 5TN",
      "R18 - Puente Grúa 5TN",
      "R19 - Puente Grúa 6.3TN",
      "R23 - Puente Grúa 6.3TN",
      "S02 - Autoelevador Yale",
      "U01 - Separadora de varillas",
      "B02 - Sierra manual",
      "X06 - Balanza AHS-1 5TN",
      "X07 - Balanza AHS-1 7,5TN",
      "X08 - Balanza AHS-1 5TN",
      "X09 - Balanza 7,5TN",
      "X10 - Balanza AHS-1 5TN",
      "X11 - Balanza 7,5TN",
      "X12 - Balanza AHS-1 5TN",
      "X13 - Balanza AHS-1 7,5TN",
      "X14 - Balanza AHS-2 5TN",
      "X15 - Balanza 7,5TN",
      "X16 - Balanza AHS-1 5TN",
      "X17 - Balanza AHS-1 5TN",
      "X18 - Balanza AHS-1 5TN",
      "XN3S - Balanza hibrida carro 3TN",
      "XN3N - Balanza hibrida carro 3TN",
      "X21 - Balanza AHS-1 5TN",
      "X22 - Balanza AHS-1 7,5 TN",
      "SR04 - Plegadora neumática",
      "XN4S - Balanza Piso 3TN"
    ],
    "I+D": [
      "K09 - Soldadora MIG ESAB 250",
      "UR08 - Sierra sin fin"
    ],
    "Mto": [
      "K14 - Soldadora MIG Tigger",
      "XB01 - Balanza amarilla 5TN - AHS-l"
    ],
    "Nave 6": [
      "R02 - Puente Grúa 5TN"
    ],
    "Planta": [
      "P01 - Compresor a tornillo 30HP",
      "P02 - Compresor a pistón 20HP",
      "P03 - Compresor a tornillo 75HP",
      "T01 - Grupo electrógeno Bounous 310 KVA",
      "X100 - Bascula 100 TN"
    ],
    "Producción": [
      "A01 - Balancín",
      "A02 - Balancín",
      "B01 - Sierra automática Cosen",
      "B03 - Sierra 45º",
      "C01 - Guillotina varillas",
      "C02 (inactiva) - Guillotina varillas",
      "C03 - Guillotina varillas",
      "C04 - Guillotina varillas",
      "C05 - Guillotina chapas",
      "E01 - Balancín troquelado acanalado",
      "E02 - Balancín troquelado trapezoidal",
      "F01 - Plegadora chapas",
      "G01 - Dobladoras hierros",
      "G02 - Dobladoras hierros",
      "G03 - Dobladoras hierros",
      "G04 - Dobladoras hierros",
      "G05 - Dobladoras hierros",
      "H01 - Schnell Formula estribadora automática",
      "H02 - Schnell Coil estribadora automática",
      "H03 - Schnell CM PRO 1600 Pilotera",
      "H04 - Schnell ACU 6 Estribadora automática",
      "H07 - Schnell Reta 12 Enderezadora",
      "I01 - Taladro Grande de pie",
      "J01 - Torcionadora de hierros",
      "K01 - Soldadora MIG Kempi 2500",
      "K02 - Soldadora MIG Kempi 3200",
      "K03 - Soldadora MIG Fenisol 300 (grande)",
      "K04 - Soldadora MIG Kempi 2500",
      "K05 - Soldadora MIG Kempi 2500",
      "K06 - Soldadora MIG Fenisol (chica)",
      "K07 - Soldadora MIG Kempi 2500",
      "K10 - Soldadora MIG Tauro 450",
      "K11 - Soldadora MIG Tauro 450",
      "K15 - Soldadora MIG Kami 3500",
      "K16 - Soldadora MIG Kami 4500",
      "PL01 - Planchadora y corte de chapas",
      "R´01 - Punzonadora de planchuelas",
      "R03 - Puente Grúa 5TN",
      "R04 - Puente Grúa 5TN",
      "R05 - Puente Grúa 5TN",
      "R06 - Puente Grúa 5TN",
      "R20 - Puente Grúa 3TN",
      "R21 - Puente Grúa 15TN",
      "R22 - Puente Grúa 15TN",
      "S04 - Autoelevador Toyota 2.5TN",
      "X03 - Balanza 5TN",
      "X04 - Balanza AHS-2 5TN",
      "X05 - Balanza AHS-2 5TN",
      "X24 - Balanza AHS-1 5TN",
      "X25 - Balanza AHS-1 5TN",
      "X57 - Balanza AYLCS 15 TN"
    ],
    "Servet": [
      "S03 - Autoelevador Hangcha Xinchai",
      "XSR1 - Balanza AHS-1 5TN",
      "XSR2 - Balanza fraccionado alambre 50 KG",
      "SR01 - Fraccionadora alambre Angeli",
      "SR02 - Maquina procesado alambre púa",
      "SR03 - Maquina procesado alambre púa",
      "SR05 - Guillotina varilla mecánica",
      "KSR6 - MIG Tauro 250A",
      "SR07 - Fraccionadora alambre Angeli",
      "SR09 - Fraccionadora alambre trompita",
      "SR10 - Fraccionadora alambre 2 cabezal",
      "SR11 - Fraccionadora alambre trompa G.",
      "SR12 - Fraccionadora alambre trompita",
      "SR13 - Fraccionadora alambre trompa G.(nueva)",
      "SR14 - Sunchadora de banco fleje PET",
      "SR16 - Conformadora de concertina",
      "SR17 - Conformadora de concertina",
      "SR18 - Balancín troquelado para concertina",
      "SR19 - Sunchadora de banco fleje PET",
      "SR21 - Maquina procesado alambre púa",
      "SR22 - Maquina procesado alambre púa",
      "SR28 - Fraccionadora de alambre trompa de elefante",
      "SR29 - Prensa de rollo de alambre vertical para 300KG",
      "SR30 - Prensa de rollo de alambre horizontal para 300KG"
    ],
    "SGV": [
      "SG02 - MIG electrodos Cba 350A",
      "SG04 - Compresor Schull 7,5 HP"
    ],
    "Urbantek": [
      "R01 - Puente Grúa 5TN",
      "UR01 - Sierra circular doble cabezal AL",
      "UR02 - Fresadora soldadura PVC",
      "UR03 - Soldadora termofusión doble cabezal",
      "UR04 - Desaguadora",
      "UR05 - Fresadora 3 cabezal (copiadora)",
      "UR07 - Sierra circular doble cabezal PVC",
      "UR09 - Vinculadora neumática Ozgenc",
      "UR10 - Sierra de mesa",
      "UR11 - Junquilladora Elumatec",
      "UR12 - Pulmón neumático",
      "UR13 - Soldadora PVC doble cabezal Ozgenc",
      "UR14 - Centro mecanizado y corte perfilería Ozgenc",
      "UR15 - Soldadora PVC 4 cabezales Ozgenc",
      "UR16 - Limpiadora Ozgenc",
      "UR17 - Junquilladora Ozgenc",
      "UR18 - Ingletadora de 10\"",
      "UR19 - Ventosa eléctrica de 4 sopapas",
      "UR20 - Sierra sin fin",
      "UR21 - Sierra doble cabezal",
      "XUR01 - Balanza de gancho 5TN"
    ],
    "S/U": [
      "S17 - Autoelevador Goodsense 2.5TN",
      "S15 - Autoelevador Lonking"
    ]
  }
};

function getMachineOptionsHTML(plant, sector = null) {
  let machines = [];
  if (plant === 'CBA') {
    if (sector && machineDict['CBA'][sector]) {
      machines = machineDict['CBA'][sector];
    } else {
      return `<option value="">Seleccione primero un sector...</option>`;
    }
  } else {
    machines = machineDict[plant] || [];
  }

  let html = `<option value="">Seleccione el código de la máquina...</option>`;
  machines.forEach(m => {
    // Tomamos la primera parte antes del guion como value (código)
    let val = m.includes('-') ? m.split('-')[0].trim() : m;
    html += `<option value="${val}">${m}</option>`;
  });
  return html;
}

function getSectorOptionsHTML() {
  const sectors = Object.keys(machineDict['CBA'] || {}).sort();
  let html = `<option value="">Seleccione el sector...</option>`;
  sectors.forEach(s => {
    html += `<option value="${s}">${s}</option>`;
  });
  return html;
}
const optionsNaturaleza = `<option value="">Seleccione...</option><option value="Inspección">Inspección</option><option value="Preventivo programado">Preventivo programado</option><option value="Preventivo condicional">Preventivo condicional</option><option value="Preventivo semanal">Preventivo semanal</option><option value="Preventivo mensual">Preventivo mensual</option><option value="Preventivo trimestral">Preventivo trimestral</option><option value="Preventivo semestral">Preventivo semestral</option><option value="Preventivo anual">Preventivo anual</option><option value="Mejoras">Mejoras</option><option value="Falla">Falla</option><option value="Montaje">Montaje</option>`;
const optionsEdilicio = `<option value="">Seleccione categoría...</option><option value="Orden y limpieza">Orden y limpieza</option><option value="Reunión, capacitación o asamblea">Reunión, capacitación o asamblea</option><option value="Planta general">Planta general</option><option value="Taller o pañol">Taller o pañol</option><option value="Asistencia a logística">Asistencia a logística</option><option value="Asistencia a producción">Asistencia a producción</option>`;
const optionsAusentismo = `<option value="">Seleccione motivo...</option><option value="Carpeta médica">Carpeta médica</option><option value="Vacaciones">Vacaciones</option><option value="Salidas personales o retiros">Salidas personales o retiros</option><option value="Feriados">Feriados</option>`;
const optionsTipoRegistro = `<option value="MAQUINA">Mantenimiento de máquina (OT)</option><option value="EDILICIO">Mantenimiento edilicio / varios</option><option value="AUSENTISMO">Ausentismo / no productivo</option>`;

const operatorDict = {
  "SL2": ['Baigorria', 'Saldaña', 'Gonzalez Aguero', 'Gutierrez', 'Aberastain'],
  "SL1": ['Azcurra', 'Beltran', 'Prado', 'Reyes'],
  "RAM": ['Abella', 'Ferrara', 'Rivero', 'Marun'],
  "CBA": ['Contrera', 'Miranda', 'Aguirre', 'Guardia'],
  "PIL": ['Kern'], "PY": ['Burgos', 'Cantero', 'Rolon'], "RIV": []
};

const supervisorDict = {
  'pvega': { pass: 'Serin', plant: 'RAM' },
  'dbustos': { pass: 'Serin', plant: 'RAM' },
  'snavarro': { pass: 'Serin', plant: 'SL1' },
  'garce': { pass: 'Serin', plant: 'CBA' },
  'jchamorro': { pass: 'Serin', plant: 'PY' },
  'dkern': { pass: 'Serin', plant: 'PIL' },
  'jblanco': { pass: 'Serin', plant: 'RIV' },
  'asarchioni': { pass: 'Serin', plant: 'SL2' } // Se asume SL2 por defecto para el usuario original
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

// Global App State (Cloud Hybrid Architecture)
let localQueueTasks = JSON.parse(localStorage.getItem('mantenimiento_unsynced_tasks')) || [];
let localQueueMaquinas = JSON.parse(localStorage.getItem('mantenimiento_unsynced_maquinas')) || [];
let localQueueResolvedMaquinas = JSON.parse(localStorage.getItem('mantenimiento_unsynced_resolved_maquinas')) || [];

let cloudPending = JSON.parse(localStorage.getItem('mantenimiento_cloud_pending')) || [];
let cloudMaquinas = JSON.parse(localStorage.getItem('mantenimiento_cloud_maquinas')) || [];
let cloudApproved = JSON.parse(localStorage.getItem('mantenimiento_cloud_approved')) || [];

let currentPlant = null;
let supervisorLoggedIn = false;
let currentInspectingTask = null;

function saveLocalQueues() {
  localStorage.setItem('mantenimiento_unsynced_tasks', JSON.stringify(localQueueTasks));
  localStorage.setItem('mantenimiento_unsynced_maquinas', JSON.stringify(localQueueMaquinas));
  localStorage.setItem('mantenimiento_unsynced_resolved_maquinas', JSON.stringify(localQueueResolvedMaquinas));
}

function saveCloudCache() {
  localStorage.setItem('mantenimiento_cloud_pending', JSON.stringify(cloudPending));
  localStorage.setItem('mantenimiento_cloud_maquinas', JSON.stringify(cloudMaquinas));
  localStorage.setItem('mantenimiento_cloud_approved', JSON.stringify(cloudApproved));
}

function getActiveTasks() {
  return [...cloudPending, ...localQueueTasks];
}

function getActiveMaquinasCaidas() {
  return [...cloudMaquinas, ...localQueueMaquinas].filter(m => !localQueueResolvedMaquinas.includes(m.id));
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
  opSelect.innerHTML = `<option value="">Seleccione operario...</option>` + plantOps.map(op => `<option value="${op}">${op}</option>`).join('');

  // Al confirmar planta, mostrar pantalla de rol
  viewPlant.classList.add('hidden');
  // Actualizar el label de planta seleccionada en la pantalla de rol
  const rolePlantLabel = document.getElementById('role-plant-label');
  if(rolePlantLabel) rolePlantLabel.textContent = `Planta: ${currentPlant}`;
  viewRole.classList.remove('hidden');

  // Restart rows if they changed plants to recalibrate the Select size
  initRows();
  renderOperatorSidebar();
  renderMaquinasCaidasSidebar();
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
  const u = inputLoginUser.value.trim().toLowerCase(); // Hacemos tolerante a mayúsculas
  const p = inputLoginPass.value;
  
  const supInfo = supervisorDict[u];
  
  if (supInfo && supInfo.pass === p) {
    if (supInfo.plant !== currentPlant && supInfo.plant !== 'ALL') {
       document.getElementById('login_error').textContent = `El usuario ${u} no tiene permisos para visualizar la planta ${currentPlant}.`;
       document.getElementById('login_error').style.display = 'block';
       return;
    }
    
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
    document.getElementById('login_error').textContent = 'Credenciales incorrectas.';
    document.getElementById('login_error').style.display = 'block';
  }
});

document.getElementById('btn-login-go-home').addEventListener('click', () => {
    viewLogin.classList.add('hidden');
    viewPlant.classList.remove('hidden');
    currentPlant = null;
    sessionStorage.removeItem('mantenimiento_current_plant');
    document.getElementById('login_error').style.display = 'none';
    inputLoginPass.value = '';
    inputLoginUser.value = '';
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
   renderMaquinasCaidasSidebar();
});


// Dynamic Tasks Logic
const tareasContainer = document.getElementById('tareas-container');
const btnAddTask = document.getElementById('btn-add-task');
let rowCount = 0;

document.getElementById('fecha').valueAsDate = new Date();

function addTaskRow(isRequired = false, initialData = null) {
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

  // Lógica de autocompletado en cadena:
  let defH = "HH", defM = "MM";
  if (!initialData) {
      const rows = tareasContainer.querySelectorAll('.task-row');
      if (rows.length > 0) {
          const lastRow = rows[rows.length - 1];
          const lastH = lastRow.querySelector('.time-hasta-h').value;
          const lastM = lastRow.querySelector('.time-hasta-m').value;
          if (lastH && lastM && lastH !== 'HH' && lastM !== 'MM') {
              defH = lastH; defM = lastM;
          }
      }
  }

  div.innerHTML = `
    <h4 style="margin-bottom: 1rem; color:var(--text-main); font-size:1rem; display:flex; justify-content:space-between; border-bottom:1px solid var(--border); padding-bottom:0.5rem;">
      <span>Renglón ${rowCount}</span>
      ${!isRequired ? `<button type="button" class="btn-remove-task" style="color:var(--danger); background:none; border:none; cursor:pointer; font-weight:600;">&times; Quitar</button>` : ''}
    </h4>

    <!-- Selector de tipo de registro -->
    <div class="form-group" style="margin-bottom:1rem; border-bottom: 1px dashed var(--border); padding-bottom: 1rem;">
      <label style="font-weight:600;">Tipo de registro</label>
      <select class="tipo-registro" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${optionsTipoRegistro}</select>
    </div>
    
    <div class="form-group" style="margin-bottom:1rem;">
      <label style="font-weight:600; display:flex; justify-content:space-between; align-items:flex-end;">
        Descripción de la tarea realizada
        <button type="button" class="btn-voice" style="background:#e5e7eb; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer; margin-bottom: 0.25rem;">🎤 Audiodictado</button>
      </label>
      <textarea class="desc-task" rows="2" placeholder="Describa el trabajo o presione el micrófono..." ${isRequired ? 'required' : ''}>${initialData ? initialData.description : ''}</textarea>
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

    <!-- Módulo de compañeros de tarea local al renglón -->
    <div class="form-group" style="background:#f3f4f6; padding:1rem; border-radius:4px; margin-bottom:1rem; border:1px solid #d1d5db;">
        <label style="font-weight:600; margin-bottom:0.5rem; display:block;">Cantidad total de operarios en esta tarea</label>
        <select class="ot-operarios" style="max-width:300px; margin-bottom:0.5rem;">${opsHtml}</select>
        <div class="ot-companeros-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;"></div>
    </div>

    <!-- Sección mantenimiento de máquina (default) -->
    <div class="section-maquina">
      <div class="form-group" style="background:#eef6fc; padding:1.25rem; border-radius:6px; margin-bottom:1rem; border:1px solid #bcdcf9;">
        <label style="color:var(--primary); font-weight:700; display:block; margin-bottom:0.5rem; font-size:1.05rem;">Máquina intervenida</label>
        
        ${currentPlant === 'CBA' ? `
          <select class="ot-sector-trigger" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px; margin-bottom:0.75rem;">
            ${getSectorOptionsHTML()}
          </select>
        ` : ''}

        <select class="ot-maquina-trigger" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${getMachineOptionsHTML(currentPlant)}</select>
      </div>
    </div>

    <!-- Sección edilicio / varios -->
    <div class="section-edilicio hidden">
      <div class="form-group" style="background:#f0fdf4; padding:1.25rem; border-radius:6px; margin-bottom:1rem; border:1px solid #bbf7d0;">
        <label style="color:#15803d; font-weight:700; display:block; margin-bottom:0.5rem; font-size:1.05rem;">Categoría edilicio / varios</label>
        <select class="cat-edilicio" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${optionsEdilicio}</select>
      </div>
    </div>

    <!-- Sección ausentismo -->
    <div class="section-ausentismo hidden">
      <div class="form-group" style="background:#fff1f2; padding:1.25rem; border-radius:6px; margin-bottom:1rem; border:1px solid #fecdd3;">
        <label style="color:#be123c; font-weight:700; display:block; margin-bottom:0.5rem; font-size:1.05rem;">Motivo ausentismo / no productivo</label>
        <select class="motivo-ausentismo" style="width:100%; padding:0.6rem; border-color:var(--border); font-size:1rem; border-radius:4px;">${optionsAusentismo}</select>
      </div>
    </div>

    <!-- Módulo OT interno de la fila (se muestra solo si se selecciona máquina) -->
    <div class="modulo-ot hidden" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px dashed #bcdcf9;">
      <h5 style="margin-bottom:1rem; color:var(--primary); font-size:1rem; display:flex; justify-content:space-between;">
        <span>Detalles complementarios para la OT</span>
        <span style="font-size:0.8rem; background:#eef6fc; padding:0.2rem 0.4rem; border-radius:4px; color:var(--primary-hover);">RPMT0002</span>
      </h5>

      <div class="form-group">
        <label>Naturaleza del mantenimiento</label>
        <select class="ot-naturaleza">${optionsNaturaleza}</select>
      </div>

      <div class="form-group">
        <label style="font-weight:600; display:flex; justify-content:space-between; align-items:flex-end;">
          Desviación detectada
          <button type="button" class="btn-voice-dev" style="background:#e5e7eb; border:none; border-radius:4px; padding:0.25rem 0.5rem; cursor:pointer; margin-bottom: 0.25rem;">🎤 Audiodictado</button>
        </label>
        <textarea class="ot-desviacion" placeholder="Detalle el problema detectado o pulse el micrófono..."></textarea>
      </div>

      <div class="form-group">
        <label style="font-weight:600; display:flex; justify-content:space-between; align-items:flex-end;">
          Observaciones / tareas recomendadas
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
        <div style="margin-bottom: 1rem;"><strong>Registro de parada:</strong></div>
        <div class="grid-2">
          <div class="form-group">
            <label style="font-size:0.8rem">Inicio fuera de servicio</label>
            <div style="display:flex; flex-direction:column; gap:0.5rem">
              <input type="date" class="parada-i-fecha" style="width:100%;">
              <div style="display:flex; align-items:center; gap:2px; width:100%;">
                 <select class="parada-i-h" style="flex:1; padding:0.5rem;">${optH}</select> <b>:</b> <select class="parada-i-m" style="flex:1; padding:0.5rem;">${optM}</select>
              </div>
            </div>
          </div>
          <div class="form-group fin-parada-group">
            <label style="font-size:0.8rem">Fin fuera de servicio</label>
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
        <label style="font-weight:600;">Estado final de la máquina</label>
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

  const triggerSector = div.querySelector('.ot-sector-trigger');
  if (triggerSector) {
    triggerSector.addEventListener('change', (e) => {
      triggerMaquina.innerHTML = getMachineOptionsHTML(currentPlant, e.target.value);
      triggerMaquina.dispatchEvent(new Event('change'));
    });
  }

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

      // Detección de Máquina Caída
      const mData = maquinasCaidas.find(m => m.machine === e.target.value && m.plant === currentPlant);
      if (mData) {
         const d = new Date(mData.startOutISO);
         const dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
         alert(`AVISO: La máquina ${mData.machine} se encuentra actualmente FUERA DE SERVICIO desde el ${dateStr}.\n\nSe arrastrará la fecha de inicio de parada automáticamente.`);
         
         chkDisp.checked = true;
         chkDisp.dispatchEvent(new Event('change'));
         
         pIF.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
         pIH.value = String(d.getHours()).padStart(2,'0');
         const mins = d.getMinutes();
         const roundedMins = Math.round(mins / 10) * 10;
         pIM.value = String(roundedMins === 60 ? 50 : roundedMins).padStart(2,'0');
         
         pIF.readOnly = true;
         pIH.style.pointerEvents = 'none';
         pIH.style.background = '#f3f4f6';
         pIM.style.pointerEvents = 'none';
         pIM.style.background = '#f3f4f6';
         
         // Desmarcar radios de estado para forzar la elección al operario
         div.querySelectorAll(`input[name="estado_${rowId}"]`).forEach(r => r.checked = false);
         updateParadaValidation();
      } else {
         // Desbloquear si no está caída (por si cambió de selección)
         pIF.readOnly = false;
         pIH.style.pointerEvents = 'auto';
         pIH.style.background = '';
         pIM.style.pointerEvents = 'auto';
         pIM.style.background = '';
      }
    } else {
      modOt.classList.add('hidden');
      div.querySelector('.ot-naturaleza').required = false;
      pIF.readOnly = false;
      pIH.style.pointerEvents = 'auto';
      pIH.style.background = '';
      pIM.style.pointerEvents = 'auto';
      pIM.style.background = '';
    }
    triggerRecalc();
  });

  descTask.addEventListener('input', () => {
    // previously copied to otTareas, now removed
  });

  const finGroup = div.querySelector('.fin-parada-group');
  const updateParadaValidation = () => {
    if (!chkDisp.checked) {
      modParada.classList.add('hidden');
      [pIF, pIH, pIM, pFF, pFH, pFM].forEach(x => x.required = false);
    } else {
      modParada.classList.remove('hidden');
      [pIF, pIH, pIM].forEach(x => x.required = true);
      const isFuncional = div.querySelector(`input[name="estado_${rowId}"]:checked`)?.value === 'Funcional';
      
      if (isFuncional) {
        finGroup.style.display = 'block';
        [pFF, pFH, pFM].forEach(x => x.required = true);
      } else {
        finGroup.style.display = 'none';
        [pFF, pFH, pFM].forEach(x => x.required = false);
        pFF.value = ''; pFH.value = ''; pFM.value = '';
      }
        calcParada();
    }
  };

  chkDisp.addEventListener('change', updateParadaValidation);
  if (initialData) {
      div.querySelector('.time-desde-h').value = initialData.from.split(':')[0];
      div.querySelector('.time-desde-m').value = initialData.from.split(':')[1];
      div.querySelector('.time-hasta-h').value = taskDataToVal(initialData.to, 'h');
      div.querySelector('.time-hasta-m').value = taskDataToVal(initialData.to, 'm');
      div.querySelector('.tipo-registro').value = initialData.type;
      div.querySelector('.tipo-registro').dispatchEvent(new Event('change'));
      
      if (initialData.type === 'EDILICIO') {
          div.querySelector('.cat-edilicio').value = initialData.category;
      } else if (initialData.type === 'AUSENTISMO') {
          div.querySelector('.motivo-ausentismo').value = initialData.category;
      }
      
      div.querySelector('.ot-operarios').value = initialData.opsCount || 1;
      div.querySelector('.ot-operarios').dispatchEvent(new Event('change'));
      
      if (initialData.companions) {
          const comps = initialData.companions.split(',').map(c => c.trim());
          const selects = div.querySelectorAll('.ot-companero-select');
          selects.forEach((sel, idx) => {
              if (comps[idx]) sel.value = comps[idx];
          });
      }

      if (initialData.hasOT) {
          const maqSelect = div.querySelector('.ot-maquina-trigger');
          if (currentPlant === 'CBA') {
              for (const sector in machineDict['CBA']) {
                  if (machineDict['CBA'][sector].some(m => m.startsWith(initialData.machine))) {
                      div.querySelector('.ot-sector-trigger').value = sector;
                      div.querySelector('.ot-sector-trigger').dispatchEvent(new Event('change'));
                      break;
                  }
              }
          }
          maqSelect.value = initialData.machine;
          maqSelect.dispatchEvent(new Event('change'));
          div.querySelector('.ot-naturaleza').value = initialData.nature;
          
          div.querySelectorAll(`input[name="estado_${rowId}"]`).forEach(r => {
              if (r.value === initialData.finalState) r.checked = true;
          });

          chkDisp.checked = initialData.affectsDisp === true || initialData.affectsDisp === "SI" || initialData.affectsDisp === "TRUE";
          chkDisp.dispatchEvent(new Event('change'));
          
          if (chkDisp.checked) {
              const dParts = initialData.startOut.split(' ');
              div.querySelector('.parada-i-fecha').value = dParts[0];
              div.querySelector('.parada-i-h').value = dParts[1].split(':')[0];
              div.querySelector('.parada-i-m').value = dParts[1].split(':')[1];
              
              if (initialData.endOut) {
                  const fParts = initialData.endOut.split(' ');
                  div.querySelector('.parada-f-fecha').value = fParts[0];
                  div.querySelector('.parada-f-h').value = fParts[1].split(':')[0];
                  div.querySelector('.parada-f-m').value = fParts[1].split(':')[1];
              }
          }
          div.querySelector('.ot-desviacion').value = initialData.deviation || '';
          div.querySelector('.ot-observaciones').value = initialData.recommendations || '';
      }
  } else {
      div.querySelector('.time-desde-h').value = defH;
      div.querySelector('.time-desde-m').value = defM;
  }

  div.querySelectorAll('select, input, textarea').forEach(el => {
    el.addEventListener('change', updateTiempoTotal);
  });

  const calcParada = () => {
    const pTiempo = div.querySelector('.parada-tiempo');
    if (!chkDisp.checked) {
        pTiempo.textContent = `Tiempo de Parada: 0h 0m`;
        return;
    }
    const isFuncional = div.querySelector(`input[name="estado_${rowId}"]:checked`)?.value === 'Funcional';
    
    if (isFuncional) {
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
    } else {
        pTiempo.textContent = `Tiempo de Parada: Pendiente (Máquina No Funcional)`;
    }
  };
  [pIF, pIH, pIM, pFF, pFH, pFM].forEach(el => el.addEventListener('change', calcParada));

  if (!isRequired) div.querySelector('.btn-remove-task').addEventListener('click', () => { div.remove(); triggerRecalc(); });

  tareasContainer.appendChild(div);
  return div;
}

function taskDataToVal(timeStr, type) {
    if (!timeStr || !timeStr.includes(':')) return type === 'h' ? 'HH' : 'MM';
    return type === 'h' ? timeStr.split(':')[0] : timeStr.split(':')[1];
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
  renderMaquinasCaidasSidebar();
});

function updateTiempoTotal() {
  let totalH = 0, hasError = false, validIntervals = [];
  const curDate = document.getElementById('fecha').value;
  const curOp = document.getElementById('operario').value;
  const outputTiempoTotal = document.getElementById('tiempo_total');
  const pastTasks = [...getActiveTasks(), ...cloudApproved].filter(t => {
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
    taskData.manHours = (dh * parseInt(taskData.opsCount)).toFixed(2); // Calculado para todos los tipos

    // Validación de categorías para Edilicio y Ausentismo
    if (tipo === 'EDILICIO' && !catEdilicio) { alert("Por favor selecciona una categoría para el registro Edilicio."); processFailed = true; return; }
    if (tipo === 'AUSENTISMO' && !motAusentismo) { alert("Por favor selecciona un motivo para el Ausentismo."); processFailed = true; return; }

    if (isOt) {
      taskData.machine = triggerMachineCode;
      taskData.nature = row.querySelector('.ot-naturaleza').value;
      taskData.deviation = row.querySelector('.ot-desviacion').value;
      taskData.recommendations = row.querySelector('.ot-observaciones').value;
      // taskData.manHours ya está calculado arriba
      const isDisp = row.querySelector('.chk-disp').checked;
      taskData.affectsDisp = isDisp ? "SI" : "NO";
      taskData.finalState = Array.from(row.querySelectorAll('input[type="radio"]')).find(r => r.checked)?.value || '';

      if (isDisp) {
        const pIH = row.querySelector('.parada-i-h').value; const pIM = row.querySelector('.parada-i-m').value;
        const pIF = row.querySelector('.parada-i-fecha').value;
        let di = new Date(`${pIF}T${pIH}:${pIM}`);
        taskData.startOut = `${pIF} ${pIH}:${pIM}`;
        
        if (taskData.finalState === 'Funcional') {
          const oldIndex = getActiveMaquinasCaidas().findIndex(m => m.machine === triggerMachineCode && m.plant === currentPlant);
          if (oldIndex > -1) {
             let oldData = getActiveMaquinasCaidas()[oldIndex];
             di = new Date(oldData.startOutISO);
             taskData.startOut = oldData.startOut;
             localQueueResolvedMaquinas.push(oldData.id);
             saveLocalQueues();
          }
          const pFH = row.querySelector('.parada-f-h').value; const pFM = row.querySelector('.parada-f-m').value;
          const pFF = row.querySelector('.parada-f-fecha').value;
          let df = new Date(`${pFF}T${pFH}:${pFM}`);
          if (df < di) { alert(`Error en fechas de parada de la máquina ${triggerMachineCode}. El fin es anterior al inicio.`); processFailed = true; return; }
          taskData.endOut = `${pFF} ${pFH}:${pFM}`;
          taskData.stopTime = getStopTimeAdjusted(di, df, currentPlant).toFixed(2);
        } else {
          const oldIndex = getActiveMaquinasCaidas().findIndex(m => m.machine === triggerMachineCode && m.plant === currentPlant);
          if (oldIndex === -1) {
             localQueueMaquinas.push({
               id: 'MQ_' + new Date().getTime() + '_' + Math.floor(Math.random()*1000),
               machine: triggerMachineCode,
               plant: currentPlant,
               startOutISO: di.toISOString(),
               startOut: taskData.startOut,
               reportedBy: document.getElementById('operario').value
             });
             saveLocalQueues();
          }
          taskData.endOut = "";
          taskData.stopTime = "Pendiente";
        }
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
        deviation: r.deviation, recommendations: r.recommendations, manHours: r.manHours, affectsDisp: r.affectsDisp || "NO",
        finalState: r.finalState, startOut: r.startOut, endOut: r.endOut, stopTime: r.stopTime
      });
    }
    return out;
  });

  // LOCAL MEMORY PUSH
  localQueueTasks.push(...finalTasks);
  saveLocalQueues();

  // NUBE MEMORY PUSH (Sync en segundo plano de inmediato)
  syncDataBackground();

  alert("¡Jornada guardada con éxito! Las tareas se sincronizarán en segundo plano automáticamente.");
  document.getElementById('form-operator').reset();
  initRows(); document.getElementById('fecha').valueAsDate = new Date();
  updateTiempoTotal();
  renderOperatorSidebar();
  renderMaquinasCaidasSidebar();
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
    
    const myTasks = getActiveTasks().filter(t => {
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
           const isRejected = t.evalStatus === 'RECHAZADA';
           let theHtml = `
             <div style="background:${isRejected ? '#fff1f2' : '#f9fafb'}; border:1px solid ${isRejected ? '#fecdd3' : '#e5e7eb'}; border-left:4px solid ${isRejected ? '#be123c' : (t.hasOT ? '#0284c7' : (t.type === 'AUSENTISMO' ? '#be123c' : '#10b981'))}; border-radius:4px; padding:0.75rem; position:relative;">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
                   <strong style="color:var(--text-main); font-size:0.95rem;">${t.from} a ${t.to} (${t.totalTime}h)</strong>
                   <div style="display:flex; gap:0.5rem;">
                      <button onclick="editOperatorTask('${t.id}')" title="Editar" style="background:none; border:none; cursor:pointer; color:var(--primary); font-size:1.1rem; line-height:1;">✎</button>
                      <button onclick="deleteOperatorTask('${t.id}')" title="Eliminar" style="background:none; border:none; cursor:pointer; color:var(--danger); font-size:1.1rem; line-height:1;">🗑</button>
                   </div>
                </div>
                <div style="margin-bottom:0.25rem; font-size:0.9rem; color:var(--text-main);">${t.description}</div>
           `;
           if(isRejected) {
              theHtml += `<div style="font-size:0.8rem; color:#be123c; margin-top:0.5rem; background:#fee2e2; padding:0.4rem; border-radius:4px; border:1px solid #fecdd3;"><strong>MOTIVO RECHAZO:</strong> ${t.evalObs || 'Sin observaciones'}</div>`;
           }
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

function deleteOperatorTask(id) {
    if(!confirm("¿Seguro que deseas eliminar esta tarea permanentemente?")) return;
    
    // Si está en la cola local, borrarla de ahí
    if(localQueueTasks.find(t => t.id === id)) {
        localQueueTasks = localQueueTasks.filter(t => t.id !== id);
        saveLocalQueues();
        renderOperatorSidebar();
        updateTiempoTotal();
        return;
    }

    // Si está en la nube, mandar orden de borrado
    fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete_pending', id: id })
    }).then(res => res.json())
    .then(() => {
        syncDataBackground();
    }).catch(err => {
        alert("Error de red al eliminar. Intente nuevamente.");
    });
}

function editOperatorTask(id) {
    const allTasks = getActiveTasks();
    const task = allTasks.find(t => t.id === id);
    if(!task) return;

    if(!confirm("La tarea volverá al formulario para que la edites. Al guardar se generará un nuevo registro y el anterior se borrará de la lista. ¿Continuar?")) return;

    // Poblar el formulario
    document.getElementById('fecha').value = task.date;
    document.getElementById('turno').value = task.shift;
    
    tareasContainer.innerHTML = '';
    rowCount = 0;
    
    addTaskRow(true, task);
    
    // Eliminar la tarea original (local o nube) para que no quede duplicada al guardar la nueva
    if(localQueueTasks.find(t => t.id === id)) {
        localQueueTasks = localQueueTasks.filter(t => t.id !== id);
        saveLocalQueues();
        renderOperatorSidebar();
        updateTiempoTotal();
    } else {
        fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'delete_pending', id: id })
        }).then(() => {
            syncDataBackground();
        });
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- SUPERVISOR GOOGLE CALENDAR LOGIC ---

document.getElementById('visor-fecha').valueAsDate = new Date();
document.getElementById('visor-fecha').addEventListener('change', () => { if (supervisorLoggedIn) renderCalendar(); });

let PIXEL_PER_MINUTE = 1.5;

document.getElementById('btn-zoom-in').addEventListener('click', () => {
  if (PIXEL_PER_MINUTE < 3.0) {
    PIXEL_PER_MINUTE += 0.25;
    if (supervisorLoggedIn) renderCalendar();
  }
});

document.getElementById('btn-zoom-out').addEventListener('click', () => {
  if (PIXEL_PER_MINUTE > 0.5) {
    PIXEL_PER_MINUTE -= 0.25;
    if (supervisorLoggedIn) renderCalendar();
  }
});

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
    const opTasks = getActiveTasks().filter(t => {
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
       <h4 style="color:var(--primary); margin-bottom:0.5rem; text-decoration:underline;">Orden de trabajo</h4>
       <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div><strong>Máquina:</strong> ${t.machine}</div><div><strong>Naturaleza:</strong> ${t.nature}</div>
          <div><strong>Horas hombre calc:</strong> ${t.manHours} HH</div><div><strong>Estado final:</strong> ${t.finalState}</div>
       </div><div style="margin-top:0.5rem;"><strong>Desviación:</strong> ${t.deviation || '-'}</div>
       <div style="margin-top:0.5rem;"><strong>Tareas explícitas:</strong> ${t.tasksDone || '-'}</div>
       <div style="margin-top:0.5rem;"><strong>Observaciones / tareas recomendadas:</strong> ${t.recommendations || '-'}</div>
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
// --------------------------------------------------------
const apiHybridPush = (btnId) => {
   if(!currentInspectingTask) return;
   const btn = document.getElementById(btnId);
   const prevText = btn.textContent;
   btn.textContent = 'Guardando...'; btn.disabled = true;
   
   const taskToPush = { ...currentInspectingTask };
   
   fetch(GAS_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'text/plain;charset=utf-8' },
       body: JSON.stringify({ action: 'approve_pending', id: taskToPush.id, obs: obsField.value.trim() })
   })
   .then(res => res.json())
   .then(() => {
       modalSup.classList.add('hidden');
       syncDataBackground();
   }).catch(e => {
       alert("Error de red al aprobar. Intente nuevamente.");
   }).finally(() => {
       btn.textContent = prevText; btn.disabled = false;
   });
};

document.getElementById('btn-modal-approve').addEventListener('click', () => apiHybridPush('btn-modal-approve'));

document.getElementById('btn-modal-reject').addEventListener('click', (e) => {
   if(!currentInspectingTask) return;
   const obs = document.getElementById('modal-obs').value.trim();
   if(!obs) {
       alert("Para devolver una tarea al operario para corregir, DEBES escribir el motivo en el cuadro de observaciones.");
       document.getElementById('modal-obs').focus();
       return;
   }
   
   if(!confirm("¿Seguro que deseas DEVOLVER esta tarea al operario para su corrección?")) return;
   
   const targetBtn = e.target;
   const prevText = targetBtn.textContent;
   targetBtn.textContent = 'Devolviendo...'; targetBtn.disabled = true;

   fetch(GAS_URL, {
       method: 'POST',
       headers: { 'Content-Type': 'text/plain;charset=utf-8' },
       body: JSON.stringify({ action: 'reject_pending', id: currentInspectingTask.id, obs: obs })
   })
   .then(res => res.json())
   .then(() => {
       modalSup.classList.add('hidden');
       syncDataBackground();
   }).catch(e => {
       alert("Error de red al rechazar. Intente nuevamente.");
   }).finally(() => {
       targetBtn.textContent = prevText; targetBtn.disabled = false;
   });
});

// --- MAQUINAS CAIDAS SIDEBAR RENDERER ---
function renderMaquinasCaidasSidebar() {
  const listDiv = document.getElementById('out-of-service-list');
  if(!listDiv) return;
  if (!currentPlant) {
    listDiv.innerHTML = '<div style="text-align:center; color:#dc2626; font-size:0.9rem; padding:1.5rem 0;">Aguardando selección de planta...</div>';
    return;
  }
  
  const caidas = maquinasCaidas.filter(m => m.plant === currentPlant);
  if (caidas.length === 0) {
    listDiv.innerHTML = '<div style="text-align:center; color:#dc2626; font-size:0.9rem; padding:1.5rem 0;">No hay máquinas caídas registradas.</div>';
    return;
  }
  
  listDiv.innerHTML = '';
  caidas.forEach((m, idx) => {
    const d = new Date(m.startOutISO);
    const dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    
    let html = `
      <div style="background:#fff; border:1px solid #fecaca; border-left:4px solid #dc2626; border-radius:4px; padding:0.75rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.25rem;">
           <strong style="color:#dc2626; font-size:1rem;">Máquina ${m.machine}</strong>
        </div>
        <div style="font-size:0.85rem; color:var(--text-main); margin-bottom:0.25rem;"><strong>Caída desde:</strong> ${dateStr}</div>
        <div style="font-size:0.85rem; color:var(--text-main); margin-bottom:0.5rem;"><strong>Reportó:</strong> ${m.reportedBy}</div>
        <button type="button" class="btn btn-poner-funcional" data-idx="${idx}" style="background:#10b981; color:#fff; border:none; padding:0.4rem; font-size:0.85rem; width:100%; cursor:pointer; border-radius:4px;">+ Poner Funcional (Generar OT)</button>
      </div>
    `;
    listDiv.innerHTML += html;
  });

  listDiv.querySelectorAll('.btn-poner-funcional').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-idx');
      const mData = caidas[idx];
      ponerMaquinaFuncional(mData);
    });
  });
}

function ponerMaquinaFuncional(mData) {
  addTaskRow(false);
  const rows = document.querySelectorAll('.task-row');
  const lastRow = rows[rows.length - 1];
  const rowIdNumber = lastRow.id.split('_')[1];
  
  const tipoSelect = lastRow.querySelector('.tipo-registro');
  tipoSelect.value = 'MAQUINA';
  tipoSelect.dispatchEvent(new Event('change'));
  
  if (currentPlant === 'CBA') {
    let foundSector = null;
    for (const [sector, machs] of Object.entries(machineDict['CBA'])) {
      if (machs.some(m => (m.includes('-') ? m.split('-')[0].trim() : m) === mData.machine)) {
        foundSector = sector;
        break;
      }
    }
    const sectorSelect = lastRow.querySelector('.ot-sector-trigger');
    if (sectorSelect && foundSector) {
      sectorSelect.value = foundSector;
      sectorSelect.dispatchEvent(new Event('change'));
    }
  }

  const maqSelect = lastRow.querySelector('.ot-maquina-trigger');
  maqSelect.value = mData.machine;
  maqSelect.dispatchEvent(new Event('change'));
  
  const chkDisp = lastRow.querySelector('.chk-disp');
  chkDisp.checked = true;
  chkDisp.dispatchEvent(new Event('change'));
  
  const d = new Date(mData.startOutISO);
  lastRow.querySelector('.parada-i-fecha').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  lastRow.querySelector('.parada-i-h').value = String(d.getHours()).padStart(2,'0');
  
  const mins = d.getMinutes();
  const roundedMins = Math.round(mins / 10) * 10;
  lastRow.querySelector('.parada-i-m').value = String(roundedMins === 60 ? 50 : roundedMins).padStart(2,'0');
  
  // Bloquear inputs para que no cambien el inicio real
  lastRow.querySelector('.parada-i-fecha').readOnly = true;
  lastRow.querySelector('.parada-i-h').style.pointerEvents = 'none';
  lastRow.querySelector('.parada-i-h').style.background = '#f3f4f6';
  lastRow.querySelector('.parada-i-m').style.pointerEvents = 'none';
  lastRow.querySelector('.parada-i-m').style.background = '#f3f4f6';

  const funcRadio = lastRow.querySelector(`input[name="estado_row_${rowIdNumber}"][value="Funcional"]`);
  if (funcRadio) {
     funcRadio.checked = true;
     funcRadio.dispatchEvent(new Event('change'));
  }
  
  alert(`Se generó un nuevo renglón de OT para la máquina ${mData.machine}.\nPor favor, completa la hora de "Fin Fuera de Servicio" y describe las tareas realizadas para repararla.`);
  lastRow.scrollIntoView({ behavior: 'smooth' });
}

// --------------------------------------------------------
// AUTO-SYNC (5 MINUTOS) Y LOGICA DE NUBE
// --------------------------------------------------------
let isSyncing = false;

function syncDataBackground() {
  if (isSyncing) return;
  isSyncing = true;

  const payload = {
    action: 'sync_data',
    newPending: localQueueTasks,
    newMaquinasCaidas: localQueueMaquinas,
    resolvedMaquinas: localQueueResolvedMaquinas
  };

  fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "OK") {
      // Limpiamos las colas locales que acaban de ser enviadas con éxito
      localQueueTasks = [];
      localQueueMaquinas = [];
      localQueueResolvedMaquinas = [];
      saveLocalQueues();

      // Parseamos la nueva verdad de la nube
      cloudPending = parseCloudPending(data.allPending || []);
      cloudMaquinas = parseCloudMaquinas(data.allMaquinasCaidas || []);
      cloudApproved = parseCloudApproved(data.recentApproved || []);
      saveCloudCache();

      // Refrescamos la UI si corresponde
      updateTiempoTotal();
      renderOperatorSidebar();
      renderMaquinasCaidasSidebar();
      if (supervisorLoggedIn) renderCalendar();
    }
  })
  .catch(e => console.log('Auto-Sync Failed:', e))
  .finally(() => {
    isSyncing = false;
  });
}

// Iniciar auto-sync cada 5 minutos
setInterval(syncDataBackground, 300000);
// Y sincronizar al abrir la app
window.addEventListener('load', syncDataBackground);

function parseCloudPending(rows) {
  return rows.map(r => ({
    id: r[0], plant: r[1], date: r[2], shift: r[3], operator: r[4], from: r[5], to: r[6],
    totalTime: parseFloat(r[7]), description: r[8], type: r[9], category: r[10], machine: r[11],
    nature: r[12], deviation: r[13], recommendations: r[14], manHours: parseFloat(r[15]),
    affectsDisp: r[16] === true || r[16] === 'SI' || r[16] === 'TRUE', startOut: r[17], endOut: r[18], stopTime: r[19], finalState: r[20],
    companions: r[21], 
    evalStatus: r[22] || 'PENDING',
    evalObs: r[23] || '',
    status: 'PENDING'
  }));
}

function parseCloudMaquinas(rows) {
  return rows.map(r => ({
    id: r[0], plant: r[1], machine: r[2], startOutISO: r[3], reportedBy: r[4]
  }));
}

function parseCloudApproved(rows) {
  return rows.map(r => ({
    id: r[0], plant: r[1], date: r[2], shift: r[3], operator: r[4], from: r[5], to: r[6],
    totalTime: parseFloat(r[7]), description: r[8], type: r[9], category: r[10], machine: r[11],
    nature: r[12], deviation: r[13], recommendations: r[14], manHours: parseFloat(r[15]),
    affectsDisp: r[16] === true || r[16] === 'SI' || r[16] === 'TRUE', startOut: r[17], endOut: r[18], stopTime: r[19], finalState: r[20],
    companions: r[21], obsSup: r[22], status: 'APPROVED'
  }));
}

// --------------------------------------------------------
// HISTORIAL DE APROBADAS (SUPERVISOR)
// --------------------------------------------------------
const btnHistory = document.getElementById('btn-sup-history');
const modalHistory = document.getElementById('modal-history');
const btnHistoryClose = document.getElementById('btn-history-close');
const historyContent = document.getElementById('history-content');

if (btnHistory) {
  btnHistory.addEventListener('click', () => {
    renderHistory();
    modalHistory.classList.remove('hidden');
  });
}

if (btnHistoryClose) {
  btnHistoryClose.addEventListener('click', () => {
    modalHistory.classList.add('hidden');
  });
}

function renderHistory() {
  const myApproved = cloudApproved.filter(t => t.plant === currentPlant).reverse();
  
  if (myApproved.length === 0) {
    historyContent.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:2rem;">No hay tareas aprobadas recientes para esta planta.</div>';
    return;
  }

  let html = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                <thead>
                  <tr style="background:#f3f4f6; text-align:left;">
                    <th style="padding:0.5rem; border:1px solid var(--border);">Fecha</th>
                    <th style="padding:0.5rem; border:1px solid var(--border);">Operario</th>
                    <th style="padding:0.5rem; border:1px solid var(--border);">Horario</th>
                    <th style="padding:0.5rem; border:1px solid var(--border);">Descripción</th>
                    <th style="padding:0.5rem; border:1px solid var(--border);">Máquina/tipo</th>
                    <th style="padding:0.5rem; border:1px solid var(--border); text-align:center;">Acción</th>
                  </tr>
                </thead>
                <tbody>`;
  
  myApproved.forEach(t => {
    html += `<tr>
               <td style="padding:0.5rem; border:1px solid var(--border);">${t.date}</td>
               <td style="padding:0.5rem; border:1px solid var(--border);">${t.operator}</td>
               <td style="padding:0.5rem; border:1px solid var(--border);">${t.from} a ${t.to}</td>
               <td style="padding:0.5rem; border:1px solid var(--border);">${t.description.substring(0,40)}...</td>
               <td style="padding:0.5rem; border:1px solid var(--border);">${t.hasOT ? t.machine : t.type}</td>
               <td style="padding:0.5rem; border:1px solid var(--border); text-align:center;">
                  <button class="btn btn-undo-approve" data-id="${t.id}" style="padding:0.3rem 0.6rem; font-size:0.8rem; background:#dc2626; color:#fff; border:none; cursor:pointer; border-radius:4px;">Deshacer</button>
               </td>
             </tr>`;
  });
  html += `</tbody></table>`;
  historyContent.innerHTML = html;

  historyContent.querySelectorAll('.btn-undo-approve').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idToUndo = e.target.getAttribute('data-id');
      if(confirm("¿Seguro que deseas deshacer esta aprobación? La tarea volverá a la lista de pendientes.")) {
        e.target.textContent = "Deshaciendo...";
        e.target.disabled = true;
        fetch(GAS_URL, {
           method: 'POST',
           headers: { 'Content-Type': 'text/plain;charset=utf-8' },
           body: JSON.stringify({ action: 'undo_approve', id: idToUndo })
        })
        .then(res => res.json())
        .then(() => {
           syncDataBackground();
           modalHistory.classList.add('hidden');
        }).catch(err => {
           alert("Error al deshacer la aprobación.");
           e.target.textContent = "Deshacer";
           e.target.disabled = false;
        });
      }
    });
  });
}
