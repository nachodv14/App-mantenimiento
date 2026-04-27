/**
 * GOOGLE APPS SCRIPT - BACKEND PARA MANTENIMIENTO APP
 * 
 * INSTRUCCIONES:
 * 1. En tu Google Sheet, ve a Extensiones > Apps Script.
 * 2. Borra todo el código existente y pega este contenido.
 * 3. Asegúrate de tener dos hojas llamadas "Pendientes" y "Aprobados".
 * 4. Haz clic en "Implementar" > "Nueva implementación".
 * 5. Tipo: Aplicación web. Ejecutar como: Tú. Quién tiene acceso: Cualquiera.
 * 6. Copia la URL generada y pégala en la constante GAS_URL de tu archivo app.js.
 */

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPend = ss.getSheetByName("Pendientes");
  var sheetAprob = ss.getSheetByName("Aprobados");

  // ACCIÓN: GUARDAR DESDE LA TABLET A PENDIENTES
  if (data.action === "save_pending") {
    data.tasks.forEach(function(t) {
      sheetPend.appendRow([
        t.id,               // 1. ID
        t.plant,            // 2. PLANTA
        t.date,             // 3. FECHA
        t.shift,            // 4. TURNO
        t.operator,         // 5. OPERARIO
        t.from,             // 6. DESDE
        t.to,               // 7. HASTA
        t.totalTime,        // 8. TIEMPO_TOTAL_H
        t.description,      // 9. DESCRIPCION
        t.type,             // 10. TIPO
        t.category || "",   // 11. CATEGORIA
        t.machine || "",    // 12. MAQUINA
        t.nature || "",     // 13. NATURALEZA
        t.deviation || "",  // 14. DESVIACION
        t.recommendations || "", // 15. RECOMENDACIONES
        t.manHours,         // 16. HH_TOTALES (ya calculado en el frontend)
        t.affectsDisp,      // 17. AFECTA_DISP (SI/NO)
        t.startOut || "",   // 18. INICIO_PARADA
        t.endOut || "",     // 19. FIN_PARADA
        t.stopTime || "0",  // 20. TIEMPO_PARADA
        t.finalState || "", // 21. ESTADO_FINAL
        t.companions || ""  // 22. COMPAÑEROS
      ]);
    });
    return ContentService.createTextOutput("OK");
  }

  // ACCIÓN: APROBAR DESDE LA VISTA SUPERVISOR
  if (data.action === "approve_pending") {
    var rows = sheetPend.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.id) {
        var rowData = rows[i];
        // 23. OBS_SUPERVISOR (se agrega al final al mover a Aprobados)
        rowData.push(data.obs || ""); 
        sheetAprob.appendRow(rowData);
        sheetPend.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput("OK");
  }
  
  // ACCIÓN: RECHAZAR/ELIMINAR
  if (data.action === "reject_pending") {
     var rows = sheetPend.getDataRange().getValues();
     for (var i = 1; i < rows.length; i++) {
       if (rows[i][0] === data.id) {
         sheetPend.deleteRow(i + 1);
         break;
       }
     }
     return ContentService.createTextOutput("OK");
  }
}
