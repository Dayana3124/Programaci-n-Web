import jwt from "jsonwebtoken";

// Revisa el token ANTES de que se ejecute la ruta.
// En Postman: Authorization -> Bearer Token -> pegar el token.
export function verificarToken(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [tipo, token] = header.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Falta el token" });
  }

  try {
    // Si la firma es correcta y no ha vencido, guarda { id, rol, iat, exp }
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
}

// Va DESPUÉS de verificarToken: ya existe req.usuario.
export function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Solo un administrador puede hacer esto" });
  }
  next();
}
