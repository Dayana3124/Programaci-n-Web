const express = require("express");
const app = express();
app.use(express.json());

// "Base de datos" en memoria (se reinicia cada vez que apagas la API)
let productos = [
  { id: 1, nombre: "Teclado", precio: 80000, stock: 10 },
  { id: 2, nombre: "Monitor", precio: 650000, stock: 3 },
  { id: 3, nombre: "Mouse", precio: 35000, stock: 25 },
];
let siguienteId = 4;

// GET todos (y reto: ?max=50000)
app.get("/productos", (req, res) => {
  const max = req.query.max;
  if (max) return res.json(productos.filter(p => p.precio <= Number(max)));
  res.json(productos);
});

// GET por id
app.get("/productos/:id", (req, res) => {
  const p = productos.find(p => p.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(p);
});

// POST crear
app.post("/productos", (req, res) => {
  const { nombre, precio, stock } = req.body || {};
  if (!nombre) return res.status(400).json({ error: "Falta el nombre" });
  if (precio == null || precio < 0) return res.status(400).json({ error: "Precio inválido" });
  const nuevo = { id: siguienteId++, nombre, precio, stock: stock ?? 0 };
  productos.push(nuevo);
  res.status(201).json(nuevo);
});

// PUT reemplazar todo
app.put("/productos/:id", (req, res) => {
  const p = productos.find(p => p.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  const { nombre, precio, stock } = req.body || {};
  if (!nombre || precio == null || stock == null)
    return res.status(400).json({ error: "Faltan campos (nombre, precio, stock)" });
  Object.assign(p, { nombre, precio, stock });
  res.json(p);
});

// PATCH cambiar stock u otro campo
app.patch("/productos/:id", (req, res) => {
  const p = productos.find(p => p.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  const body = req.body || {};
  if (body.stock != null && body.stock < 0)
    return res.status(400).json({ error: "El stock no puede ser negativo" });
  Object.assign(p, body, { id: p.id });
  res.json(p);
});

// DELETE borrar
app.delete("/productos/:id", (req, res) => {
  const i = productos.findIndex(p => p.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: "Producto no encontrado" });
  const borrado = productos.splice(i, 1)[0];
  res.json(borrado);
});

app.listen(3000, () => console.log("API corriendo en http://localhost:3000"));
