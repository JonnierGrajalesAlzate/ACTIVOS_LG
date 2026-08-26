-- Semilla generada desde BD_Activos_LG_1.xlsx (hoja BD)
-- 15 inmuebles reales + catalogos, contrapartes y contratos asociados.
SET NOCOUNT ON;
BEGIN TRAN;

-- ============ Catalogos ============
INSERT INTO proyecto (nombre) SELECT 'ZONA 2 SUR' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'ZONA 2 SUR');
INSERT INTO proyecto (nombre) SELECT 'SAN NICOLAS ETAPA II' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'SAN NICOLAS ETAPA II');
INSERT INTO proyecto (nombre) SELECT 'SAN NICOLAS ETAPA I' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'SAN NICOLAS ETAPA I');
INSERT INTO proyecto (nombre) SELECT 'SAN NICOLAS ETAPA III' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'SAN NICOLAS ETAPA III');
INSERT INTO proyecto (nombre) SELECT 'MILLA DE ORO' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'MILLA DE ORO');
INSERT INTO proyecto (nombre) SELECT 'PIAZZA BELLA' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'PIAZZA BELLA');
INSERT INTO proyecto (nombre) SELECT 'SAN DIEGO' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'SAN DIEGO');
INSERT INTO proyecto (nombre) SELECT 'SAO PAULO PLAZA' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'SAO PAULO PLAZA');
INSERT INTO proyecto (nombre) SELECT 'C.CIAL PUNTO CLAVE' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'C.CIAL PUNTO CLAVE');
INSERT INTO proyecto (nombre) SELECT 'C.CIAL AVENTURA' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'C.CIAL AVENTURA');
INSERT INTO proyecto (nombre) SELECT 'VEGAS 10' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'VEGAS 10');
INSERT INTO proyecto (nombre) SELECT 'MAYORCA' WHERE NOT EXISTS (SELECT 1 FROM proyecto WHERE nombre = 'MAYORCA');
INSERT INTO estado (descripcion) SELECT 'Arrendado' WHERE NOT EXISTS (SELECT 1 FROM estado WHERE descripcion = 'Arrendado');
INSERT INTO estado (descripcion) SELECT 'Disponible' WHERE NOT EXISTS (SELECT 1 FROM estado WHERE descripcion = 'Disponible');
INSERT INTO destinacion (descripcion) SELECT 'Arriendo' WHERE NOT EXISTS (SELECT 1 FROM destinacion WHERE descripcion = 'Arriendo');
INSERT INTO destinacion (descripcion) SELECT 'Arriendo/Venta' WHERE NOT EXISTS (SELECT 1 FROM destinacion WHERE descripcion = 'Arriendo/Venta');
INSERT INTO destinacion (descripcion) SELECT 'Venta' WHERE NOT EXISTS (SELECT 1 FROM destinacion WHERE descripcion = 'Venta');
INSERT INTO tipo_inmueble (descripcion) SELECT 'Local' WHERE NOT EXISTS (SELECT 1 FROM tipo_inmueble WHERE descripcion = 'Local');
INSERT INTO tipo_inmueble (descripcion) SELECT 'Util' WHERE NOT EXISTS (SELECT 1 FROM tipo_inmueble WHERE descripcion = 'Util');
INSERT INTO tipo_local (descripcion) SELECT 'Comercio' WHERE NOT EXISTS (SELECT 1 FROM tipo_local WHERE descripcion = 'Comercio');
INSERT INTO tipo_local (descripcion) SELECT 'Banco' WHERE NOT EXISTS (SELECT 1 FROM tipo_local WHERE descripcion = 'Banco');
INSERT INTO tipo_local (descripcion) SELECT 'Arriendo' WHERE NOT EXISTS (SELECT 1 FROM tipo_local WHERE descripcion = 'Arriendo');
INSERT INTO tipo_local (descripcion) SELECT 'Comida' WHERE NOT EXISTS (SELECT 1 FROM tipo_local WHERE descripcion = 'Comida');
INSERT INTO tipo_local (descripcion) SELECT 'Servicios' WHERE NOT EXISTS (SELECT 1 FROM tipo_local WHERE descripcion = 'Servicios');
INSERT INTO tipo_local (descripcion) SELECT 'Utiles' WHERE NOT EXISTS (SELECT 1 FROM tipo_local WHERE descripcion = 'Utiles');
INSERT INTO seguro (nombre) SELECT 'El Libertador' WHERE NOT EXISTS (SELECT 1 FROM seguro WHERE nombre = 'El Libertador');
INSERT INTO seguro (nombre) SELECT 'Unifianza' WHERE NOT EXISTS (SELECT 1 FROM seguro WHERE nombre = 'Unifianza');
INSERT INTO seguro (nombre) SELECT 'Sura' WHERE NOT EXISTS (SELECT 1 FROM seguro WHERE nombre = 'Sura');
INSERT INTO categoria_marca (nombre) SELECT 'Muebles' WHERE NOT EXISTS (SELECT 1 FROM categoria_marca WHERE nombre = 'Muebles');
INSERT INTO categoria_marca (nombre) SELECT 'Librería' WHERE NOT EXISTS (SELECT 1 FROM categoria_marca WHERE nombre = 'Librería');
INSERT INTO categoria_marca (nombre) SELECT 'RESTAURANTE' WHERE NOT EXISTS (SELECT 1 FROM categoria_marca WHERE nombre = 'RESTAURANTE');
INSERT INTO categoria_marca (nombre) SELECT 'Belleza' WHERE NOT EXISTS (SELECT 1 FROM categoria_marca WHERE nombre = 'Belleza');

