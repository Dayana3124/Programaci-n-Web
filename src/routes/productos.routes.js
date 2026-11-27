import { Router } from "express";
import conexion from "../db.js";
import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";
import { datosInvalidos, idInvalido } from "../validaciones.js";

const router = Router();

// server.js monta este router en "/productos",
// por eso aquí las rutas son "/" y "/:id".

const CAMPOS = ["nombre", "precio", "categoria", "stock", "marca", "tono"];

// GET /productos  (y /productos?max=50000)  -> libre, sin token
router.get("/", async (req, res) => {
  try {
    const { max } = req.query;
    let consulta = "SELECT * FROM productos";
    const valores = [];

    if (max !== undefined) {
      const precioMaximo = Number(max);
      if (!Number.isFinite(precioMaximo) || precioMaximo < 0) {
        return res.status(400).json({
          error: "El parámetro max debe ser un número mayor o igual a cero"
        });
      }
      consulta += " WHERE precio <= ?";
      valores.push(precioMaximo);
    }

    const [productos] = await conexion.query(consulta, valores);
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /productos/:id  -> libre, sin token
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (idInvalido(id)) return res.status(400).json({ error: "ID no válido" });

    const [productos] = await conexion.query(
      "SELECT * FROM productos WHERE id = ?", [id]
    );
    if (productos.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(productos[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /productos  -> necesita token
router.post("/", verificarToken, async (req, res) => {
  try {
    const { nombre, precio, categoria, stock = 0, marca, tono = null } = req.body ?? {};
    const producto = { nombre, precio, categoria, stock, marca, tono };

    if (datosInvalidos(producto)) {
      return res.status(400).json({
        error: "Revisa nombre, precio, categoría, stock y marca"
      });
    }
    producto.nombre = nombre.trim();

    const [resultado] = await conexion.query(
      `INSERT INTO productos (nombre, precio, categoria, stock, marca, tono)
       VALUES (?, ?, ?, ?, ?, ?)`,
      CAMPOS.map(campo => producto[campo])
    );

    res.status(201).json({ id: resultado.insertId, ...producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /productos/:id  -> necesita token. Reemplaza el producto completo.
router.put("/:id", verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (idInvalido(id)) return res.status(400).json({ error: "ID no válido" });

    const { nombre, precio, categoria, stock, marca, tono = null } = req.body ?? {};
    const producto = { nombre, precio, categoria, stock, marca, tono };

    if (datosInvalidos(producto)) {
      return res.status(400).json({
        error: "PUT requiere nombre, precio, categoría, stock y marca válidos"
      });
    }
    producto.nombre = nombre.trim();

    const [resultado] = await conexion.query(
      `UPDATE productos
       SET nombre = ?, precio = ?, categoria = ?, stock = ?, marca = ?, tono = ?
       WHERE id = ?`,
      [...CAMPOS.map(campo => producto[campo]), id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({ id, ...producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /productos/:id  -> necesita token. Cambia solo lo que se envíe.
router.patch("/:id", verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (idInvalido(id)) return res.status(400).json({ error: "ID no válido" });

    const cambios = req.body ?? {};
    const campos = Object.keys(cambios);
    if (campos.length === 0 || campos.some(campo => !CAMPOS.includes(campo))) {
      return res.status(400).json({
        error: "Envía al menos un campo válido: " + CAMPOS.join(", ")
      });
    }

    const [productos] = await conexion.query(
      "SELECT * FROM productos WHERE id = ?", [id]
    );
    if (productos.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Se mezcla lo que había con lo nuevo y se valida el resultado completo
    const producto = { ...productos[0], ...cambios };
    if (datosInvalidos(producto)) {
      return res.status(400).json({ error: "Los datos enviados no son válidos" });
    }
    producto.nombre = producto.nombre.trim();

    await conexion.query(
      `UPDATE productos
       SET nombre = ?, precio = ?, categoria = ?, stock = ?, marca = ?, tono = ?
       WHERE id = ?`,
      [...CAMPOS.map(campo => producto[campo]), id]
    );

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /productos/:id  -> necesita token Y ser admin
router.delete("/:id", verificarToken, soloAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (idInvalido(id)) return res.status(400).json({ error: "ID no válido" });

    const [resultado] = await conexion.query(
      "DELETE FROM productos WHERE id = ?", [id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
