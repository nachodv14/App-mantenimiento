const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const ddl = `-- ==============================================================================
-- Script de creación de base de datos para migración a SQL Server (App-Mantenimiento)
-- ==============================================================================

-- --------------------------------------------------
-- Crear Tabla machines_out_of_service
-- --------------------------------------------------
CREATE TABLE [machines_out_of_service] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    [plant] NVARCHAR(MAX) NOT NULL,
    [machine_id] UNIQUEIDENTIFIER NULL,
    [reported_by] UNIQUEIDENTIFIER NULL,
    [start_time] DATETIME2 NOT NULL,
    [deviation] NVARCHAR(MAX) NULL,
    [is_resolved] BIT NULL DEFAULT 0,
    [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [resolved_at] DATETIME2 NULL
);
GO

-- --------------------------------------------------
-- Crear Tabla machines
-- --------------------------------------------------
CREATE TABLE [machines] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    [name] NVARCHAR(MAX) NOT NULL,
    [plant] NVARCHAR(MAX) NOT NULL,
    [is_active] BIT NULL DEFAULT 1,
    [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [sector] NVARCHAR(MAX) NULL,
    [productive_start] NVARCHAR(MAX) NULL,
    [productive_end] NVARCHAR(MAX) NULL
);
GO

-- --------------------------------------------------
-- Crear Tabla tasks
-- --------------------------------------------------
CREATE TABLE [tasks] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    [plant] NVARCHAR(MAX) NOT NULL,
    [task_date] DATE NOT NULL,
    [shift] NVARCHAR(MAX) NOT NULL,
    [operator_id] UNIQUEIDENTIFIER NULL,
    [companions] NVARCHAR(MAX) NULL,
    [start_time] TIME NOT NULL,
    [end_time] TIME NOT NULL,
    [total_time_minutes] INT NULL,
    [man_hours] DECIMAL(18,2) NULL,
    [description] NVARCHAR(MAX) NULL,
    [task_type] NVARCHAR(MAX) NULL,
    [category] NVARCHAR(MAX) NULL,
    [machine_id] UNIQUEIDENTIFIER NULL,
    [nature] NVARCHAR(MAX) NULL,
    [deviation] NVARCHAR(MAX) NULL,
    [recommendations] NVARCHAR(MAX) NULL,
    [affects_availability] BIT NULL DEFAULT 0,
    [start_out_time] DATETIME2 NULL,
    [end_out_time] DATETIME2 NULL,
    [stop_time_minutes] INT NULL,
    [final_state] NVARCHAR(MAX) NULL,
    [status] NVARCHAR(MAX) NULL DEFAULT 'PENDING',
    [supervisor_obs] NVARCHAR(MAX) NULL,
    [created_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [updated_at] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [observaciones] NVARCHAR(MAX) NULL
);
GO

-- --------------------------------------------------
-- Tablas de Diccionarios (plants, record_types, etc.)
-- --------------------------------------------------
CREATE TABLE [plants] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX) NOT NULL
);
GO

CREATE TABLE [record_types] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX) NOT NULL
);
GO

CREATE TABLE [nature_types] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX) NOT NULL
);
GO

CREATE TABLE [building_categories] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX) NOT NULL
);
GO

CREATE TABLE [absence_reasons] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [name] NVARCHAR(MAX) NOT NULL
);
GO

-- --------------------------------------------------
-- Crear Tabla users
-- --------------------------------------------------
CREATE TABLE [users] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    [username] NVARCHAR(MAX) NULL,
    [password_hash] NVARCHAR(MAX) NULL,
    [full_name] NVARCHAR(MAX) NULL,
    [role] NVARCHAR(MAX) NULL,
    [plant] NVARCHAR(MAX) NULL,
    [is_active] BIT NULL DEFAULT 1,
    [created_at] DATETIME2 NULL DEFAULT GETUTCDATE(),
    [last_login] DATETIME2 NULL,
    [email] NVARCHAR(MAX) NULL,
    [encrypted_password] NVARCHAR(MAX) NULL,
    [phone] NVARCHAR(MAX) NULL
);
GO

-- --------------------------------------------------
-- Crear Tabla shift_configs
-- --------------------------------------------------
CREATE TABLE [shift_configs] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [plant] NVARCHAR(MAX) NOT NULL,
    [shift_name] NVARCHAR(MAX) NOT NULL,
    [start_time] NVARCHAR(MAX) NOT NULL,
    [end_time] NVARCHAR(MAX) NOT NULL,
    [updated_at] DATETIME2 NULL DEFAULT CURRENT_TIMESTAMP
);
GO

-- --------------------------------------------------
-- Crear Tabla monthly_business_days
-- --------------------------------------------------
CREATE TABLE [monthly_business_days] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [plant] NVARCHAR(MAX) NOT NULL,
    [year_month] NVARCHAR(MAX) NOT NULL,
    [business_days] INT NOT NULL DEFAULT 20,
    [updated_at] DATETIME2 NULL DEFAULT CURRENT_TIMESTAMP
);
GO

`;

async function writeFullScript() {
  let content = ddl;
  const tables = ['plants', 'record_types', 'nature_types', 'building_categories', 'absence_reasons', 'users', 'machines', 'shift_configs'];
  for(let table of tables) {
    content += "-- Data for " + table + "\n";
    const res = await pool.query('SELECT * FROM ' + table);
    for(let row of res.rows) {
      let cols = Object.keys(row);
      let vals = cols.map(c => {
        let v = row[c];
        if (v === null || v === undefined) return 'NULL';
        if (typeof v === 'boolean') return v ? 1 : 0;
        if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace('T', ' ') + "'";
        return "'" + String(v).replace(/'/g, "''") + "'";
      });
      content += "INSERT INTO [" + table + "] (" + cols.map(c => "["+c+"]").join(', ') + ") VALUES (" + vals.join(', ') + ");\n";
    }
    content += 'GO\n\n';
  }
  fs.writeFileSync('init_sqlserver.sql', content, 'utf8');
  pool.end();
}
writeFullScript();
