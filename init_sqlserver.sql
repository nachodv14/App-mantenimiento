-- ==============================================================================
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

-- Data for plants
INSERT INTO [plants] ([id], [name]) VALUES ('1', 'SL2');
INSERT INTO [plants] ([id], [name]) VALUES ('2', 'SL1');
INSERT INTO [plants] ([id], [name]) VALUES ('3', 'PIL');
INSERT INTO [plants] ([id], [name]) VALUES ('4', 'PY');
INSERT INTO [plants] ([id], [name]) VALUES ('5', 'RIV');
INSERT INTO [plants] ([id], [name]) VALUES ('6', 'RAM');
INSERT INTO [plants] ([id], [name]) VALUES ('7', 'CBA');
GO

-- Data for record_types
INSERT INTO [record_types] ([id], [name]) VALUES ('1', 'Mantenimiento de máquina (OT)');
INSERT INTO [record_types] ([id], [name]) VALUES ('2', 'Mantenimiento edilicio / varios');
INSERT INTO [record_types] ([id], [name]) VALUES ('3', 'Ausentismo / no productivo');
GO

-- Data for nature_types
INSERT INTO [nature_types] ([id], [name]) VALUES ('1', 'Inspección');
INSERT INTO [nature_types] ([id], [name]) VALUES ('2', 'Preventivo programado');
INSERT INTO [nature_types] ([id], [name]) VALUES ('3', 'Preventivo condicional');
INSERT INTO [nature_types] ([id], [name]) VALUES ('4', 'Preventivo semanal');
INSERT INTO [nature_types] ([id], [name]) VALUES ('5', 'Preventivo mensual');
INSERT INTO [nature_types] ([id], [name]) VALUES ('6', 'Preventivo trimestral');
INSERT INTO [nature_types] ([id], [name]) VALUES ('7', 'Preventivo semestral');
INSERT INTO [nature_types] ([id], [name]) VALUES ('8', 'Preventivo anual');
INSERT INTO [nature_types] ([id], [name]) VALUES ('9', 'Mejoras');
INSERT INTO [nature_types] ([id], [name]) VALUES ('10', 'Falla');
INSERT INTO [nature_types] ([id], [name]) VALUES ('11', 'Montaje');
GO

-- Data for building_categories
INSERT INTO [building_categories] ([id], [name]) VALUES ('1', 'Orden y limpieza');
INSERT INTO [building_categories] ([id], [name]) VALUES ('2', 'Reunión, capacitación o asamblea');
INSERT INTO [building_categories] ([id], [name]) VALUES ('3', 'Planta general');
INSERT INTO [building_categories] ([id], [name]) VALUES ('4', 'Taller o pañol');
INSERT INTO [building_categories] ([id], [name]) VALUES ('5', 'Asistencia a logística');
INSERT INTO [building_categories] ([id], [name]) VALUES ('6', 'Asistencia a producción');
INSERT INTO [building_categories] ([id], [name]) VALUES ('7', 'Asistencia a comercio');
GO

-- Data for absence_reasons
INSERT INTO [absence_reasons] ([id], [name]) VALUES ('1', 'Carpeta médica');
INSERT INTO [absence_reasons] ([id], [name]) VALUES ('2', 'Vacaciones');
INSERT INTO [absence_reasons] ([id], [name]) VALUES ('3', 'Salidas personales o retiros');
INSERT INTO [absence_reasons] ([id], [name]) VALUES ('4', 'Feriados');
GO

