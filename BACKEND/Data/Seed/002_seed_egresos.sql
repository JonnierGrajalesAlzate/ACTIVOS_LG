-- Semilla de egresos mensuales generada desde BD_Activos_LG_1.xlsx (hoja BD)
-- Perfil de egresos por inmueble para los 15 inmuebles de 001_seed_inmuebles.sql.
-- Nota: la tabla egresos_mensuales no tiene columna de fecha: es el perfil de
-- costos mensuales vigente por inmueble, no una serie de tiempo.
SET NOCOUNT ON;
BEGIN TRAN;

-- ============ Servicios publicos ============
INSERT INTO servicios_publicos (numero_contrato, precio) SELECT '5864292', 0 WHERE NOT EXISTS (SELECT 1 FROM servicios_publicos WHERE numero_contrato = '5864292');
INSERT INTO servicios_publicos (numero_contrato, precio) SELECT '279100428', 0 WHERE NOT EXISTS (SELECT 1 FROM servicios_publicos WHERE numero_contrato = '279100428');
INSERT INTO servicios_publicos (numero_contrato, precio) SELECT 'medidor: 279100338', 0 WHERE NOT EXISTS (SELECT 1 FROM servicios_publicos WHERE numero_contrato = 'medidor: 279100338');
INSERT INTO servicios_publicos (numero_contrato, precio) SELECT '4261561', 0 WHERE NOT EXISTS (SELECT 1 FROM servicios_publicos WHERE numero_contrato = '4261561');
INSERT INTO servicios_publicos (numero_contrato, precio) SELECT '4103004', 0 WHERE NOT EXISTS (SELECT 1 FROM servicios_publicos WHERE numero_contrato = '4103004');
INSERT INTO servicios_publicos (numero_contrato, precio) SELECT '11330427', 0 WHERE NOT EXISTS (SELECT 1 FROM servicios_publicos WHERE numero_contrato = '11330427');
INSERT INTO servicios_publicos (numero_contrato, precio) SELECT '11317122', 80000 WHERE NOT EXISTS (SELECT 1 FROM servicios_publicos WHERE numero_contrato = '11317122');

-- ============ Egresos mensuales por inmueble ============

-- ZONA 2 SUR / local 104
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '104'), '5864292', 1002366.25, 395730.12,
  1423718.71, 0, 4009.465, 395608.48,
  194538.77, 77409.28, 3565309.51, 11916545.49, 0.0074
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '104') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '104'));

-- SAN NICOLAS ETAPA II / local 121
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA II' AND i.numero_local = '121'), '279100428', 1529826.97, 300313.43,
  1138313.78, 0, 6119.3079, NULL,
  105648.99, 54759.07, 3192835.01, 7758978.99, 0.005
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA II' AND i.numero_local = '121') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA II' AND i.numero_local = '121'));

-- SAN NICOLAS ETAPA I / local 125
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA I' AND i.numero_local = '125'), NULL, 1784221.83, 0,
  2270714.1, 0, 7136.8873, NULL,
  180116.65, 93356.5, 4425808.63, 14245491.76, 0.0079
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA I' AND i.numero_local = '125') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA I' AND i.numero_local = '125'));

-- SAN NICOLAS ETAPA III / local 1269
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA III' AND i.numero_local = '1269'), 'medidor: 279100338', 1512210.12, 412033.42,
  1561779.36, 0, 6048.8405, NULL,
  161482.4, 83698.16, 3815325.56, 12924306.44, 0.0059
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA III' AND i.numero_local = '1269') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN NICOLAS ETAPA III' AND i.numero_local = '1269'));

-- MILLA DE ORO / local 307
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'MILLA DE ORO' AND i.numero_local = '307'), NULL, 432999.67, 278334.43,
  605074.85, 0, 1731.9987, 247093.82,
  NULL, 45687.78, 1648850.35, 7488705.65, 0.005
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'MILLA DE ORO' AND i.numero_local = '307') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'MILLA DE ORO' AND i.numero_local = '307'));

