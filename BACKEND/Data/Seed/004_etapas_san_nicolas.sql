-- Etapas de proyecto + fusion de SAN NICOLAS ETAPA I/II/III en un solo proyecto "SAN NICOLAS".
-- Crea el catalogo `etapa` (cada etapa pertenece a un proyecto) y la columna opcional inmueble.id_etapa.
-- Idempotente: se puede ejecutar mas de una vez sin duplicar datos.
SET NOCOUNT ON;
SET XACT_ABORT ON;

-- ============ Esquema ============
IF OBJECT_ID('dbo.etapa', 'U') IS NULL
BEGIN
    CREATE TABLE etapa (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_etapa PRIMARY KEY,
        id_proyecto INT NOT NULL CONSTRAINT FK_ETAPA_PROYECTO REFERENCES proyecto(id),
        nombre VARCHAR(100) NOT NULL,
        CONSTRAINT UQ_etapa_proyecto_nombre UNIQUE (id_proyecto, nombre)
    );
END
GO

IF COL_LENGTH('dbo.inmueble', 'id_etapa') IS NULL
BEGIN
    ALTER TABLE inmueble ADD id_etapa INT NULL CONSTRAINT FK_INMUEBLE_ETAPA REFERENCES etapa(id);
    CREATE INDEX IX_INMUEBLE_ETAPA ON inmueble(id_etapa);
END
GO

-- ============ Fusion SAN NICOLAS ============
BEGIN TRAN;

-- Mapa proyecto viejo -> etapa, tomado ANTES de renombrar ('SAN NICOLAS ETAPA II' -> 'Etapa II').
DECLARE @mapa TABLE (id_proyecto INT, etapa VARCHAR(100));
INSERT INTO @mapa (id_proyecto, etapa)
SELECT id, 'Etapa ' + LTRIM(SUBSTRING(nombre, LEN('SAN NICOLAS ETAPA') + 2, 10))
FROM proyecto WHERE nombre LIKE 'SAN NICOLAS ETAPA %';

DECLARE @destino INT = (SELECT TOP 1 id FROM proyecto WHERE nombre = 'SAN NICOLAS');
IF @destino IS NULL
BEGIN
    -- Se reutiliza el id del primer proyecto de etapa existente para no crear un id nuevo.
    SET @destino = (SELECT MIN(id_proyecto) FROM @mapa);
    IF @destino IS NULL
    BEGIN
        INSERT INTO proyecto (nombre) VALUES ('SAN NICOLAS');
        SET @destino = SCOPE_IDENTITY();
    END
    ELSE
        UPDATE proyecto SET nombre = 'SAN NICOLAS' WHERE id = @destino;
END

INSERT INTO etapa (id_proyecto, nombre)
SELECT @destino, v.nombre
FROM (VALUES ('Etapa I'), ('Etapa II'), ('Etapa III')) v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM etapa e WHERE e.id_proyecto = @destino AND e.nombre = v.nombre);

UPDATE i
SET i.id_proyecto = @destino,
    i.id_etapa = e.id
FROM inmueble i
JOIN @mapa m ON m.id_proyecto = i.id_proyecto
JOIN etapa e ON e.id_proyecto = @destino AND e.nombre = m.etapa
WHERE i.id_etapa IS NULL OR i.id_proyecto <> @destino;

DELETE FROM proyecto WHERE nombre LIKE 'SAN NICOLAS ETAPA %' AND id <> @destino;

COMMIT;
GO

-- ============ Verificacion ============
SELECT p.id AS id_proyecto, p.nombre AS proyecto, e.nombre AS etapa, i.id AS id_inmueble, i.numero_local, i.matricula_inmobiliaria
FROM inmueble i
JOIN proyecto p ON p.id = i.id_proyecto
LEFT JOIN etapa e ON e.id = i.id_etapa
WHERE p.nombre = 'SAN NICOLAS'
ORDER BY e.nombre, i.numero_local;