-- ============ Contrapartes ============
INSERT INTO arrendador (nit, nombre) SELECT '900104137', 'FIDEICOMISO PROYECTO TRANSERVALES' WHERE NOT EXISTS (SELECT 1 FROM arrendador WHERE nit = '900104137');
INSERT INTO arrendador (nit, nombre) SELECT '900152062', 'INMOBILIARIA SAN NICOLAS' WHERE NOT EXISTS (SELECT 1 FROM arrendador WHERE nit = '900152062');
INSERT INTO arrendador (nit, nombre) SELECT '900477623', 'FIDEICOMISO LOCALES MILLA (Alianza)' WHERE NOT EXISTS (SELECT 1 FROM arrendador WHERE nit = '900477623');
INSERT INTO arrendador (nit, nombre) SELECT '890912140', 'LONDOÑO GOMEZ S.A.S.' WHERE NOT EXISTS (SELECT 1 FROM arrendador WHERE nit = '890912140');
INSERT INTO arrendador (nit, nombre) SELECT '811033602', 'POBLADO VERDE' WHERE NOT EXISTS (SELECT 1 FROM arrendador WHERE nit = '811033602');
INSERT INTO arrendador (nit, nombre) SELECT '811035478', 'FIDEICOMISO PUNTO CLAVE (Alianza)' WHERE NOT EXISTS (SELECT 1 FROM arrendador WHERE nit = '811035478');
INSERT INTO arrendador (nit, nombre) SELECT '830054539', 'P.A. FP AVENTURA' WHERE NOT EXISTS (SELECT 1 FROM arrendador WHERE nit = '830054539');
INSERT INTO arrendatario (nit, nombre) SELECT '811031009', 'CRYSTAL S.A.S.' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '811031009');
INSERT INTO arrendatario (nit, nombre) SELECT '860034594', 'BANCO DAVIBANK S.A.' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '860034594');
INSERT INTO arrendatario (nit, nombre) SELECT '800037800', 'BANCO AGRARIO DE COLOMBIA S.A.' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '800037800');
INSERT INTO arrendatario (nit, nombre) SELECT '900365205', 'PROSALON DISTRIBUCIONES SAS' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '900365205');
INSERT INTO arrendatario (nit, nombre) SELECT '901030708', 'ALIMENTO CONSCIENTE S.A.S.' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '901030708');
INSERT INTO arrendatario (nit, nombre) SELECT '80197736', 'DAVID SANTAMARIA MAJON' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '80197736');
INSERT INTO arrendatario (nit, nombre) SELECT '900250169', 'LEXUS COLOMBIANA S.A.S' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '900250169');
INSERT INTO arrendatario (nit, nombre) SELECT '900856751', 'INVERSIONES OLIVENZA S.A.S.' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '900856751');
INSERT INTO arrendatario (nit, nombre) SELECT '43073745', 'LUZ STELLA  GIL HERRERA' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '43073745');
INSERT INTO arrendatario (nit, nombre) SELECT '890900943', 'COLOMBIANA DE COMERCIO S.A.' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '890900943');
INSERT INTO arrendatario (nit, nombre) SELECT '890922113', 'DROPOPULAR SA' WHERE NOT EXISTS (SELECT 1 FROM arrendatario WHERE nit = '890922113');

