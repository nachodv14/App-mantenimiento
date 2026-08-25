import sql from 'mssql';

const sqlConfig = {
  // Configuración de conexión usando la variable de entorno
  // La variable debe tener formato mssql://usuario:pass@servidor:1433/base?encrypt=true
  connectionString: process.env.DATABASE_URL,
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true // Change to true for local dev / self-signed certs
  }
};

const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    throw err;
  });

export async function query(text, params = []) {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    
    // Convertir parámetros estilo PostgreSQL ($1, $2) a estilo SQL Server (@p1, @p2)
    // y asignar los valores al request de mssql.
    let mssqlText = text;
    
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        const paramName = `p${index + 1}`;
        
        // Manejar arreglos para usar en cláusulas IN (traduciendo = ANY($X))
        // NOTA: Para que esto funcione, el string SQL no debería usar = ANY($1) 
        // sino que debería ser reemplazado manualmente en el código por IN (SELECT value FROM string_split(@p1, ','))
        if (Array.isArray(param)) {
          request.input(paramName, sql.NVarChar, param.join(','));
        } else {
          request.input(paramName, param);
        }
        
        // Expresión regular para reemplazar el $X asegurando que no se reemplace $10 cuando buscamos $1
        const regex = new RegExp(`\\$${index + 1}(?!\\d)`, 'g');
        mssqlText = mssqlText.replace(regex, `@${paramName}`);
      });
    }

    const result = await request.query(mssqlText);
    
    // Retornar en el mismo formato que esperaba pg (result.rows y result.rowCount)
    return {
      rows: result.recordset || [],
      rowCount: result.rowsAffected ? result.rowsAffected[0] : 0
    };
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
