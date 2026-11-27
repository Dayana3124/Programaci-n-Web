import mysql from "mysql2";
import "dotenv/config";

// Un "pool" reparte varias conexiones y se reconecta solo si MySQL se cae.
// .promise() permite usar await en las consultas.
const conexion = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  charset: "utf8mb4",
  decimalNumbers: true // el precio (DECIMAL) llega como número, no como texto
}).promise();

// Probar la conexión al arrancar
try {
  await conexion.query("SELECT 1");
  console.log("¡Conexión exitosa con MySQL!");
} catch (error) {
  console.log("Error al conectar con MySQL:", error.message);
}

export default conexion;
