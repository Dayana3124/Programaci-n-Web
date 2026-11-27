import "dotenv/config";
import express from "express";
import authRouter from "./routes/auth.routes.js";
import productosRouter from "./routes/productos.routes.js";
import categoriasRouter from "./routes/categorias.routes.js";

// server.js solo conecta las piezas: cada ruta vive en su archivo.

if (!process.env.JWT_SECRET) {
  console.log("Falta JWT_SECRET en el archivo .env (mira .env.example)");
  process.exit(1);
}

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de productos funcionando correctamente");
});

app.use("/", authRouter);                 // POST /registro y POST /login
app.use("/productos", productosRouter);
app.use("/categorias", categoriasRouter);

// Ruta que no existe
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// JSON mal escrito en el body (ej. falta una coma) u otro error inesperado
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El JSON del body está mal escrito" });
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log("Servidor listo en http://localhost:" + PORT);
});
