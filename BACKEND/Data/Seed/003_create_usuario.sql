IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'usuario')
BEGIN
    CREATE TABLE usuario (
        id INT IDENTITY(1,1) NOT NULL,
        email VARCHAR(200) NOT NULL,
        password_hash VARCHAR(200) NOT NULL,
        nombre VARCHAR(200) NOT NULL,
        rol VARCHAR(30) NOT NULL CONSTRAINT DF_usuario_rol DEFAULT ('lectura'),
        activo BIT NOT NULL CONSTRAINT DF_usuario_activo DEFAULT (1),
        fecha_creacion DATETIME2 NOT NULL CONSTRAINT DF_usuario_fecha_creacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_usuario PRIMARY KEY (id),
        CONSTRAINT UQ_usuario_email UNIQUE (email)
    );
END
GO

-- Usuario admin inicial. La contrasena en claro NO se guarda aqui, solo su hash (BCrypt).
-- Contrasena temporal entregada una sola vez fuera de este repo: cambiarla despues del primer login.
IF NOT EXISTS (SELECT 1 FROM usuario WHERE email = 'alzatejonny21@gmail.com')
BEGIN
    INSERT INTO usuario (email, password_hash, nombre, rol, activo)
    VALUES (
        'alzatejonny21@gmail.com',
        '$2a$11$6GyDn8uhNg5wmVh8EVuUgOpnKEcBXt7nKWgBKfvG/mAng/CzSaANi',
        'Jonnier Grajales',
        'admin',
        1
    );
END
GO
