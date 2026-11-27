// Funciones para revisar los datos que llegan en las peticiones.
// Devuelven true cuando algo está MAL.

// Las mismas categorías que tiene el ENUM de la tabla productos
export const CATEGORIAS = [
  "Base", "Labial", "Pestañas", "Corrector", "Rubor", "Gloss", "Polvos"
];

function textoVacio(valor) {
  return typeof valor !== "string" || valor.trim() === "";
}

// Producto completo (POST y PUT)
export function datosInvalidos({ nombre, precio, categoria, stock, marca, tono }) {
  return (
    textoVacio(nombre) ||
    typeof precio !== "number" ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !CATEGORIAS.includes(categoria) ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    textoVacio(marca) ||
    (tono != null && typeof tono !== "string")
  );
}

// El :id de la URL debe ser un entero positivo
export function idInvalido(id) {
  return !Number.isInteger(id) || id <= 0;
}

// Email y clave del registro / login
export function emailInvalido(email) {
  return typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function passwordInvalido(password) {
  return typeof password !== "string" || password.length < 6;
}
