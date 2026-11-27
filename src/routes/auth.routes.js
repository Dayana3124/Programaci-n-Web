import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import conexion from "../db.js";
import { emailInvalido, passwordInvalido } from "../validaciones.js";

const router = Router();

// POST /registro
// Crea un usuario. La clave se guarda como hash, nunca la clave real.
// El rol siempre es "usuario": nadie puede registrarse como admin.
router.post("/registro", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (emailInvalido(email) || passwordInvalido(password)) {
      return res.status(400).json({
        error: "Envía un email válido y una clave de al menos 6 caracteres"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const [resultado] = await conexion.query(
      "INSERT INTO usuarios (email, password) VALUES (?, ?)",
      [email.toLowerCase(), hash]
    );

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      id: resultado.insertId,
      email: email.toLowerCase(),
      rol: "usuario"
    });
  } catch (error) {
    // El email es UNIQUE: MySQL avisa si ya existe
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Ese email ya está registrado" });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /login
// Compara la clave con el hash y, si coincide, entrega el token.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Envía email y password" });
    }

    const [usuarios] = await conexion.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email.toLowerCase()]
    );
    const usuario = usuarios[0];

    // Mismo mensaje si no existe el email o si la clave está mal,
    // así no se revela qué emails están registrados.
    const ok = usuario && await bcrypt.compare(password, usuario.password);
    if (!ok) {
      return res.status(401).json({ error: "Email o clave incorrectos" });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