-- Data for users
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('7d0f2c31-136a-4675-b0d6-c9db5d71c72b', 'op_irigoitia_ram', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Irigoitia', 'operario', 'RAM', 1, '2026-05-22 02:46:38', '2026-06-19 16:25:35');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('7ded2bf7-7717-4b8e-97a8-6691c5b2099a', 'dkern', '$2b$10$QigP8ztWOCp89KjEAs2sROHC0KTx1o5amn3/Jv5ZlaMXmmYzB1wu2', 'dkern', 'supervisor', 'PIL', 1, '2026-05-22 02:46:43', '2026-08-07 14:27:17');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('8d96a468-9179-4eaa-a301-0af0d39e8004', 'fbustos', '$2b$10$HDMA1VXYL4Axvz4g23rWoutkz/.MpE2H.84tXUEmHDyq2MZV7LWz6', 'franco ', 'supervisor', 'RAM', 0, '2026-06-03 23:08:40', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('e3625994-1e32-46f1-b127-7fd4d8d585aa', 'garce', '$2b$10$O3XYLWJP0Ruk.QEaiokLYuTWZL4/Eex64MyT08IiOr6QKHrdq0WvS', 'garce', 'supervisor', 'CBA', 1, '2026-05-22 02:46:43', '2026-08-07 15:04:31');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('0675db1b-ced6-43ad-8f04-6c274f547bfc', 'op_contrera_cba', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Contrera', 'operario', 'CBA', 1, '2026-05-22 02:46:39', '2026-05-29 15:02:48');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('7fcc1025-a25c-4930-bf8b-4e70ebcba8dd', 'op_baigorria_sl2', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Baigorria', 'operario', 'SL2', 1, '2026-05-22 02:46:36', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('9ed83a0a-ff5a-49e5-8f34-d8c51eea8c6e', 'op_guardia_cba', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Guardia', 'operario', 'CBA', 1, '2026-05-22 02:46:40', '2026-05-29 14:30:28');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('45e489c1-0cba-4d9c-8d9a-c0094b2301cc', 'op_gutierrez_sl2', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Gutierrez', 'operario', 'SL2', 1, '2026-05-22 02:46:36', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('0e60e159-5263-400e-bd38-b2fa76f89e5b', 'op_aberastain_sl2', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Aberastain', 'operario', 'SL2', 1, '2026-05-22 02:46:37', '2026-06-03 22:54:30');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('cc0905b7-d45e-4ec7-a8fe-b927a3979b91', 'op_miranda_cba', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Miranda', 'operario', 'CBA', 1, '2026-05-22 02:46:39', '2026-05-29 14:59:45');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('af65bdff-890c-4647-9708-ea55ac733956', 'op_kern_pil', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Kern', 'operario', 'PIL', 1, '2026-05-22 02:46:40', '2026-05-29 15:23:21');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('eac14ddb-b3e4-413e-896e-13c399b0f696', 'op_cantero_py', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Cantero', 'operario', 'PY', 1, '2026-05-22 02:46:40', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('47dc2432-18b4-4966-8a81-4549cb92e036', 'op_rolon_py', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Rolon', 'operario', 'PY', 1, '2026-05-22 02:46:41', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('0dff1d53-fb4b-4c10-a7c4-156fe45ae9de', 'op_gonzalez_sl2', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Gonzalez', 'operario', 'SL2', 1, '2026-05-22 02:46:36', '2026-07-22 23:00:08');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('dbc55cb7-a421-40fc-a09c-7c06fef3a139', 'jchamorro', '$2b$10$IQfgVSycCNfwGs9/8QK4EO3SGp0JsTeSjSbbLEAx7ZRLeUMF8A/f2', 'jchamorro', 'supervisor', 'PY', 1, '2026-05-22 02:46:43', '2026-06-09 18:22:38');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('b938a552-3558-42e7-ba41-9fd42baa8696', 'dbustos', '$2b$10$/AJ9zfJn6D1yMGd2mc0/t.P23Cjh3UI1HgbPoQxI.ovL5Og9812e.', 'dbustos', 'supervisor', 'RAM', 1, '2026-05-22 02:46:42', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('6ad98745-e9a6-48ab-9b11-d85f09522d1e', 'op_abella_ram', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Abella', 'operario', 'RAM', 1, '2026-05-22 02:46:38', '2026-08-07 15:17:35');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('a312addb-7d48-47ae-b3a5-d130afd57f75', 'jblanco', '$2b$10$IoSZ95qPRRktTyI91Z6lEuFDiYOHXiFUkIVwfpWFNYJR6o5kXVu7.', 'jblanco', 'supervisor', 'RIV', 1, '2026-05-22 02:46:44', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('fd521ebb-fdcb-44f8-af1f-82e6230486fb', 'op_rivero_ram', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Rivero', 'operario', 'RAM', 1, '2026-05-22 02:46:39', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('883ed6a5-756d-41ee-b596-8a6dd2a80e11', 'op_beltran_sl1', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Beltran', 'operario', 'SL1', 1, '2026-05-22 02:46:37', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('85a38518-2dcd-478e-864d-09405bb50a20', 'op_aguirre_cba', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Aguirre', 'operario', 'CBA', 1, '2026-05-22 02:46:39', '2026-07-08 16:04:43');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('3b8c8d1c-3dcb-4725-ad05-21e69c6b4899', 'op_prado_sl1', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Prado', 'operario', 'SL1', 1, '2026-05-22 02:46:38', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('82ffc29a-71b0-4ac2-ae83-e0f6c8063199', 'op_reyes_sl1', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Reyes', 'operario', 'SL1', 1, '2026-05-22 02:46:38', NULL);
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('e0289e51-d1ca-43b5-90ec-9ea18fbcbe07', 'op_saldaña_sl2', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Saldaña', 'operario', 'SL2', 1, '2026-05-22 02:46:36', '2026-07-30 14:28:22');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('f035a248-b632-491d-8433-a933b143843b', 'pvega', '$2b$10$hRbWM3Kgk4l2oeJDuuAK1.pT8tGW3SC9NE/1/DlS9Tb65KifoKaK2', 'pvega', 'supervisor', 'RAM', 1, '2026-05-22 02:46:41', '2026-08-07 15:37:06');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('4e7b54ab-d292-438d-89ac-877df88b90b9', 'snavarro', '$2b$10$bSp2wCbkH/ppwd6szuWY/enndjFt4o0mC4GEIU.BzxAh/SEHS.FF.', 'snavarro', 'supervisor', 'SL1', 1, '2026-05-22 02:46:42', '2026-08-06 14:33:30');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('73210afe-0675-4cdb-b9ba-03eee5fb55f0', 'op_azcurra_sl1', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Azcurra', 'operario', 'SL1', 1, '2026-05-22 02:46:37', '2026-07-30 14:49:52');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('c876b40c-e414-4693-aa83-b628d3d7d3c5', 'admin', '$2b$10$wPMquwOEzknFxbZVQyccZuLxy.shnirhrASbg232N9KLNH0BNZsga', 'Administrador Principal', 'admin', 'ALL', 1, '2026-06-19 14:57:02', '2026-08-11 18:37:25');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('5dad0ebc-5862-4159-bbc8-dcfffacf11a6', 'op_burgos_py', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Burgos', 'operario', 'PY', 1, '2026-05-22 02:46:40', '2026-06-18 16:01:27');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('52114e09-382c-4969-befe-1ba07b38b9fa', 'op_marun_ram', '$2b$10$VVZhAGZBumss7tFxYOb8je2r3VmikgqX3C9V7lFt91IO45jmJuG1i', 'Marun', 'operario', 'RAM', 1, '2026-05-22 02:46:39', '2026-06-19 16:24:45');
INSERT INTO [users] ([id], [username], [password_hash], [full_name], [role], [plant], [is_active], [created_at], [last_login]) VALUES ('968aaae8-71de-43d4-b550-24580df2a7c2', 'asarchioni', '$2b$10$iiuuaqqG/j1teQMogGbQX.VkCUzR3dOtgB./sY.pzc3RagxWGhdvq', 'asarchioni', 'supervisor', 'SL2', 1, '2026-05-22 02:46:44', '2026-08-07 14:23:16');
GO

-- Data for machines
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('e2fa22de-2186-4934-b6c1-0397110b0b22', 'M07 - Conformadora de tubos Olimpia 80', 'SL2', 1, '2026-05-22 00:07:59', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('bf7f9d2a-d742-40a0-8b8e-0a881f7a2ea2', 'M08 - Conformadora de perfiles Dry Wall Double Rows Roll - Omega', 'SL2', 1, '2026-05-22 00:07:59', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5440cd2a-dc93-49e2-a3fa-40e928320413', 'M09 - Conformadora de perfiles Dry Wall Montante', 'SL2', 1, '2026-05-22 00:07:59', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8007686b-e22d-4d10-ae97-8b4b478a1355', 'M10 - Conformadora de perfiles Dry Wall Solera U', 'SL2', 1, '2026-05-22 00:08:00', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('24ba5a69-76b1-44c7-b7c8-26c18165140c', 'M11 - Conformadora de perfiles Dry Wall Triple Rows Roll - Cantonera', 'SL2', 1, '2026-05-22 00:08:00', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2b35bd1b-d7cf-4b21-8095-77db05e24601', 'X40 - Balanza - Pilon - Integral Trade 021208 - 20TN', 'SL2', 1, '2026-05-22 00:08:01', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('058ae422-71b6-4d0b-b905-f249c5cbf3cf', 'X42 - Balanza - Pilon - Integral Trade 065123 - 3TN', 'SL2', 1, '2026-05-22 00:08:01', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('023f0287-88ec-4383-acd8-18a8754de444', 'TEJ12 - Tejedora 760-76.2mm', 'SL1', 1, '2026-05-22 00:08:03', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('269b7987-7fc2-4f6d-8401-952325dc06ae', 'TEJ13 - Tejedora 630-63.5mm', 'SL1', 1, '2026-05-22 00:08:03', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('929cbedb-2674-4b48-8823-426ecd10ac07', 'R35 - Puente grua 3TN', 'SL1', 1, '2026-05-22 00:08:04', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d5323c30-f697-41b8-8a30-d6575a32346b', 'K13 - Soldadora a tope varillas', 'SL1', 1, '2026-05-22 00:08:08', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('53f19d1e-866e-4f4b-9a07-330ad6d3642a', 'X23 - Balanza AHS - 5TN - AHS - II R - NARANJA', 'SL1', 1, '2026-05-22 00:08:09', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('dd5f911f-d330-45c0-b535-bc73312c79cf', 'X26 - Balanza AHS - 5TN -AHS - II R - NARANJA', 'SL1', 1, '2026-05-22 00:08:09', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('bb46da1b-97ad-4009-bc83-a515b829c13d', 'X27 - Balanza AHS - 5TN - AHS - I R - AMARILLA', 'SL1', 1, '2026-05-22 00:08:09', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('084371f4-ca08-4cc7-91a5-dff8474a749a', 'X28 - Balanza AHS - 5TN - AHS - II R MINI CRANE', 'SL1', 1, '2026-05-22 00:08:09', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('245fbbde-ed5d-4cab-9c8f-a81520273a22', 'X29 - Balanza AHS - 100KG - AHS - I M - AMARILLA', 'SL1', 1, '2026-05-22 00:08:10', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0be95539-36ea-42bf-94b2-9a284bf59d9a', 'X60 - Balanza ASH - 2TN - ASH - I - AMARILLA', 'SL1', 1, '2026-05-22 00:08:10', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1b989a41-68a5-439f-adf1-8cb0c0a334d5', 'X59 - Balanza Systel - Bumer 30 V2 - 31KG', 'SL1', 1, '2026-05-22 00:08:10', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('020d844e-eaae-4f65-a79a-a8d833aaeb5c', 'X55 - Balanza DRE-1 - 100KG - PLATEADA', 'SL1', 1, '2026-05-22 00:08:10', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('6234e4be-2594-4115-b305-2ba112094d73', 'X101 - Bascula camiones Datta 100 TN', 'SL1', 1, '2026-05-22 00:08:10', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0991d364-3c9c-4c0d-8f5c-cfccfd254d2c', 'X103 - Bascula camiones Datta  80 TN', 'SL1', 1, '2026-05-22 00:08:10', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('93c6db37-5cfa-417d-8475-04e78ddb80d0', 'X30 - Balanza AHS - 5TN - AHS - II R - Naranja', 'SL1', 1, '2026-05-22 00:08:11', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('95002b05-27b7-4602-9c03-95a133f76e90', 'X53 - Balanza AHS - 7,5TN - AHS - I R - Amarilla', 'SL1', 1, '2026-05-22 00:08:11', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('12e17312-5b80-42c8-8e57-c019f986e7be', 'X58 - Balanza AHS-I - 7,5TN - Amarilla', 'SL1', 1, '2026-05-22 00:08:11', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c2f61a33-96ef-4ccd-b96a-0787fff554d4', 'X54 - Balanza AHS - 5TN - AHS - I R - Pañol - Amarilla', 'SL1', 1, '2026-05-22 00:08:11', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ee42a06b-e44b-498b-87b0-7d5838d8cbea', 'G09 - Dobladora de hierro', 'SL1', 1, '2026-05-22 00:08:11', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('66c6288e-6c1f-4fca-bb39-95d04b329b4e', 'PUL06 - Pulmon de aire', 'SL1', 1, '2026-05-22 00:08:12', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('68e42d45-c63b-4185-9c45-3b291b9fa956', 'PUL07 - Pulmon de aire', 'SL1', 1, '2026-05-22 00:08:12', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d89ca1d9-8106-4811-9810-efec25d94c32', 'FIL01 - Sist. de filtro y carcasa de ingreso de agua a planta', 'SL1', 1, '2026-05-22 00:08:12', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('52b3338f-45c3-4aee-b46e-102f1303c944', 'AU01 - Auto Volkswagen GOL 1.6', 'SL1', 1, '2026-05-22 00:08:12', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d699386e-3767-43a9-9eca-be46945fd17e', 'M05 - Conformadora de perfil C', 'SL2', 1, '2026-05-22 00:07:59', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('30efd75b-ef8b-4771-af6b-201b96545c92', 'SEC03 - Secador de aire - SRS 190 - Schulz', 'SL2', 1, '2026-05-22 00:08:00', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f0976fe3-a590-418b-aadb-b47e3893b848', 'SA04 - Autoelevador alquilado', 'SL2', 1, '2026-05-22 00:08:01', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('cd0eb3c0-583b-4fcd-af30-6dd5849f72fe', 'S10 - Autoelevador Maximal 25M 2,5TN', 'SL2', 1, '2026-05-22 00:08:00', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b93fcf99-58fb-4339-a2d0-ee224b32a9e7', 'S08 - Autoelevador motor Fiat 3 cilindros', 'SL2', 1, '2026-05-22 00:08:00', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7b541cb2-a5a7-4344-a049-7f98bafe5f18', 'R38 - Puente grúa Jaso 20TN', 'SL2', 1, '2026-05-22 00:07:57', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c8ce1af0-8bf3-43bd-b567-1cad41d0d7e8', 'R36 - Puente grúa 5TN', 'SL2', 1, '2026-05-22 00:07:57', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b1982222-bea4-44b7-bec2-0c8e3d63bec6', 'ALA01 - Alimentador de alambre', 'SL1', 1, '2026-05-22 00:08:08', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d30a9a9d-e7bc-4f56-a66c-bf7b642d05bc', 'P06 - Schulz SRP 3030 30 HP', 'SL2', 1, '2026-05-22 00:07:58', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('e6ced1eb-93e3-4071-8258-d462876458d7', 'R40 - Puente grua MSV 7TN', 'SL1', 1, '2026-05-22 00:08:04', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('097f958c-a941-46a9-a565-b5cffb3ddcb6', 'PE01 - Perfiladora chapa sinusoidal - OND 18', 'SL2', 1, '2026-05-22 00:07:58', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ea575aa3-f002-4955-a6d2-a1dd40e721c0', 'PE02 - Perfiladora chapa trapezoidal - TP 101', 'SL2', 1, '2026-05-22 00:07:58', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c54ba3c8-8b00-4a4f-8a7c-bc8ba815459d', 'R31 - Puente grúa 3TN', 'SL2', 1, '2026-05-22 00:07:56', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('3fb9fe94-75cb-4db8-8cea-4261dca33745', 'R33 - Puente grúa 15TN', 'SL2', 1, '2026-05-22 00:07:57', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('84d4291c-52ac-48f0-a92a-fa26e0313408', 'R34 - Puente grúa Forvis 5TN', 'SL2', 1, '2026-05-22 00:07:57', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8ad29160-4912-41eb-b322-7f2f80298192', 'CLA01 - Clavos Enkotec M101', 'SL1', 1, '2026-05-22 00:08:08', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('57039e3c-843f-4d33-b80d-1fc5c1617a34', 'ESP01 - Espiraladora Enkotec TR01', 'SL1', 1, '2026-05-22 00:08:08', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('cee793d3-7aba-4a13-b9b5-edaa007e3a87', 'H08 - Schnell Reta Enderezadora', 'SL1', 1, '2026-05-22 00:08:07', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1237fc98-ea92-421e-ad9d-b067934758f8', 'H09 - Mep Bitronic 16-2 Enderezadora', 'SL1', 1, '2026-05-22 00:08:07', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a32ab1cf-60d4-40f1-b62d-cd655574d0ed', 'MEP02 - Malladora Mep P-WELD-HA 24 Hilos', 'SL1', 1, '2026-05-22 00:08:08', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('17bddfab-37c4-4943-91d2-dec25a4d969e', 'P09 - Compresor Sullair 4509', 'SL1', 1, '2026-05-22 00:08:06', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('579d0682-2690-4510-9cd0-74c09d1700f4', 'S09 - Autoelevador Toyota 3,5TN', 'SL1', 1, '2026-05-22 00:08:05', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('96b1aa5a-6191-4d92-bd1d-8d5abbb07ed7', 'R41 - Puente grua Jaso 5TN - Nave 1', 'SL1', 1, '2026-05-22 00:08:05', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('410f6397-09fd-4cdd-b2b8-5d2225ef700b', 'R37 - Puente grua3TN - Nave 3 Sur', 'SL1', 1, '2026-05-22 00:08:04', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a7076ed2-6a9f-490c-b246-229a5bf46df8', 'SEC02 - Secador Sullair', 'SL1', 1, '2026-05-22 00:08:09', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ebfbc04f-8f8f-4a5a-afbe-c6ad1fa650b3', 'R45 - Puente grua Jaso 5TN - Nave 3 Norte', 'SL1', 1, '2026-05-22 00:08:05', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a5de05f9-9075-42de-a9af-f1de9a6c5cd3', 'SA02 - Autoelevador alq. Michigan', 'SL1', 1, '2026-05-22 00:08:06', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('648ce8f8-858d-4d52-9e2f-8b227d7204a5', 'S16 - Autoelevador Liugong 2.5 TN', 'SL1', 1, '2026-05-22 00:08:06', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b7df1f78-b3c8-4d72-996f-bb2ac0f531a2', 'TEJ01 - Tejedora Bergandi F500', 'SL1', 1, '2026-05-22 00:08:01', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b241fff3-3d14-428e-adb4-c845d596a7d6', 'TEJ03 - Tejedora Servet generico', 'SL1', 1, '2026-05-22 00:08:02', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('32affda4-de7c-4372-a81d-75d824de0a78', 'TEJ04 - Tejedora Vitari MG1', 'SL1', 1, '2026-05-22 00:08:02', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('cb269c4f-f510-4012-b887-527d1615a4c2', 'TEJ05 - Tejedora Servet generico', 'SL1', 1, '2026-05-22 00:08:02', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a3e680e8-e7e0-48b0-a338-1bddadb8f8f5', 'TEJ06 - Tejedora Vitari MG2', 'SL1', 1, '2026-05-22 00:08:02', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c49a10bc-2f35-4762-83e5-98dc76809a65', 'TEJ07 - Tejedora Servet generico', 'SL1', 1, '2026-05-22 00:08:03', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('067c2167-2345-4c6a-933f-a65ad60d233c', 'TEJ09 - Tejedora Servet generico', 'SL1', 1, '2026-05-22 00:08:03', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('6adcf5b8-a54e-4be6-b61d-9bc19bae34b0', 'M06 - Conformadora 1 1/2" / 2mm con soldadora Termathool 100 KW', 'SL2', 1, '2026-05-22 00:07:59', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('84e15b0a-d80c-4079-9812-3c124dfab6e9', 'P05 - Compresor CSB tornillo 8 BAR Ceccato', 'SL2', 1, '2026-05-22 00:07:58', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('68b45611-6062-43a4-a21a-1516ede099eb', 'R39 - Puente grua FORVIS 5TN', 'SL1', 1, '2026-05-22 00:08:04', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2a640cd8-294d-442e-811c-fd48a2d21486', 'P12 - Compresor de aire FMT', 'SL1', 1, '2026-05-22 00:08:07', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ae7c4f75-e75b-4d37-a87e-18a3b8cf4eff', 'R43 - Puente grua Jaso 5TN', 'SL1', 1, '2026-05-22 00:08:05', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a7dc4f46-4022-4746-ade6-35f68370b64b', 'S14 - Autoelevador Xinchai 3TN', 'SL1', 1, '2026-05-22 00:08:06', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('726112e9-f3f3-43d7-a4bc-5795e82204d6', 'Q03 - Guillotina de chapas sinusoidal', 'SL1', 1, '2026-05-22 00:08:07', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('81e318e8-d3fd-4dbd-a5ee-3d64f31e36f2', 'Q07 - Guillotina de chapas trapesoidal', 'SL1', 1, '2026-05-22 00:08:07', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('630a21ad-c0d7-4af2-b35b-279aeca199aa', 'TR01 - Trefiladora Eurolls 3P', 'PY', 1, '2026-05-22 00:08:16', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0861ff35-a32d-4b99-9385-8ef5996892ea', 'TR05 - Trefiladora Druids 11P', 'PY', 1, '2026-05-22 00:08:16', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('080f7e0a-a08c-4908-ba2b-680e0cb747c3', 'TEJ10 - Tejedora Servet', 'PY', 1, '2026-05-22 00:08:16', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('09365d66-72be-4507-93eb-88b5a38fa33b', 'TEJ11 - Tejedora Servet', 'PY', 1, '2026-05-22 00:08:16', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5540bcc7-d7be-4d24-855e-3f2c80aedf64', 'H05 - Schnell Reta 12', 'PY', 1, '2026-05-22 00:08:16', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('588e8335-307d-49c0-944c-ec903f5a76b0', 'SR23 - Maquina procesado alambre pua', 'PY', 1, '2026-05-22 00:08:17', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('cbb76153-d5c2-4356-ba4d-d290e229297c', 'SR24 - Maquina procesado alambre pua', 'PY', 1, '2026-05-22 00:08:17', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('dba46c4b-88a7-4093-9f74-a4b33a7f8a59', 'SR25 - Maquina procesado alambre pua', 'PY', 1, '2026-05-22 00:08:17', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('49b169e2-3293-4f3f-bb06-1ff09fa39be1', 'SR26 - Procesado alambre pua', 'PY', 1, '2026-05-22 00:08:17', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7b5f93d9-ef47-4398-944a-9b5992c55bb0', 'CLA01 - Clavos Wafios N41', 'PY', 1, '2026-05-22 00:08:17', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('eab8db89-ca3f-4a35-8a27-c48ec2eb2646', 'PU01 - Pulidora Wafios PT1', 'PY', 1, '2026-05-22 00:08:17', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('e615a06e-d863-49b4-a97e-9f5411cfb48a', 'EM01 - Empaquetadora Xingfei', 'PY', 1, '2026-05-22 00:08:18', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b274026e-423b-4ae5-b936-d7b19e756aaa', 'P13 - Compresor a tornillo EMAX', 'PY', 1, '2026-05-22 00:08:18', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('847a9fcc-826d-43a8-b9e7-4b8cc39c8a45', 'S13 - Autoelevador Hangcha', 'PY', 1, '2026-05-22 00:08:18', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('53b47dc3-8f7d-46bd-9bd8-c0de43d4d94d', 'SEC03 - Secador EMAX', 'PY', 1, '2026-05-22 00:08:18', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('923d43fb-a363-48e4-a149-0295521f6661', 'RT01 - Rectificadora WAFIOS MsE500', 'PY', 1, '2026-05-22 00:08:18', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1cb0936e-02f9-401b-ac5f-9259037c2a54', 'DRUIDS02 - Linea galvanizado Druids', 'PY', 1, '2026-05-22 00:08:19', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('08b04812-07b3-44b3-943e-0980672fd601', 'R24 - Puente grua 6,3TN', 'PY', 1, '2026-05-22 00:08:19', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('08a4db8d-b707-4742-88de-4492a2ebe5f9', 'FUS01 - Camion Fuso 8TN', 'PY', 1, '2026-05-22 00:08:19', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('60898664-16d3-4ec5-ae99-e12ee94cf377', 'T04 - Grupo electrogeno', 'PY', 1, '2026-05-22 00:08:19', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5dd08c1d-919c-4e3c-b213-b8337f322b19', 'PUL08 - Pulmon de aire', 'PY', 1, '2026-05-22 00:08:19', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('bf1b4adc-69f3-4c0b-9426-722048fda92b', 'R50 - Puente grua 6 TN', 'RIV', 1, '2026-05-22 00:08:20', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('85a0927d-84fc-4636-bc14-988fd2ca7280', 'R51 - Puente grua 8 TN', 'RIV', 1, '2026-05-22 00:08:20', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0f8180e1-1517-479a-8643-f2791552ff21', 'P11 - Compresor', 'RIV', 1, '2026-05-22 00:08:20', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('439e5ef0-f716-4e9f-bf50-6f625c013fa4', 'Q05 - Guillotina de chapas sinusoidal', 'RIV', 1, '2026-05-22 00:08:20', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0725e1a2-8ac2-4cde-8b49-bf228a8b9915', 'S12 - Autoelevador 2.5TN', 'RIV', 1, '2026-05-22 00:08:20', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c27222d8-9e03-4af8-acf4-0720377059dc', 'XB2 - Balanza amarilla 5TN - AHS-l', 'RIV', 1, '2026-05-22 00:08:21', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('73af80e6-cc2f-4dcb-a512-61529aa486e9', 'X56 - Balanza 5TN Hanito', 'RIV', 1, '2026-05-22 00:08:21', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1f7de5d3-a5a3-4de3-b568-15da6b280519', 'X31 - Balanza de gancho AHS-II - 5TN', 'RAM', 1, '2026-05-22 00:08:25', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0ceb62d0-469e-4e43-b6c7-1ec4b8d9269f', 'X32 - Balanza piso desarrollo - 5TN - Datta', 'RAM', 1, '2026-05-22 00:08:25', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('27017e63-e48f-435a-8cfc-e80d60fe11c5', 'X33 - Balanza de gancho AHS-DIN - 5TN', 'RAM', 1, '2026-05-22 00:08:25', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1694fcb8-db79-4c9f-8716-6aa7cca6b361', 'X34 - Balanza de gancho AHS-I - 4,75TN', 'RAM', 1, '2026-05-22 00:08:25', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f9b1f740-d7b3-48a8-9d8d-ced32bfc274d', 'X35 - Balanza de gancho AHS-I - 4,75TN', 'RAM', 1, '2026-05-22 00:08:26', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b072ad03-5737-4e33-9561-a24880373eeb', 'X36 - Balanza de gancho AHS-I - 4,75TN', 'RAM', 1, '2026-05-22 00:08:26', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8012cd64-1266-4db8-86b0-7cc804b395bd', 'X37 - Balanza de gancho AHS-II - 4,75TN', 'RAM', 1, '2026-05-22 00:08:26', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('87a53447-309f-4627-99f1-805cb18fc207', 'HD01 - Hidrolavadora', 'RAM', 1, '2026-05-22 00:08:26', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('388f601d-ccf6-4cbd-a2d0-86780eac59f3', 'HD02 - Hidrolavadora Avenjex', 'RAM', 1, '2026-05-22 00:08:26', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('dd1226a6-3e41-4b52-933c-8cff22a87f19', 'PUL01 - Pulmon', 'RAM', 1, '2026-05-22 00:08:26', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('eff83b22-d26a-48b6-8860-bdf8b62580c9', 'PUL02 - Pulmon', 'RAM', 1, '2026-05-22 00:08:27', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('bd6cdef2-4b71-4280-af07-e7c80e851edd', 'PUL03 - Pulmon', 'RAM', 1, '2026-05-22 00:08:27', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('92e000fd-13f6-4960-8fc6-ffe0c118d594', 'PUL04 - Pulmon', 'RAM', 1, '2026-05-22 00:08:27', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f2f9253f-1009-40bd-8918-80e5a7cc44f3', 'V01 - Volteador de carretes', 'RAM', 1, '2026-05-22 00:08:28', NULL, NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a8d37fbf-cbb0-4f68-bf91-e19d161d3519', 'Q01 - Cortadora de chapa acanalada', 'CBA', 1, '2026-05-22 00:08:28', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('70e271d7-cc3e-45b5-8a91-689d9c42b10d', 'R08 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:29', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('af0ad1a9-880f-4c5d-9bcb-f1075ea021cb', 'DRUIDS01 - Galvanizadora 8 hilos Druids', 'RAM', 1, '2026-05-22 00:08:24', NULL, '06:00', '18:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('26682f1a-5cae-461f-9b9c-d6b047741e82', 'TR03 - Trefiladora 9 pasos MFL', 'RAM', 1, '2026-05-22 00:08:21', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('902f16f6-5765-4571-b866-e84c11ef9774', 'H06 - Enderezadora Schnell Reta 12', 'RAM', 1, '2026-05-22 00:08:22', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('26b050e6-faff-4c33-9dbd-4b5eed928dcf', 'K08 - Soldadora MIG Kempi 3200', 'RAM', 1, '2026-05-22 00:08:25', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ecff1e7d-d1a2-47e5-96ae-06d78b3fd5b1', 'K17 - Soldadora de trefilado', 'RAM', 1, '2026-05-22 00:08:27', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ea8db383-cb57-40b4-b9ba-7677e5db2a82', 'K18 - Soldadora de alambron en trefilado (pay off)', 'RAM', 1, '2026-05-22 00:08:27', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0e6eb57f-cda6-4e9a-add3-e2caa1227966', 'K19 - Soldadora de galvanizado', 'RAM', 1, '2026-05-22 00:08:28', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d6eb24c5-4876-41aa-931d-6da0e6f06c4b', 'MEP01 - Malladora MEP 48 hilos MRP', 'RAM', 1, '2026-05-22 00:08:22', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('65788a7d-58d9-4aef-81a2-8f2eea98e9ca', 'R25 - Puente grua MSV 5TN', 'RAM', 1, '2026-05-22 00:08:22', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('753d869a-78d2-4de1-9364-40f53667a0c5', 'R26 - Puente grua chino 5TN', 'RAM', 1, '2026-05-22 00:08:22', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('24245947-d18b-42f5-ab7e-7a8812bf9065', 'R27 - Puente grua Jaso 5,2TN', 'RAM', 1, '2026-05-22 00:08:23', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a8d8f0c7-826b-4e11-bdbb-467bfaf1b7db', 'R28 - Puente grua Jaso 3,2TN', 'RAM', 1, '2026-05-22 00:08:23', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('e3a09556-5a0f-40eb-9d50-59cbb396d0e7', 'R29 - Puente grua Jaso 3,2TN - malladora', 'RAM', 1, '2026-05-22 00:08:23', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7d402d89-db7e-4599-bf1a-8d1203e8a9d3', 'REC01 - Horno recocido de alambre Schmitz & Apelt', 'RAM', 1, '2026-05-22 00:08:22', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('49a1e7c6-5005-4342-8f5d-b97bc7e73f08', 'REC02 - Horno recocido de alambre Schmitz & Apelt', 'RAM', 1, '2026-05-22 00:08:22', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('63e2afb9-140b-4fe5-8c38-4ce384afed46', 'S06 - Autoelevador Hangcha', 'RAM', 1, '2026-05-22 00:08:24', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0e954326-aae7-4139-8530-163355daae81', 'S05 - Autoelevador Toyota', 'RAM', 1, '2026-05-22 00:08:24', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1bad05e3-6422-42b5-90f4-bc278e58faec', 'S07 - Autoelevador Maximal', 'RAM', 1, '2026-05-22 00:08:24', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('05bec37e-115b-4317-b78b-30b2729deb12', 'T02 - Grupo electrogeno Bounous 110KVA', 'RAM', 1, '2026-05-22 00:08:24', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b8e4f8b4-56fb-4500-aa1f-60cfbab223d2', 'TR02 - Trefiladora 9 pasos Eurolls', 'RAM', 1, '2026-05-22 00:08:21', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a22cfda2-4df0-46a4-af99-364d290612eb', 'TR04 - Trefiladora 3 pasos MFL', 'RAM', 1, '2026-05-22 00:08:21', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2d1dc59c-cc76-44f4-ba03-8067d3d7a816', 'G08 - Dobladora de hierro WAF', 'PIL', 1, '2026-05-22 00:08:14', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('6c6ac9e4-bc26-46de-a0cb-e63456e2f7d2', 'G10 - Dobladora de columnas neumatica', 'PIL', 1, '2026-05-22 00:08:14', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d1ad372d-3851-4857-b333-658d277089c3', 'Q04 - Guillotina sinusoidal', 'PIL', 1, '2026-05-22 00:08:13', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('585003c7-6d4a-401c-9614-b844aed03a20', 'Q06 - Guillotina de chapas trapezoidal', 'PIL', 1, '2026-05-22 00:08:13', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b0b9701d-095d-4194-bfd3-a27064fbcce0', 'R46 - Puente grua Jaso 6,3TN', 'PIL', 1, '2026-05-22 00:08:12', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('15d30875-a714-4e09-b530-282a0e16eeee', 'R48 - Puente grua Jaso 6,3TN', 'PIL', 1, '2026-05-22 00:08:13', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('13fd9723-ad28-45f9-be70-96e031bbf355', 'S11 - Auto elevador Yale 2,5TN', 'PIL', 1, '2026-05-22 00:08:14', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b7fcfc9c-6688-4397-bc09-70122bb374bf', 'R47 - Puente grua Jaso 6,3TN', 'PIL', 1, '2026-05-22 00:08:12', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('96616c53-4b6d-458f-9541-11d5c03cc002', 'T03 - Grupo electrogeno Weg GTA', 'PIL', 1, '2026-05-22 00:08:14', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('74ec8882-1bef-4cc0-a8eb-84d85310d29e', 'X102 - Bascula camiones Gama 80TN', 'PIL', 1, '2026-05-22 00:08:15', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('4abcfba2-be94-4d95-ba1b-af9438da32a0', 'X47 - Balanza Nor1 A&L Integral Trade 5TN', 'PIL', 1, '2026-05-22 00:08:14', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8a4f152b-9d94-4d41-868a-e3c47026068a', 'X49 - Balanza A&L Integral Trade 7,5TN', 'PIL', 1, '2026-05-22 00:08:15', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b38613c0-ce84-4426-acf8-334bd1818e1b', 'X50 - Balanza sur2 A&L Integral Trade 5TN', 'PIL', 1, '2026-05-22 00:08:15', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0f26ebd3-653d-4f64-b361-fbfc5e46e3fe', 'X51 - Balanza de piso Serin EL05B 3TN', 'PIL', 1, '2026-05-22 00:08:15', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('33972a3c-1c64-44f0-9943-b5588531f662', 'R11 - Puente Grúa 8TN', 'CBA', 1, '2026-05-22 00:08:29', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('97c67aa3-1069-4d86-a986-2f0e27b0e371', 'R12 - Puente Grúa 8TN', 'CBA', 1, '2026-05-22 00:08:30', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f187df7a-bb18-4c92-a706-7e5f05698552', 'R13 - Puente Grúa 8TN', 'CBA', 1, '2026-05-22 00:08:30', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('40acbcc1-0b3c-45a0-9fc5-794247b90412', 'R14 - Puente Grúa 8TN', 'CBA', 1, '2026-05-22 00:08:30', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('13975509-dec8-4ad7-becc-6e2340af8768', 'R16 - Puente Grúa 6TN', 'CBA', 1, '2026-05-22 00:08:30', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1d3e4ae9-e38b-4518-898e-c43c6ce493e9', 'R17 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:31', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('86d72bb7-f1aa-4c20-9b46-a4f470163c39', 'R18 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:31', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8a98f5f2-eb7b-441a-825f-d034f4a56cc0', 'R19 - Puente Grúa 6.3TN', 'CBA', 1, '2026-05-22 00:08:31', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('00269707-ab84-4067-bb2d-95acc11b43e7', 'S02 - Autoelevador Yale', 'CBA', 1, '2026-05-22 00:08:31', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('bfb73656-7b55-4fa8-b98a-ee9993e77b4c', 'U01 - Separadora de varillas', 'CBA', 1, '2026-05-22 00:08:32', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('dc7366ca-10b3-4e31-ac51-a8b7d435b9b5', 'X06 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:32', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('404abf57-c998-4ae1-a963-727c2c50194f', 'X08 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:32', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9f004764-81c7-475d-a68c-c1ea43563ee4', 'X09 - Balanza 7,5TN', 'CBA', 1, '2026-05-22 00:08:33', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2dff625a-1d4f-469a-adf8-27388ac9f6d8', 'X10 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:33', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5b10e173-db7e-4a0f-a4a2-5daf02448ffc', 'X11 - Balanza 7,5TN', 'CBA', 1, '2026-05-22 00:08:33', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('3c78adbe-68a6-491c-a264-87e87c51aa5b', 'X13 - Balanza AHS-1 7,5TN', 'CBA', 1, '2026-05-22 00:08:33', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('fa09c137-1bd4-45dc-abdb-15ccfb16cf10', 'X14 - Balanza AHS-2 5TN', 'CBA', 1, '2026-05-22 00:08:34', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2197f858-971d-49b5-b887-92a1ec40a773', 'X15 - Balanza 7,5TN', 'CBA', 1, '2026-05-22 00:08:34', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1eaa2f68-3483-4924-b133-9d13ffb14369', 'X16 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:34', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('27b19420-9246-44af-abef-eda73d512ba7', 'X18 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:34', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b3e5e023-3b0f-40c8-afc2-e63c8e1c35ad', 'XN3S - Balanza hibrida carro 3TN', 'CBA', 1, '2026-05-22 00:08:34', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('334eadad-a265-47db-b48e-bbd5024c820e', 'XN3N - Balanza hibrida carro 3TN', 'CBA', 1, '2026-05-22 00:08:35', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('4ec468c1-7ae9-48e7-a114-c48f637ceb66', 'X21 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:35', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('70e64d85-1080-4f73-b1f0-aca109607dab', 'SR04 - Plegadora neumática', 'CBA', 1, '2026-05-22 00:08:35', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('de38c450-581c-4aee-8863-e5f9b2b65efd', 'XN4S - Balanza Piso 3TN', 'CBA', 1, '2026-05-22 00:08:36', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('781d5433-770e-4500-9c5f-c137ceb77f28', 'K09 - Soldadora MIG ESAB 250', 'CBA', 1, '2026-05-22 00:08:36', 'I+D', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('4998c24d-3df8-456d-a7a7-832cba2aa7a2', 'UR08 - Sierra sin fin', 'CBA', 1, '2026-05-22 00:08:36', 'I+D', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('517fee16-cf64-48ab-8fa7-f6e42aed7c54', 'K14 - Soldadora MIG Tigger', 'CBA', 1, '2026-05-22 00:08:36', 'Mto', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('72c01634-ce39-4f90-b870-de87dc1ebd1c', 'R02 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:36', 'Nave 6', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5def9b7d-e688-4344-acd9-a96791dabb4e', 'P01 - Compresor a tornillo 30HP', 'CBA', 1, '2026-05-22 00:08:37', 'Planta', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('77b2a214-88e7-4460-b43b-0d60ac5bb465', 'P02 - Compresor a pistón 20HP', 'CBA', 1, '2026-05-22 00:08:37', 'Planta', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('197b4432-933e-43e5-beb2-554543cdc6c1', 'P03 - Compresor a tornillo 75HP', 'CBA', 1, '2026-05-22 00:08:37', 'Planta', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('fdc91040-a9db-45c5-bde9-8515cf872f45', 'T01 - Grupo electrógeno Bounous 310 KVA', 'CBA', 1, '2026-05-22 00:08:37', 'Planta', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('cbd40747-0948-4c59-80e2-20f267124434', 'X100 - Bascula 100 TN', 'CBA', 1, '2026-05-22 00:08:37', 'Planta', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('be76d2c8-bd99-4b1f-907d-14c577837f8f', 'A01 - Balancín', 'CBA', 1, '2026-05-22 00:08:38', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('931c4188-4ef2-467b-9141-4927ab871ee7', 'A02 - Balancín', 'CBA', 1, '2026-05-22 00:08:38', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7dd17e1f-3ca1-465a-9f92-8106334d9d4b', 'B03 - Sierra 45º', 'CBA', 1, '2026-05-22 00:08:38', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c3061037-dcf6-405c-960d-8031497530d1', 'C01 - Guillotina varillas', 'CBA', 1, '2026-05-22 00:08:38', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('de2770e7-deac-4ca4-910b-df4ba206f6c7', 'C02 (inactiva) - Guillotina varillas', 'CBA', 1, '2026-05-22 00:08:38', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('736b76e5-846d-4220-8f71-f5deb9332782', 'C03 - Guillotina varillas', 'CBA', 1, '2026-05-22 00:08:39', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('936ee7a1-316f-4180-917c-eeb67c33931e', 'C05 - Guillotina chapas', 'CBA', 1, '2026-05-22 00:08:39', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('840b1397-e6e8-4a44-a7a7-0768ea2ab977', 'E01 - Balancín troquelado acanalado', 'CBA', 1, '2026-05-22 00:08:39', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f72fd845-a85a-41cc-8446-95ead9cbe6d6', 'E02 - Balancín troquelado trapezoidal', 'CBA', 1, '2026-05-22 00:08:39', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f1ce18bf-d3a4-4a9f-82bd-0dd044f8469e', 'F01 - Plegadora chapas', 'CBA', 1, '2026-05-22 00:08:40', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1b92a916-c0f4-4271-a9fa-410b5a9199aa', 'G02 - Dobladoras hierros', 'CBA', 1, '2026-05-22 00:08:40', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1eae7f35-ab7a-4a66-b6cd-7274ff602ffe', 'G03 - Dobladoras hierros', 'CBA', 1, '2026-05-22 00:08:40', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9272800b-d28c-4d66-b34d-10b33ff9e956', 'G04 - Dobladoras hierros', 'CBA', 1, '2026-05-22 00:08:40', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ee84089d-b9f1-4a29-b13a-0ff9d6ba08f2', 'G05 - Dobladoras hierros', 'CBA', 1, '2026-05-22 00:08:41', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('252d00f4-0861-4074-ad99-ef9f7134867c', 'H02 - Schnell Coil estribadora automática', 'CBA', 1, '2026-05-22 00:08:41', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('45b9ba0d-eda8-4a02-b4fd-16380eea85b9', 'H03 - Schnell CM PRO 1600 Pilotera', 'CBA', 1, '2026-05-22 00:08:41', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f2d0bfc4-733c-403e-98e0-e737e3ea2488', 'H04 - Schnell ACU 6 Estribadora automática', 'CBA', 1, '2026-05-22 00:08:41', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c8b81e85-6104-44a4-b2b3-2cac83ecc17e', 'H07 - Schnell Reta 12 Enderezadora', 'CBA', 1, '2026-05-22 00:08:42', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9f02a5fa-a0ad-4b96-8561-0f32419c5a7f', 'J01 - Torcionadora de hierros', 'CBA', 1, '2026-05-22 00:08:42', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c94536aa-8836-4231-98bf-5923f35de3f9', 'K01 - Soldadora MIG Kempi 2500', 'CBA', 1, '2026-05-22 00:08:42', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('db192af9-cfe7-4fee-9fbe-7113b0ee739f', 'K02 - Soldadora MIG Kempi 3200', 'CBA', 1, '2026-05-22 00:08:42', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('47604716-b27c-4d51-81ee-3b5f83cd5838', 'K03 - Soldadora MIG Fenisol 300 (grande)', 'CBA', 1, '2026-05-22 00:08:43', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('56750684-a739-4cdc-acb0-815b5a64bde7', 'K04 - Soldadora MIG Kempi 2500', 'CBA', 1, '2026-05-22 00:08:43', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('aca06525-2395-4c31-87e1-b9c3af13a807', 'K06 - Soldadora MIG Fenisol (chica)', 'CBA', 1, '2026-05-22 00:08:43', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8870fb73-7b57-455a-a7df-e6a50c203f21', 'K07 - Soldadora MIG Kempi 2500', 'CBA', 1, '2026-05-22 00:08:43', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('6fa90f9e-6623-4917-abf3-18707d087678', 'K10 - Soldadora MIG Tauro 450', 'CBA', 1, '2026-05-22 00:08:44', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7a7b879c-7128-4a33-8c67-a4910f5d7b9b', 'K11 - Soldadora MIG Tauro 450', 'CBA', 1, '2026-05-22 00:08:44', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('6a9cd33e-1e08-46f7-ab0d-d6382b5a7a35', 'K16 - Soldadora MIG Kami 4500', 'CBA', 1, '2026-05-22 00:08:44', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('4df6df5e-4f71-4031-aca1-a27fc58f4253', 'PL01 - Planchadora y corte de chapas', 'CBA', 1, '2026-05-22 00:08:44', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d0580a57-0b72-45c7-8fb4-c42df496d426', 'R´01 - Punzonadora de planchuelas', 'CBA', 1, '2026-05-22 00:08:44', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('adb53679-ed20-4b36-b8ba-7150878366c7', 'R03 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:45', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8d688c10-f28b-47be-a190-c0680aac67b6', 'R04 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:45', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('40ec6dd4-006c-4b8a-a8ad-57271bc17b1d', 'R06 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:45', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f085e974-6004-4783-bdbf-e9fd5f404ba9', 'R20 - Puente Grúa 3TN', 'CBA', 1, '2026-05-22 00:08:45', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2d936938-fac5-404b-9cd9-73587506c94f', 'R21 - Puente Grúa 15TN', 'CBA', 1, '2026-05-22 00:08:46', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5b895828-0da6-425a-b343-24e9f9645b9c', 'R22 - Puente Grúa 15TN', 'CBA', 1, '2026-05-22 00:08:46', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ac24cbc5-be3d-4678-a85b-5ca76d46faf3', 'X03 - Balanza 5TN', 'CBA', 1, '2026-05-22 00:08:46', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1cb56f06-2b5f-40f4-aab3-b893f4d4c8a7', 'X04 - Balanza AHS-2 5TN', 'CBA', 1, '2026-05-22 00:08:46', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7bb3b039-407d-498a-8815-b78d108fcbef', 'X05 - Balanza AHS-2 5TN', 'CBA', 1, '2026-05-22 00:08:47', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('fa01ea75-f1ce-4731-b844-66e10dfb837d', 'X24 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:47', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d5bdc2d0-fd01-4bc9-827a-81488b65505a', 'G07 - Dobladora hierro longitudinal 6m', 'CBA', 1, '2026-05-22 00:08:28', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7b20b96f-d8d0-4665-ad67-a4e1d5ee530f', 'Q02 - Cortadora de chapa trapezoidal', 'CBA', 1, '2026-05-22 00:08:28', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8eb684a8-0f20-46e3-a56d-4e6c583cb155', 'R07 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:29', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('392cba65-8755-4b92-9eba-67334c679215', 'R09 - Puente Grúa 8TN', 'CBA', 1, '2026-05-22 00:08:29', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b245df16-927f-42c9-b70d-da2f418b17f3', 'R10 - Puente Grúa 8TN', 'CBA', 1, '2026-05-22 00:08:29', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('25c5949b-c271-42ec-b9ac-be52793ec92a', 'R15 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:30', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('e18cc146-41af-44e0-b318-d564d74b1c8f', 'R23 - Puente Grúa 6.3TN', 'CBA', 1, '2026-05-22 00:08:31', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('75215d9e-9d5b-4fd4-a3a5-22d7c612f7e6', 'X07 - Balanza AHS-1 7,5TN', 'CBA', 1, '2026-05-22 00:08:32', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('bfefd779-38f0-470e-8bf7-d19bd8b25781', 'X12 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:33', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('fd5dd835-5dbe-465a-88c8-c31e11f62203', 'X17 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:34', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0f6fa680-222e-40f8-8155-e66189a5d361', 'X22 - Balanza AHS-1 7,5 TN', 'CBA', 1, '2026-05-22 00:08:35', 'Deposito', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0571fd0a-a5e2-4454-bcc9-ac83804cec60', 'XB01 - Balanza amarilla 5TN - AHS-l', 'CBA', 1, '2026-05-22 00:08:36', 'Mto', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('169fa408-997e-4d2d-9126-002cabf6dae9', 'B01 - Sierra automática Cosen', 'CBA', 1, '2026-05-22 00:08:38', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1d52727f-b3da-4e11-aba6-31e4c5a17b13', 'C04 - Guillotina varillas', 'CBA', 1, '2026-05-22 00:08:39', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9107c1f2-dc51-423d-a4f3-7c09332ab4d2', 'G01 - Dobladoras hierros', 'CBA', 1, '2026-05-22 00:08:40', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8a5ddcce-e639-4e2f-a8ac-fdd0f535b754', 'H01 - Schnell Formula estribadora automática', 'CBA', 1, '2026-05-22 00:08:41', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('936b397b-9b61-43a3-a56c-f1a036910235', 'I01 - Taladro Grande de pie', 'CBA', 1, '2026-05-22 00:08:42', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('a5452397-f026-4250-9dba-a727eba98eb7', 'K05 - Soldadora MIG Kempi 2500', 'CBA', 1, '2026-05-22 00:08:43', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0f5c5658-663c-4e0e-84c9-5f0e5632663d', 'K15 - Soldadora MIG Kami 3500', 'CBA', 1, '2026-05-22 00:08:44', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9541a487-5bb9-4996-93d2-c01a95648df6', 'R05 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:45', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('49cac6b7-c861-4756-a154-7f26afde46f9', 'S04 - Autoelevador Toyota 2.5TN', 'CBA', 1, '2026-05-22 00:08:46', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('c284c61d-2732-45b6-8bf6-a230a215620c', 'X25 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:47', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ec410473-46bc-495f-ae5d-4f82160b3951', 'X57 - Balanza AYLCS 15 TN', 'CBA', 1, '2026-05-22 00:08:47', 'Producción', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7c3aa6e5-02cd-48cc-8d0c-802146b672a5', 'S03 - Autoelevador Hangcha Xinchai', 'CBA', 1, '2026-05-22 00:08:47', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b4076412-4b33-42f8-9308-f6c09954d0e5', 'XSR1 - Balanza AHS-1 5TN', 'CBA', 1, '2026-05-22 00:08:47', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('294496ed-3aa0-4418-a357-d90eb491b16c', 'XSR2 - Balanza fraccionado alambre 50 KG', 'CBA', 1, '2026-05-22 00:08:48', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('699ecef6-611f-4caa-b2e0-e776470c2bb4', 'SR01 - Fraccionadora alambre Angeli', 'CBA', 1, '2026-05-22 00:08:48', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('57aaa733-3d4e-451e-ac26-20c3f54a67c5', 'SR02 - Maquina procesado alambre púa', 'CBA', 1, '2026-05-22 00:08:48', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5847920f-59a7-45b5-bda2-09d2570566b3', 'SR03 - Maquina procesado alambre púa', 'CBA', 1, '2026-05-22 00:08:48', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('318eb57e-185e-4dd4-bf54-6cb326cc8152', 'SR05 - Guillotina varilla mecánica', 'CBA', 1, '2026-05-22 00:08:48', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('4d19cbde-89cf-408e-9fe8-59bf5e9258bc', 'KSR6 - MIG Tauro 250A', 'CBA', 1, '2026-05-22 00:08:49', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('78bdfd6f-4c5e-4052-b50b-1b53857c5005', 'SR07 - Fraccionadora alambre Angeli', 'CBA', 1, '2026-05-22 00:08:49', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8b94a4e0-5058-4a11-be77-b11b4dbc2191', 'SR09 - Fraccionadora alambre trompita', 'CBA', 1, '2026-05-22 00:08:49', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9b7e6969-91eb-4a3a-967e-1fa99bdbd099', 'SR10 - Fraccionadora alambre 2 cabezal', 'CBA', 1, '2026-05-22 00:08:49', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('10a97dde-530a-4d95-8169-5cd5c1641f72', 'SR11 - Fraccionadora alambre trompa G.', 'CBA', 1, '2026-05-22 00:08:49', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7bd90e45-19bd-45d7-8015-a834ea67a3dc', 'SR12 - Fraccionadora alambre trompita', 'CBA', 1, '2026-05-22 00:08:50', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('34981005-76ae-48cb-8919-7690742eea94', 'SR13 - Fraccionadora alambre trompa G.(nueva)', 'CBA', 1, '2026-05-22 00:08:50', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('86b43a51-fef0-42c4-aec6-662b4ea9526c', 'SR14 - Sunchadora de banco fleje PET', 'CBA', 1, '2026-05-22 00:08:50', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9f22200f-ca00-4733-a034-5fc9fdc27d9c', 'SR16 - Conformadora de concertina', 'CBA', 1, '2026-05-22 00:08:50', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9e284828-2363-472f-ad6f-2f89ffcafdfe', 'SR17 - Conformadora de concertina', 'CBA', 1, '2026-05-22 00:08:50', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ccc49ee1-7fcb-422e-9b0f-e2ef5d396853', 'SR18 - Balancín troquelado para concertina', 'CBA', 1, '2026-05-22 00:08:51', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('dd55777a-a464-4020-a6e8-1bd467065783', 'SR19 - Sunchadora de banco fleje PET', 'CBA', 1, '2026-05-22 00:08:51', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d855dc6f-2f07-4819-9907-c2c5886f2391', 'SR21 - Maquina procesado alambre púa', 'CBA', 1, '2026-05-22 00:08:51', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('84873027-c14e-4712-b8f5-7082f09d0ad5', 'SR22 - Maquina procesado alambre púa', 'CBA', 1, '2026-05-22 00:08:51', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2150112d-0601-4fae-b766-60654737711f', 'SR28 - Fraccionadora de alambre trompa de elefante', 'CBA', 1, '2026-05-22 00:08:51', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b567c4c6-f5c9-4b69-b3d7-adfcd4b71c60', 'SR29 - Prensa de rollo de alambre vertical para 300KG', 'CBA', 1, '2026-05-22 00:08:51', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('be7b68cb-b935-4f87-98c2-1fcb4c6c4293', 'SR30 - Prensa de rollo de alambre horizontal para 300KG', 'CBA', 1, '2026-05-22 00:08:52', 'Servet', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('ebf71e8f-e681-4c73-806d-123bde3bd876', 'SG02 - MIG electrodos Cba 350A', 'CBA', 1, '2026-05-22 00:08:52', 'SGV', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('8514a099-cdc0-4c8a-a342-54b35b68c9f6', 'SG04 - Compresor Schull 7,5 HP', 'CBA', 1, '2026-05-22 00:08:52', 'SGV', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('9d224ac8-25b3-4a78-aff9-8a5d75c9f283', 'R01 - Puente Grúa 5TN', 'CBA', 1, '2026-05-22 00:08:52', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d640a033-d947-4642-b57b-a1a1cf34525f', 'UR01 - Sierra circular doble cabezal AL', 'CBA', 1, '2026-05-22 00:08:52', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('339503b4-4d86-4f67-8990-abb3fcee9d7c', 'UR02 - Fresadora soldadura PVC', 'CBA', 1, '2026-05-22 00:08:53', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('e20e230d-8c73-4a42-ad24-7686ab3f0522', 'UR03 - Soldadora termofusión doble cabezal', 'CBA', 1, '2026-05-22 00:08:53', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('7384effd-63b0-46c8-9a4c-0a6d782bd4b3', 'UR04 - Desaguadora', 'CBA', 1, '2026-05-22 00:08:53', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d915dd91-44db-4fbb-8629-0eb9925c7d95', 'UR05 - Fresadora 3 cabezal (copiadora)', 'CBA', 1, '2026-05-22 00:08:53', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b490dd4c-47b5-4183-97f3-a599c06a8647', 'UR07 - Sierra circular doble cabezal PVC', 'CBA', 1, '2026-05-22 00:08:53', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('851e123f-d730-4306-9c5a-830b9a2a5cdc', 'UR09 - Vinculadora neumática Ozgenc', 'CBA', 1, '2026-05-22 00:08:53', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('b0e2a606-d17c-4958-a3c4-308a97e185da', 'UR10 - Sierra de mesa', 'CBA', 1, '2026-05-22 00:08:54', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('6d178372-5f0b-44d5-9480-5bc1bb33ea16', 'UR11 - Junquilladora Elumatec', 'CBA', 1, '2026-05-22 00:08:54', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('cde02654-cf36-4570-94ae-41f74cc1d5e4', 'UR12 - Pulmón neumático', 'CBA', 1, '2026-05-22 00:08:54', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('24495376-e2bc-497e-8053-79ee0af5f2df', 'UR13 - Soldadora PVC doble cabezal Ozgenc', 'CBA', 1, '2026-05-22 00:08:54', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('859401e1-51da-4427-bab1-4587b6a62fe1', 'UR14 - Centro mecanizado y corte perfilería Ozgenc', 'CBA', 1, '2026-05-22 00:08:54', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f64189d5-50dd-455d-822d-7064b38c2b89', 'UR15 - Soldadora PVC 4 cabezales Ozgenc', 'CBA', 1, '2026-05-22 00:08:55', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5929c3ab-a688-45fe-96aa-cc4caa2852f5', 'UR16 - Limpiadora Ozgenc', 'CBA', 1, '2026-05-22 00:08:55', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5d460230-907d-4e9f-9815-5a32bd30ff71', 'UR17 - Junquilladora Ozgenc', 'CBA', 1, '2026-05-22 00:08:55', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('4a221f11-ddcb-469f-8baa-dcf73493f758', 'UR18 - Ingletadora de 10"', 'CBA', 1, '2026-05-22 00:08:55', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1f67041d-0633-4642-93fc-57f1b6983e24', 'UR19 - Ventosa eléctrica de 4 sopapas', 'CBA', 1, '2026-05-22 00:08:55', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('655990df-a644-4b0f-b469-f0a26fb2351d', 'UR20 - Sierra sin fin', 'CBA', 1, '2026-05-22 00:08:56', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('73bfc204-a217-4f44-ad34-fe21926fd939', 'UR21 - Sierra doble cabezal', 'CBA', 1, '2026-05-22 00:08:56', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('3356e8ed-6ff2-4412-81da-b63559879b11', 'XUR01 - Balanza de gancho 5TN', 'CBA', 1, '2026-05-22 00:08:56', 'Urbantek', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('beda3e26-47f0-45e9-ba1d-1bb340ce219b', 'S17 - Autoelevador Goodsense 2.5TN', 'CBA', 1, '2026-05-22 00:08:56', 'S/U', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f93f21b0-dfab-41a4-91a9-55aa0783e6df', 'S15 - Autoelevador Lonking', 'CBA', 1, '2026-05-22 00:08:56', 'S/U', NULL, NULL);
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('6c043233-5317-4db7-b92c-8a2be225d22c', 'FL02 - Flejadora', 'SL2', 1, '2026-05-22 00:07:57', NULL, '06:00', '18:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('2faa8305-c586-4c8b-9b21-a2c1576f0e5f', 'B02 - Sierra manual', 'CBA', 1, '2026-05-22 00:08:32', 'Deposito', '06:00', '14:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('d925ec37-caa2-4265-969e-d372ba00e730', 'M01 - Conformadora Gallega MEP 2" / 2mm Termathool 200KW', 'SL2', 1, '2026-05-22 00:07:58', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('47aa3548-81aa-422a-91ea-a8d4b595e23f', 'M03 - Conformadora de caños', 'SL2', 1, '2026-05-22 00:07:58', NULL, '00:00', '00:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('810d7b3a-4d9f-4c4d-8381-e9d1d214d772', 'R32 - Puente grúa 3TN', 'SL2', 1, '2026-05-22 00:07:56', NULL, '06:00', '22:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('93a40657-1289-4c95-9af6-5c575613409b', 'EM02 - Empaqueradora Feiyu YC-420B', 'SL1', 1, '2026-05-22 00:08:08', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('afa4b300-af04-428c-aa79-350b9dc5d6dc', 'P08 - Compresor Sullair 4509', 'SL1', 1, '2026-05-22 00:08:06', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('3bfb11a5-6909-405d-83cd-030f94846b42', 'TEJ02 - Tejedora Vitari MG3', 'SL1', 1, '2026-05-22 00:08:02', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1b3030f5-4f68-4915-80db-c58ef4f07d48', 'TEJ08 - Tejedora Servet generico', 'SL1', 1, '2026-05-22 00:08:03', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('90efc21f-b726-4c10-ab8e-a4c609fd1d30', 'R42 - Puente grua Jaso 3,2TN - Nave 2 Norte', 'SL1', 1, '2026-05-22 00:08:05', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('5e650369-2180-4807-bd62-83e6fc05ac1e', 'R44 - Puente grua Jaso 3,2TN', 'SL1', 1, '2026-05-22 00:08:05', NULL, '08:00', '17:00');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('068b9081-57ab-4a11-9275-99845f0472d8', 'P04 - Compresor Sullair Energy 5507', 'RAM', 1, '2026-05-22 00:08:23', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('85c5a0fb-16fd-4261-8cc7-ecfd4ab54270', 'R30 - Puente grua Jaso 3,2TN - galvanizado', 'RAM', 1, '2026-05-22 00:08:23', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('1e1139a6-c6c3-402e-8636-f70b5f712632', 'SEC01 - Secador de aire Sullair RD400', 'RAM', 1, '2026-05-22 00:08:24', NULL, '06:00', '23:15');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('f1e6c61e-a30e-4fba-8f86-42016e16e4e2', 'P10 - Compresor Fema Santochi VOL330 5,5HP 330L', 'PIL', 1, '2026-05-22 00:08:13', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('49009f28-f9bb-4eba-9422-a3909d7d45cb', 'R49 - Puente grua Jaso 6,3TN', 'PIL', 1, '2026-05-22 00:08:13', NULL, '07:00', '17:30');
INSERT INTO [machines] ([id], [name], [plant], [is_active], [created_at], [sector], [productive_start], [productive_end]) VALUES ('0da8a70c-0561-4361-b22b-6354b2ffd252', 'X48 - Balanza A&L Integral Trade AHS II Intec 5TN', 'PIL', 1, '2026-05-22 00:08:15', NULL, '07:00', '17:30');
GO

-- Data for shift_configs
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('7', 'PIL', 'Turno Mañana', '06:00', '14:00', '2026-07-27 17:58:35');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('8', 'PIL', 'Turno Tarde', '14:00', '22:00', '2026-07-27 17:58:35');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('9', 'PIL', 'Turno Noche', '22:00', '06:00', '2026-07-27 17:58:35');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('1', 'SL2', 'Turno Mañana', '06:00', '14:00', '2026-07-27 18:03:26');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('3', 'SL2', 'Turno Noche', '22:00', '06:00', '2026-07-27 18:03:26');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('2', 'SL2', 'Turno Tarde', '14:00', '22:00', '2026-07-27 18:03:26');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('4', 'SL1', 'Turno Mañana', '06:00', '14:00', '2026-07-28 18:13:16');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('6', 'SL1', 'Turno Noche', '22:00', '06:00', '2026-07-28 18:13:16');
INSERT INTO [shift_configs] ([id], [plant], [shift_name], [start_time], [end_time], [updated_at]) VALUES ('5', 'SL1', 'Turno Tarde', '14:00', '22:00', '2026-07-28 18:13:16');
GO

