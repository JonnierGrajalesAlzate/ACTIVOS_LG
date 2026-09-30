-- Roles de usuario (columna usuario.rol, ver BACKEND/Endpoints/Roles.cs):
--   admin              -> todo, incluidos proyectos, etapas e IPC.
--   admin_inmobiliario -> administrador inmobiliario: registra, edita y elimina inmuebles, contratos,
--                         egresos, propietarios y arrendatarios, y aplica incrementos de canon.
--   lectura            -> solo consulta (valor por defecto de la columna).
-- No hay pantalla de usuarios todavia: el rol se asigna aqui. La sesion toma el rol nuevo al volver a iniciarla.

-- Revisar los usuarios y su rol actual:
SELECT id, email, nombre, rol, activo FROM usuario ORDER BY email;

-- Asignar el rol de administrador inmobiliario (cambiar el email):
-- UPDATE usuario SET rol = 'admin_inmobiliario' WHERE email = 'correo@empresa.com';
