/**
 * GOOGLE APPS SCRIPT - BACKEND PARA MANTENIMIENTO APP (V3 - MEJORAS UX)
 */

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPend = ss.getSheetByName("Pendientes");
    var sheetAprob = ss.getSheetByName("Aprobados");
    var sheetCaidas = ss.getSheetByName("MaquinasCaidas");

    if (!sheetCaidas) {
      sheetCaidas = ss.insertSheet("MaquinasCaidas");
      sheetCaidas.appendRow(["ID", "Planta", "Máquina", "InicioISO", "ReportadoPor"]);
    }

    var response = { status: "OK" };

    // ==========================================
    // ACCIÓN 1: SYNC DATA
    // ==========================================
    if (data.action === "sync_data") {
      if (data.newPending && data.newPending.length > 0) {
        data.newPending.forEach(function(t) {
          sheetPend.appendRow([
            t.id, t.plant, t.date, t.shift, t.operator, t.companions || "", 
            t.from, t.to, t.totalTime, t.description,
            t.category || "", t.machine || "", t.nature || "", t.deviation || "", t.recommendations || "",
            t.manHours, t.affectsDisp, t.startOut || "", t.endOut || "",
            t.stopTime || "0", t.finalState || ""
          ]);
        });
      }

      if (data.resolvedMaquinas && data.resolvedMaquinas.length > 0) {
        var caidasData = sheetCaidas.getDataRange().getValues();
        for (var i = caidasData.length - 1; i >= 0; i--) {
          if (data.resolvedMaquinas.indexOf(caidasData[i][0]) !== -1) {
            sheetCaidas.deleteRow(i + 1);
          }
        }
      }

      if (data.newMaquinasCaidas && data.newMaquinasCaidas.length > 0) {
        data.newMaquinasCaidas.forEach(function(m) {
          sheetCaidas.appendRow([m.id, m.plant, m.machine, m.startOutISO, m.reportedBy]);
        });
      }

      // Devolvemos 23 columnas de Pendientes (21 base + 2 de status)
      response.allPending = getSheetData(sheetPend, 23);
      response.allMaquinasCaidas = getSheetData(sheetCaidas, 5);
      response.recentApproved = getRecentData(sheetAprob, 22, 200);
    }

    // ==========================================
    // ACCIÓN 2: APROBAR TAREA
    // ==========================================
    else if (data.action === "approve_pending") {
      var rows = sheetPend.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          var rowData = rows[i].slice(0, 21); // 21 columnas base
          rowData.push(data.obs || "");       // Col 22: OBS_SUPERVISOR
          sheetAprob.appendRow(rowData);
          sheetPend.deleteRow(i + 1);
          break;
        }
      }
    }

    // ==========================================
    // ACCIÓN 3: RECHAZAR/DEVOLVER TAREA (Supervisor)
    // ==========================================
    else if (data.action === "reject_pending") {
      var rows = sheetPend.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          sheetPend.getRange(i + 1, 22).setValue("RECHAZADA");
          sheetPend.getRange(i + 1, 23).setValue(data.obs || "");
          break;
        }
      }
    }

    // ==========================================
    // ACCIÓN 4: BORRAR TAREA (Operario o Supervisor)
    // ==========================================
    else if (data.action === "delete_pending") {
      var rows = sheetPend.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === data.id) {
          sheetPend.deleteRow(i + 1);
          break;
        }
      }
    }

    // ==========================================
    // ACCIÓN 5: DESHACER APROBACIÓN
    // ==========================================
    else if (data.action === "undo_approve") {
      var rows = sheetAprob.getDataRange().getValues();
      for (var i = rows.length - 1; i >= 1; i--) {
        if (rows[i][0] === data.id) {
          var restoredData = rows[i].slice(0, 21);
          sheetPend.appendRow(restoredData);
          sheetAprob.deleteRow(i + 1);
          break;
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetData(sheet, colCount) {
  var data = [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return data;
  var rows = sheet.getRange(2, 1, lastRow - 1, colCount).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0]) data.push(rows[i]);
  }
  return data;
}

function getRecentData(sheet, colCount, limit) {
  var data = [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return data;
  var startRow = Math.max(2, lastRow - limit + 1);
  var numRows = lastRow - startRow + 1;
  var rows = sheet.getRange(startRow, 1, numRows, colCount).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0]) data.push(rows[i]);
  }
  return data;
}
