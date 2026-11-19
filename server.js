import express from "express";
import conexion from "./db.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Validar los datos del producto
function datosInvalidos(nombre, precio, categoria, stock) {
  return (
    typeof nombre !== "string" ||
    nombre.trim() === "" ||
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    typeof categoria !== "string" ||
    categoria.trim() === "" ||
    !Number.isInteger(stock) ||
    stock < 0
  );
}

// Ruta principal
app.get("/", (req, res) => {
  res.send("API de productos funcionando correctamente");
});

// 1. GET /productos
// Consultar todos los productos y filtrar por precio máximo.
app.get("/productos", async (req, res) => {
  try {
    const { max } = req.query;

    let consulta = "SELECT * FROM productos";
    let valores = [];

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

    const [resultados] = await conexion.promise().query(consulta, valores);

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /productos/:id
// Consultar un producto por su ID.
app.get("/productos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const [resultados] = await conexion.promise().query(
      "SELECT * FROM productos WHERE id = ?",
      [id]
    );

    if (resultados.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(resultados[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. POST /productos
// Registrar un producto.
app.post("/productos", async (req, res) => {
  try {
    const {
      nombre,
      precio,
      categoria,
      stock = 0,
      marca = null,
      tono = null
    } = req.body;

    if (datosInvalidos(nombre, precio, categoria, stock)) {
      return res.status(400).json({
        error: "Nombre, precio, categoría o stock no son válidos"
      });
    }

    const [resultado] = await conexion.promise().query(
      `INSERT INTO productos
      (nombre, precio, categoria, stock, marca, tono)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre.trim(), precio, categoria, stock, marca, tono]
    );

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id: resultado.insertId,
      nombre: nombre.trim(),
      precio,
      categoria,
      stock,
      marca,
      tono
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT /productos/:id
// Actualizar todos los datos de un producto.
app.put("/productos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, precio, categoria, stock, marca = null, tono = null } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID no válido" });
    }

    if (datosInvalidos(nombre, precio, categoria, stock)) {
      return res.status(400).json({
        error: "PUT requiere nombre, precio, categoría y stock válidos"
      });
    }

    const [resultado] = await conexion.promise().query(
      `UPDATE productos
       SET nombre = ?, precio = ?, categoria = ?,
           stock = ?, marca = ?, tono = ?
       WHERE id = ?`,
      [nombre.trim(), precio, categoria, stock, marca, tono, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. PATCH /productos/:id
// Actualizar solamente los campos enviados.
app.patch("/productos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const camposPermitidos = [
      "nombre", "precio", "categoria", "stock", "marca", "tono"
    ];

    const campos = Object.keys(req.body);

    if (
      campos.length === 0 ||
      campos.some(campo => !camposPermitidos.includes(campo))
    ) {
      return res.status(400).json({
        error: "Envía al menos un campo válido del producto"
      });
    }

    const [productos] = await conexion.promise().query(
      "SELECT * FROM productos WHERE id = ?",
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = { ...productos[0], ...req.body };

    if (
      datosInvalidos(
        producto.nombre,
        Number(producto.precio),
        producto.categoria,
        Number(producto.stock)
      ) ||
      (producto.marca !== null && typeof producto.marca !== "string") ||
      (producto.tono !== null && typeof producto.tono !== "string")
    ) {
      return res.status(400).json({ error: "Los datos enviados no son válidos" });
    }

    await conexion.promise().query(
      `UPDATE productos
       SET nombre = ?, precio = ?, categoria = ?,
           stock = ?, marca = ?, tono = ?
       WHERE id = ?`,
      [
        producto.nombre.trim(),
        producto.precio,
        producto.categoria,
        producto.stock,
        producto.marca,
        producto.tono,
        id
      ]
    );

    res.status(200).json({
      mensaje: "Producto modificado correctamente"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE /productos/:id
// Eliminar un producto.
app.delete("/productos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const [resultado] = await conexion.promise().query(
      "DELETE FROM productos WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log("Servidor listo en http://localhost:" + PORT);
});