-- ============ Marcas ============
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT NULL, 'PUNTO BLANCO', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'PUNTO BLANCO');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT NULL, 'Banco Colpatria', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Banco Colpatria');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT NULL, 'Banco Agrario', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Banco Agrario');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT NULL, 'Cromantic', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Cromantic');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT NULL, 'NATTO BOWLS', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'NATTO BOWLS');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT (SELECT TOP 1 id FROM categoria_marca WHERE nombre = 'Muebles'), 'VALE MOBILIARIO', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'VALE MOBILIARIO');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT (SELECT TOP 1 id FROM categoria_marca WHERE nombre = 'Librería'), 'Lexus Kids Librería', 'REGIONAL' WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Lexus Kids Librería');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT (SELECT TOP 1 id FROM categoria_marca WHERE nombre = 'RESTAURANTE'), 'OLIVENZA', 'REGIONAL' WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'OLIVENZA');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT (SELECT TOP 1 id FROM categoria_marca WHERE nombre = 'Belleza'), 'Peluqueria', 'regional' WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'Peluqueria');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT NULL, 'ALKOMPAR', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'ALKOMPAR');
INSERT INTO marca (id_categoria, nombre, clasificacion) SELECT NULL, 'DROPOPULAR', NULL WHERE NOT EXISTS (SELECT 1 FROM marca WHERE nombre = 'DROPOPULAR');

-- ============ Inmuebles + contratos ============

-- [1] ZONA 2 SUR / local 104 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'ZONA 2 SUR'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '1026190', '104', 0,
  91.16, 17780149.9456, 1620838469.0423,
  801893000, 0.015, 12028395,
  2.4779, NULL, 47386,
  0.4947, 'Carrera 32 No. 2 Sur 33 | Medellin'
);
DECLARE @inm0 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm0, (SELECT TOP 1 id FROM seguro WHERE nombre = 'El Libertador'), (SELECT TOP 1 id FROM marca WHERE nombre = 'PUNTO BLANCO'), '900104137', '811031009',
  '2011-03-01', 5,
  '2016-02-28', '2027-02-28', '2027-03-01',
  15481855, 169831.6696, 0.0096,
  'N', 'IPC', 0.0174
);

-- [2] SAN NICOLAS ETAPA II / local 121 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'SAN NICOLAS ETAPA II'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Banco'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '75213', '121', 1,
  78.26, 19637402.5649, 1536823124.7318,
  1394979000, 0.014, 18357923.64,
  0.4577, NULL, 63253,
  0.9077, 'calle 43 no. 54-139 | Rionegro'
);
DECLARE @inm1 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm1, (SELECT TOP 1 id FROM seguro WHERE nombre = 'Unifianza'), (SELECT TOP 1 id FROM marca WHERE nombre = 'Banco Colpatria'), '900152062', '860034594',
  '2011-01-01', 5,
  '2015-12-31', '2026-12-31', '2027-01-01',
  10951814, 139941.4005, 0.0071,
  'N', 'IPC', 0.0167
);

-- [3] SAN NICOLAS ETAPA I / local 125 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'SAN NICOLAS ETAPA I'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Banco'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '75217', '125', 1,
  84.94, 21208394.7701, 1801441051.7748,
  1626950000, 0.014, 21410662,
  0.4865, NULL, 72582,
  0.9031, 'calle 43 no. 54-139 | Rionegro'
);
DECLARE @inm2 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm2, NULL, (SELECT TOP 1 id FROM marca WHERE nombre = 'Banco Agrario'), '900152062', '800037800',
  NULL, 5,
  NULL, '2027-01-09', '2027-01-10',
  18671300.3847, 219817.5228, 0.0104,
  'N', 'IPC', 0
);

-- [4] SAN NICOLAS ETAPA III / local 1269 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'SAN NICOLAS ETAPA III'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '83467', '1269', 0,
  99.65, 21993890.8727, 2191691225.4672,
  1378915000, 0.014, 18146521.4,
  0.4553, NULL, 47692,
  0.6292, 'calle 43 no. 54-139 | Rionegro'
);
DECLARE @inm3 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm3, (SELECT TOP 1 id FROM seguro WHERE nombre = 'Unifianza'), (SELECT TOP 1 id FROM marca WHERE nombre = 'Cromantic'), '900152062', '900365205',
  '2018-08-01', 5,
  '2023-07-31', '2028-07-31', '2026-08-01',
  16739632, 167984.2649, 0.0076,
  'N', 'IPC', 0.0167
);

