import { Router } from "express";
import conexion from "../db.js";
import { CATEGORIAS } from "../validaciones.js";

const router = Router();

// server.js monta este router en "/categorias".
// Las categorías son las del ENUM de la tabla productos.

// GET /categorias  -> cada categoría con cuántos productos tiene
router.get("/", async (req, res) => {
  try {
    const [filas] = await conexion.query(
      "SELECT categoria, COUNT(*) AS total FROM productos GROUP BY categoria"
    );
    const resultado = CATEGORIAS.map(nombre => ({
      nombre,
      productos: filas.find(f => f.categoria === nombre)?.total ?? 0
    }));
    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /categorias/:nombre/productos  -> los productos de una categoría
router.get("/:nombre/productos", async (req, res) => {
  try {
    const categoria = CATEGORIAS.find(
      c => c.toLowerCase() === req.params.nombre.toLowerCase()
    );
    if (!categoria) {
      return res.status(404).json({
        error: "Categoría no encontrada. Usa una de: " + CATEGORIAS.join(", ")
      });
    }

    const [productos] = await conexion.query(
      "SELECT * FROM productos WHERE categoria = ?", [categoria]
    );
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
