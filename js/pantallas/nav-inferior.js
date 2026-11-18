import { iconos } from "../iconos.js";

const ITEMS = [
  { id: "inicio", texto: "Inicio", icono: iconos.casa, ruta: "#/inicio" },
  { id: "calendario", texto: "Calendario", icono: iconos.calendario, ruta: "#/calendario" },
  { id: "recuerdos", texto: "Recuerdos", icono: iconos.fotos, ruta: "#/recuerdos" },
  { id: "crecimiento", texto: "Crecimiento", icono: iconos.crecimiento, ruta: "#/crecimiento" },
];

export function montarNavInferior(contenedor, activo, navegar) {
  const nav = document.createElement("nav");
  nav.className = "nav-inferior";
  ITEMS.forEach((item) => {
    const boton = document.createElement("button");
    boton.className = `nav-item ${item.id === activo ? "activo" : ""}`;
    boton.innerHTML = `${item.icono}<span>${item.texto}</span>`;
    boton.addEventListener("click", () => navegar(item.ruta));
    nav.appendChild(boton);
  });
  contenedor.appendChild(nav);
}
