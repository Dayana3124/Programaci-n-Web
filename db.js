import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const conexion = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

conexion.connect((error) => {
    if (error) {
        console.log("Error al conectar con MySQL:", error.message);
    } else {
        console.log("¡Conexión exitosa con MySQL!");
    }
});

export default conexion;