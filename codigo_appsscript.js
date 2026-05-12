/**
 * GOOGLE APPS SCRIPT - BACKEND PARA MANTENIMIENTO APP (V2 - CLOUD HÍBRIDA)
 * 
 * INSTRUCCIONES:
 * 1. En tu Google Sheet, ve a Extensiones > Apps Script.
 * 2. Borra todo el código existente y pega este contenido.
 * 3. Asegúrate de tener estas TRES hojas (exactamente con estos nombres):
 *    - Pendientes
 *    - Aprobados
 *    - MaquinasCaidas (¡NUEVA! Créala si no existe)
 * 4. Haz clic en "Implementar" > "Nueva implementación".
 * 5. Tipo: Aplicación web. Ejecutar como: Tú. Quién tiene acceso: Cualquiera.
 * 6. Copia la URL generada y pásasela al desarrollador para continuar.
 */

function doPost(e) {
  try {
    // Para evitar problemas de CORS preflight, la app envía el JSON como texto plano.
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPend = ss.getSheetByName("Pendientes");
    var sheetAprob = ss.getSheetByName("Aprobados");
    var sheetCaidas = ss.getSheetByName("MaquinasCaidas");

    // Crear la hoja MaquinasCaidas automáticamente si el usuario olvidó crearla
    if (!sheetCaidas) {
      sheetCaidas = ss.insertSheet("MaquinasCaidas");
    }

    var response = { status: "OK" };

    // ==========================================
    // ACCIÓN 1: SYNC DATA (Bidireccional)
    // Sube nuevas tareas/máquinas y descarga el estado actual
    // ==========================================
    if (data.action === "sync_data") {
      // 1. Guardar nuevas tareas pendientes
      if (data.newPending && data.newPending.length > 0) {
        data.newPending.forEach(function(t) {
          sheetPend.appendRow([
            t.id, t.plant, t.date, t.shift, t.operator, t.from, t.to,
            t.totalTime, t.description, t.type, t.category || "", t.machine || "",
            t.nature || "", t.deviation || "", t.recommendations || "",
            t.manHours, t.affectsDisp, t.startOut || "", t.endOut || "",
            t.stopTime || "0", t.finalState || "", t.companions || ""
          ]);
        });
      }

      // 2. Resolver máquinas caídas (borrarlas de la lista)
      if (data.resolvedMaquinas && data.resolvedMaquinas.length > 0) {
        var caidasData = sheetCaidas.getDataRange().getValues();
        // Empezamos desde el final para no alterar los índices al borrar
        for (var i = caidasData.length - 1; i >= 0; i--) {
          var rowId = caidasData[i][0];
          if (data.resolvedMaquinas.indexOf(rowId) !== -1) {
            sheetCaidas.deleteRow(i + 1);
          }
        }
      }

      // 3. Agregar nuevas máquinas caídas
      if (data.newMaquinasCaidas && data.newMaquinasCaidas.length > 0) {
        data.newMaquinasCaidas.forEach(function(m) {
          sheetCaidas.appendRow([
            m.id, m.plant, m.machine, m.startOutISO, m.reportedBy
          ]);
        });
      }

      // 4. Leer y devolver el estado actualizado para la tablet
      response.allPending = getSheetData(sheetPend, 22);
      response.allMaquinasCaidas = getSheetData(sheetCaidas, 5);
      // Descargamos las últimas 200 filas de aprobadas para historial y control de solapamiento
      response.recentApproved = getRecentData(sheetAprob, 23, 200);
    }

    // ==========================================
    // ACCIÓN 2: APROBAR TAREA (Supervisor)
    // ==========================================
    else if (data.action === "approve_pending") {
      var rows = sheetPend.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          var rowData = rows[i];
          rowData.push(data.obs || ""); // Col 23: OBS_SUPERVISOR
          sheetAprob.appendRow(rowData);
          sheetPend.deleteRow(i + 1);
          break;
        }
      }
    }

    // ==========================================
    // ACCIÓN 3: RECHAZAR TAREA (Supervisor)
    // ==========================================
    else if (data.action === "reject_pending") {
      var rows = sheetPend.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          sheetPend.deleteRow(i + 1);
          break;
        }
      }
    }

    // ==========================================
    // ACCIÓN 4: DESHACER APROBACIÓN (Supervisor)
    // ==========================================
    else if (data.action === "undo_approve") {
      var rows = sheetAprob.getDataRange().getValues();
      // Buscamos desde abajo hacia arriba porque es un historial reciente
      for (var i = rows.length - 1; i >= 1; i--) {
        if (rows[i][0] === data.id) {
          var rowData = rows[i];
          // Cortamos la columna 23 (obs supervisor) para devolverla a Pendientes
          var restoredData = rowData.slice(0, 22);
          sheetPend.appendRow(restoredData);
          sheetAprob.deleteRow(i + 1);
          break;
        }
      }
    }

    // Devolver la respuesta en formato JSON
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función auxiliar para convertir hojas en un array de objetos
 */
function getSheetData(sheet, colCount) {
  var data = [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return data; // Vacío o solo cabeceras
  
  // Asumimos que la fila 1 es encabezado, empezamos en la 2
  var rows = sheet.getRange(2, 1, lastRow - 1, colCount).getValues();
  
  for (var i = 0; i < rows.length; i++) {
    // Filtramos filas vacías chequeando la primera columna (el ID)
    if (rows[i][0]) {
      data.push(rows[i]);
    }
  }
  return data;
}

/**
 * Función auxiliar para descargar solo las N últimas filas
 */
function getRecentData(sheet, colCount, limit) {
  var data = [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return data;

  var startRow = Math.max(2, lastRow - limit + 1);
  var numRows = lastRow - startRow + 1;
  var rows = sheet.getRange(startRow, 1, numRows, colCount).getValues();
  
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0]) {
      data.push(rows[i]);
    }
  }
  return data;
}