-- PIAZZA BELLA / local 9904
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'PIAZZA BELLA' AND i.numero_local = '9904'), '4261561', 438100.33, 126516.58,
  455168.84, 0, 1752.4013, NULL,
  NULL, 19213.17, 1064588.46, 2778045.83, 0.0044
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'PIAZZA BELLA' AND i.numero_local = '9904') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'PIAZZA BELLA' AND i.numero_local = '9904'));

-- SAN DIEGO / local 1308
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN DIEGO' AND i.numero_local = '1308'), NULL, 847370, 0,
  710076.09, 0, 3389.48, NULL,
  NULL, 34176.85, 1627553, 5207816, 0.0034
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN DIEGO' AND i.numero_local = '1308') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAN DIEGO' AND i.numero_local = '1308'));

-- SAO PAULO PLAZA / local 101
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAO PAULO PLAZA' AND i.numero_local = '101'), NULL, 355998.33, 131493.86,
  473075.6, 0, 1423.9933, NULL,
  36190.26, 29277.78, 1050819.8, 4804735.84, 0.0057
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAO PAULO PLAZA' AND i.numero_local = '101') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'SAO PAULO PLAZA' AND i.numero_local = '101'));

-- C.CIAL PUNTO CLAVE / local 116
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL PUNTO CLAVE' AND i.numero_local = '116'), '4103004', 272763.33, 67967.88,
  195310, 0, 1091.0533, 21397.41,
  6789.32, 13969.89, 591737.16, 2202240.84, 0.0072
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL PUNTO CLAVE' AND i.numero_local = '116') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL PUNTO CLAVE' AND i.numero_local = '116'));

-- C.CIAL AVENTURA / local 306
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL AVENTURA' AND i.numero_local = '306'), NULL, 9836297, 0,
  3943711.13, 0, 39345.188, 1894343.88,
  NULL, 168022.62, 16065760.45, 17538762.55, 0.0024
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL AVENTURA' AND i.numero_local = '306') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL AVENTURA' AND i.numero_local = '306'));

-- ZONA 2 SUR / local 111
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '111'), '11330427', 643417.5, 283707.13,
  1020693.45, 0, 2573.67, 268986.9,
  132273.15, 57642.88, 2460535.38, 9068039.62, 0.0082
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '111') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '111'));

-- ZONA 2 SUR / local 97105
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '97105'), NULL, 5178.75, 2926.11,
  7251.65, 127222, 849.603, 4811.42,
  2366, 0, 231073.71, -231073.71, -0.0117
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '97105') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'ZONA 2 SUR' AND i.numero_local = '97105'));

-- VEGAS 10 / local 7-304
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'VEGAS 10' AND i.numero_local = '7-304'), NULL, 34978.33, 0,
  0, 164722, 1118.8013, NULL,
  NULL, 0, 281478.02, -281478.02, -0.0009
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'VEGAS 10' AND i.numero_local = '7-304') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'VEGAS 10' AND i.numero_local = '7-304'));

-- MAYORCA / local 1031
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'MAYORCA' AND i.numero_local = '1031'), NULL, 90534.33, 0,
  0, 149592, 1280.5053, NULL,
  NULL, 0, 322005.21, -322005.21, -0.004
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'MAYORCA' AND i.numero_local = '1031') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'MAYORCA' AND i.numero_local = '1031'));

-- C.CIAL AVENTURA / local 334
INSERT INTO egresos_mensuales (id_inmueble, numero_contrato_servicio, predial_mensual, seguro_arriendo,
  comision_administracion_inmobiliaria, cam_vacante, gravamen_movimientos_financieros, comision_fiduciaria,
  reembolsos_terceros, mantenimiento_menor, total_egresos, ebitda, rentabilidad_cap_rate)
SELECT (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL AVENTURA' AND i.numero_local = '334'), '11317122', 544447.5, 0,
  342059.78, 1792107, 9666.218, 186510.03,
  NULL, 0, 2970992.27, -370604.69, -0.0005
WHERE (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL AVENTURA' AND i.numero_local = '334') IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM egresos_mensuales WHERE id_inmueble = (SELECT TOP 1 i.id FROM inmueble i JOIN proyecto p ON p.id = i.id_proyecto WHERE p.nombre = 'C.CIAL AVENTURA' AND i.numero_local = '334'));

COMMIT;
SET NOCOUNT OFF;