-- [5] MILLA DE ORO / local 307 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'MILLA DE ORO'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '1254484', '307', 0,
  71.1, 21029823.5191, 1495220452.2092,
  576677000, 0.015, 5195996,
  0.3637, NULL, 17269,
  0.3857, 'Carrera 42 No. 3 Sur 81 | Medellin'
);
DECLARE @inm4 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm4, (SELECT TOP 1 id FROM seguro WHERE nombre = 'Sura'), (SELECT TOP 1 id FROM marca WHERE nombre = 'NATTO BOWLS'), '900477623', '901030708',
  '2021-12-01', 3,
  '2024-11-30', '2027-11-30', '2026-12-01',
  9137556, 128516.962, 0.0061,
  'N', 'IPC', 0.023
);

-- [6] PIAZZA BELLA / local 9904 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'PIAZZA BELLA'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo/Venta'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '968669', '9904', 0,
  57.49, 10971305.1401, 630740332.507,
  440783000, 0.015, 5257204,
  2.7164, NULL, 46936,
  0.6988, 'carrer 29 d no. 6 a 05 | Medellin'
);
DECLARE @inm5 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm5, (SELECT TOP 1 id FROM seguro WHERE nombre = 'El Libertador'), (SELECT TOP 1 id FROM marca WHERE nombre = 'VALE MOBILIARIO'), '890912140', '80197736',
  '2021-10-01', 1,
  '2022-09-30', '2026-09-30', '2026-10-01',
  3842634.2862, 66840.0467, 0.0061,
  'N', 'IPC', 0.0174
);

-- [7] SAN DIEGO / local 1308 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'SAN DIEGO'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo/Venta'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '001-1023188', '1308', 0,
  36.45, 41584977.2477, 1515772420.678,
  677896000, 0.015, 10168440,
  0.1252, NULL, 55140,
  0.4472, 'Calle 34 No.43-66 | Medellin | 976481285.7142859'
);
DECLARE @inm6 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm6, NULL, (SELECT TOP 1 id FROM marca WHERE nombre = 'Lexus Kids Librería'), '890912140', '900250169',
  '2021-09-01', 2,
  '2023-08-30', '2026-08-31', '2026-09-01',
  6835369, 187527.2702, 0.0045,
  'N', 'IPC', 0
);

-- [8] SAO PAULO PLAZA / local 101 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'SAO PAULO PLAZA'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo/Venta'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comida'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '001-973324', '101', 0,
  26.85, 31154858.4085, 836507948.2677,
  428273000, 0.015, 4271980,
  0.3087, NULL, 21937,
  0.512, 'carrera 43 a 18 sur 135 | Medellin'
);
DECLARE @inm7 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm7, (SELECT TOP 1 id FROM seguro WHERE nombre = 'El Libertador'), (SELECT TOP 1 id FROM marca WHERE nombre = 'OLIVENZA'), '811033602', '900856751',
  '2013-06-01', 1,
  '2014-05-31', '2026-05-31', '2026-06-01',
  5855555.6379, 218084.0089, 0.007,
  'N', 'IPC', 0.0174
);

-- [9] C.CIAL PUNTO CLAVE / local 116 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'C.CIAL PUNTO CLAVE'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Servicios'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '001-880396', '116', 0,
  23.64, 12941881.8997, 305946088.1099,
  249857000, 0.0131, 3273160,
  0.095, NULL, 24592,
  0.8167, 'Calle 27 No. 46-70 | Medellin'
);
DECLARE @inm8 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm8, (SELECT TOP 1 id FROM seguro WHERE nombre = 'El Libertador'), (SELECT TOP 1 id FROM marca WHERE nombre = 'Peluqueria'), '811035478', '43073745',
  '2011-12-01', 3,
  '2014-11-30', '2027-11-30', '2026-12-01',
  2793978, 118188.5787, 0.0091,
  'N', 'IPC', 0.0174
);

-- [10] C.CIAL AVENTURA / local 306 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'C.CIAL AVENTURA'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '01N-5413603', '306', 0,
  747.54, 9744251.2758, 7284217598.7019,
  10420740000, 0.015, 118035564,
  3.8651, NULL, 21871,
  1.4306, 'Carrera 52 No.  65 91 306 | Medellin'
);
DECLARE @inm9 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm9, NULL, (SELECT TOP 1 id FROM marca WHERE nombre = 'ALKOMPAR'), '830054539', '890900943',
  '2016-05-01', 3,
  '2019-04-30', '2027-04-30', '2027-05-01',
  33604523, 44953.4781, 0.0046,
  'N', 'IPC', 0
);

