import { obtenerPerfil, obtenerRecordatorios, eliminarRecordatorio } from "../almacenamiento.js";
import { aFecha, formatearFechaCorta } from "../fechas.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  dibujar(contenedor, navegar, perfil);
}

function nombreDestinatario(paraQuien, perfil) {
  if (paraQuien === "mama") return perfil.nombreMama;
  if (perfil.etapa === "bebe" && perfil.bebes[paraQuien]) return perfil.bebes[paraQuien].nombre;
  return "—";
}

function dibujar(contenedor, navegar, perfil) {
  const recordatorios = obtenerRecordatorios();

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos"><h1>Mis recordatorios</h1></div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(encabezado);

  const botonNuevo = document.createElement("button");
  botonNuevo.className = "boton boton-oliva";
  botonNuevo.style.marginBottom = "18px";
  botonNuevo.textContent = "+ Nuevo recordatorio";
  botonNuevo.addEventListener("click", () => navegar("#/nuevo-recordatorio"));
  pantalla.appendChild(botonNuevo);

  if (recordatorios.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "Todavía no agregaste ningún recordatorio.";
    pantalla.appendChild(vacio);
  } else {
    recordatorios.forEach((r) => pantalla.appendChild(tarjetaRecordatorio(r, perfil, contenedor, navegar)));
  }

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = 'La app no sugiere dosis: solo te ayuda a recordar lo que ya te indicó tu médico.';
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
}

function tarjetaRecordatorio(r, perfil, contenedor, navegar) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta";
  const hastaTexto = r.hastaCuando === "fecha" && r.fechaFin ? `Hasta el ${formatearFechaCorta(aFecha(r.fechaFin))}` : "Hasta que lo saques";
  tarjeta.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
      <div>
        <span class="etiqueta" style="color:var(--color-ciruela);">${nombreDestinatario(r.paraQuien, perfil)}</span>
        <h3 style="margin:2px 0 4px 0;">${r.que}</h3>
        ${r.comoIndicado ? `<p style="margin:0 0 6px 0;">${r.comoIndicado}</p>` : ""}
        <p style="margin:0; font-size:13px; color:var(--color-texto-suave);">${r.horarios.join(", ")} · ${hastaTexto}</p>
      </div>
      <button class="boton-quitar-item" aria-label="Borrar recordatorio" style="flex-shrink:0;">${iconos.tacho}</button>
    </div>
  `;
  tarjeta.querySelector("button").addEventListener("click", () => {
    if (confirm(`¿Borrar el recordatorio de "${r.que}"?`)) {
      eliminarRecordatorio(r.id);
      dibujar(contenedor, navegar, perfil);
    }
  });
  return tarjeta;
}
