-- Propietario (dueño) de cada inmueble: inmueble.nit_propietario -> arrendador(nit).
-- Antes el propietario solo existia en cada contrato (contratos_arrendamiento.nit_arrendador), asi que
-- un inmueble sin contrato no tenia dueño. Se llena con el arrendador del contrato mas reciente.
-- Correr ANTES de desplegar el backend que usa la columna. Idempotente.
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF COL_LENGTH('dbo.inmueble', 'nit_propietario') IS NULL
BEGIN
    ALTER TABLE inmueble ADD nit_propietario VARCHAR(20) NULL
        CONSTRAINT FK_INMUEBLE_PROPIETARIO REFERENCES arrendador(nit);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_INMUEBLE_PROPIETARIO' AND object_id = OBJECT_ID('dbo.inmueble'))
    CREATE INDEX IX_INMUEBLE_PROPIETARIO ON inmueble(nit_propietario);
GO

-- Solo llena los que aun no tienen propietario: volver a correrlo no pisa lo asignado desde la aplicacion.
UPDATE i
SET nit_propietario = ultimo.nit_arrendador
FROM inmueble i
CROSS APPLY (
    SELECT TOP 1 c.nit_arrendador
    FROM contratos_arrendamiento c
    WHERE c.id_inmueble = i.id AND c.nit_arrendador IS NOT NULL
    ORDER BY c.fecha_contrato DESC
) ultimo
WHERE i.nit_propietario IS NULL;
GO
