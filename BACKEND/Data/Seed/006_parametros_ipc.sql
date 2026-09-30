-- Parametros de negocio (IPC anual) + historial de incrementos de canon aplicados.
-- El IPC se crea VACIO a proposito: debe configurarse desde la aplicacion con la cifra oficial del DANE.
-- Idempotente.
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('dbo.parametro', 'U') IS NULL
BEGIN
    CREATE TABLE parametro (
        clave VARCHAR(50) NOT NULL CONSTRAINT PK_parametro PRIMARY KEY,
        valor DECIMAL(10, 4) NULL,
        descripcion VARCHAR(200) NULL,
        fecha_actualizacion DATETIME2 NOT NULL CONSTRAINT DF_parametro_fecha DEFAULT SYSUTCDATETIME(),
        actualizado_por VARCHAR(200) NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM parametro WHERE clave = 'IPC_ANUAL')
    INSERT INTO parametro (clave, valor, descripcion) VALUES ('IPC_ANUAL', NULL, 'IPC anual vigente (DANE) usado para el incremento de canon');
GO

IF OBJECT_ID('dbo.historial_incremento_canon', 'U') IS NULL
BEGIN
    CREATE TABLE historial_incremento_canon (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_historial_incremento_canon PRIMARY KEY,
        id_contrato INT NOT NULL CONSTRAINT FK_HISTORIAL_INCREMENTO_CONTRATO REFERENCES contratos_arrendamiento(id),
        fecha_incremento DATE NOT NULL,
        canon_anterior DECIMAL(18, 2) NOT NULL,
        canon_nuevo DECIMAL(18, 2) NOT NULL,
        ipc DECIMAL(10, 4) NOT NULL,
        puntos_adicionales DECIMAL(10, 4) NULL,
        fecha_aplicacion DATETIME2 NOT NULL CONSTRAINT DF_historial_incremento_fecha DEFAULT SYSUTCDATETIME(),
        aplicado_por VARCHAR(200) NULL
    );
    CREATE INDEX IX_HISTORIAL_INCREMENTO_CONTRATO ON historial_incremento_canon(id_contrato);
END
GO
