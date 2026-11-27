-- =========================================================
-- Base de datos de la tienda (Actividades 5 y 6)
-- Se puede ejecutar varias veces: no borra nada que ya exista.
-- =========================================================

CREATE DATABASE IF NOT EXISTS tienda;
USE tienda;

-- ---------------------------------------------------------
-- Tabla de productos (la que ya usaba la API)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  precio DECIMAL(10,2) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  categoria ENUM('Base','Labial','Pestañas','Corrector','Rubor','Gloss','Polvos') NOT NULL,
  stock INT NOT NULL,
  marca VARCHAR(50) NOT NULL,
  tono VARCHAR(50) DEFAULT NULL
);

-- Productos de ejemplo (INSERT IGNORE: si el id ya existe, no lo repite)
INSERT IGNORE INTO productos (id, precio, nombre, categoria, stock, marca, tono) VALUES
  (1, 25000, 'Base liquida Matte de lujo',  'Base',     20, 'Engol',   '2'),
  (2, 16000, 'Pintalabios mate Jenson',     'Labial',   10, 'Pudaier', 'nude natural'),
  (3, 18000, 'Pestañina vaquera',           'Pestañas', 15, 'Trendy',  NULL),
  (4, 10900, 'Polvo compacto rosas carite', 'Polvos',   13, 'Karite',  NULL),
  (5, 29000, 'Rubor duo mia',               'Rubor',    11, 'Trendy',  'Rosado');

-- ---------------------------------------------------------
-- Tabla nueva: usuarios (Actividad 5)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

-- password guarda el HASH, nunca la clave:
--   await bcrypt.hash(password, 10)
-- Por eso los usuarios se crean con POST /registro, no aqui.
--
-- Para volver admin a un usuario ya registrado:
--   UPDATE usuarios SET rol = 'admin' WHERE email = 'admin@tienda.com';