-- [11] ZONA 2 SUR / local 111 (Arrendado)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'ZONA 2 SUR'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Arrendado'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '1007025', '111', 0,
  54, 20408519.9376, 1102060076.6291,
  514734000, 0.015, 7721010,
  1.4843, NULL, 47889,
  0.4671, 'Carrera 32 No. 2 Sur 33 | Medellin'
);
DECLARE @inm10 INT = SCOPE_IDENTITY();
INSERT INTO contratos_arrendamiento (id_inmueble, id_seguro, id_marca, nit_arrendador, nit_arrendatario,
  fecha_contrato, plazo_anios, vto_primera_vigencia, proximo_vencimiento, proximo_incremento,
  canon_actual_mensual, valor_m2_canon, rental_rate, admon_incrementa_canon, tipo_incremento_actual, porcent_seguro)
VALUES (@inm10, (SELECT TOP 1 id FROM seguro WHERE nombre = 'El Libertador'), (SELECT TOP 1 id FROM marca WHERE nombre = 'DROPOPULAR'), '900104137', '890922113',
  '2017-11-01', 2,
  NULL, '2026-10-31', '2026-11-01',
  11528575, 213492.1296, 0.0105,
  'N', 'IPC', 0.0174
);

-- [12] ZONA 2 SUR / local 97105 (Disponible)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'ZONA 2 SUR'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Disponible'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Utiles'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Util'),
  '1007085', '97105', 0,
  8.5, 2319149.9929, 19712774.9397,
  6905000, 0.009, 62145,
  0.0803, NULL, 14967,
  0.3503, 'Carrera 32 No. 2 Sur 33 | Medellin | Fecha de entrega 16 enero 2024'
);
DECLARE @inm11 INT = SCOPE_IDENTITY();

-- [13] VEGAS 10 / local 7-304 (Disponible)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'VEGAS 10'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Disponible'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo/Venta'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '1175284', '7-304', 0,
  4.58, 69342884.7056, 317590411.9516,
  41974000, 0.01, 419740,
  0.455, NULL, 35966,
  0.1322, 'Carrera 48 No. 7-304 | Medellin'
);
DECLARE @inm12 INT = SCOPE_IDENTITY();

-- [14] MAYORCA / local 1031 (Disponible)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'MAYORCA'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Disponible'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Venta'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Utiles'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Util'),
  '1295361', '1031', 0,
  30.74, 2611296.8305, 80271264.5685,
  80475000, 0.0034, 1086412,
  0.011, NULL, 4866,
  1.0025, 'Carrera 48 No. 50 Sur -128 | Sabaneta | Distrución a socios_Escriturado a LG'
);
DECLARE @inm13 INT = SCOPE_IDENTITY();

-- [15] C.CIAL AVENTURA / local 334 (Disponible)
INSERT INTO inmueble (id_proyecto, id_estado, id_destinacion, id_tipo_local, id_tipo_inmueble,
  matricula_inmobiliaria, numero_local, mesanine, area_piso1, valor_m2_construido, valor_comercial,
  avaluo_catastral, tarifa_catastro, predial_anual, coeficiente, area_libre_priv, valor_m2_admon,
  porcent_valor_catastral, observaciones)
VALUES (
  (SELECT TOP 1 id FROM proyecto WHERE nombre = 'C.CIAL AVENTURA'),
  (SELECT TOP 1 id FROM estado WHERE descripcion = 'Disponible'),
  (SELECT TOP 1 id FROM destinacion WHERE descripcion = 'Arriendo/Venta'),
  (SELECT TOP 1 id FROM tipo_local WHERE descripcion = 'Comercio'),
  (SELECT TOP 1 id FROM tipo_inmueble WHERE descripcion = 'Local'),
  '01N-5413613', '334', 0,
  41.4, 17323113.3792, 717176893.8979,
  435558000, 0.015, 6533370,
  0.3404, NULL, 43288,
  0.6073, 'Carrera 52 No.  65 91 | Medellin'
);
DECLARE @inm14 INT = SCOPE_IDENTITY();

COMMIT;
SET NOCOUNT OFF;
