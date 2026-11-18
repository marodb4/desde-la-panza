import { obtenerPerfil, estaMarcada, marcarTarea } from "../almacenamiento.js";
import { hoy, aFecha, aIso, semanaEmbarazoDesdeFpp, saludoPorHora } from "../fechas.js";
import { contenidoDeLaSemana } from "../contenido-embarazo.js";
import { tareasEmbarazo } from "../contenido-calendario.js";
import { recordatoriosActivos, tareaDesdeRecordatorio } from "../recordatorios-del-dia.js";
import { iconos } from "../iconos.js";
import { montarNavInferior } from "./nav-inferior.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  const fpp = aFecha(perfil.fpp);
  const fechaDeHoy = hoy();
  const semana = semanaEmbarazoDesdeFpp(fpp, fechaDeHoy);
  const contenido = contenidoDeLaSemana(semana);
  const semanasRestantes = Math.max(40 - semana, 0);

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-inicio";
  encabezado.innerHTML = `
    <div>
      <p class="saludo">¡${saludoPorHora()}, ${perfil.nombreMama}!</p>
      <h1>Semana ${semana} de embarazo</h1>
    </div>
    <div class="acciones">
      <button class="boton-icono" data-accion="editar" aria-label="Editar datos">${iconos.lapiz}</button>
      <button class="boton-icono" data-accion="recordatorios" aria-label="Mis recordatorios">${iconos.campana}</button>
    </div>
  `;
  encabezado.querySelector('[data-accion="editar"]').addEventListener("click", () => navegar("#/editar-datos"));
  encabezado.querySelector('[data-accion="recordatorios"]').addEventListener("click", () => navegar("#/mis-recordatorios"));
  pantalla.appendChild(encabezado);

  const tarjetaTamano = document.createElement("div");
  tarjetaTamano.className = "tarjeta-tamano";
  tarjetaTamano.innerHTML = `
    <div class="icono-redondo">🧸</div>
    <div>
      <h3>Ya es del tamaño de ${contenido.objeto}</h3>
      <p>${contenido.cm ? `Unos ${contenido.cm} cm` : ""}${contenido.g ? ` y ${contenido.g} g` : ""}. ${contenido.detalle}</p>
    </div>
  `;
  pantalla.appendChild(tarjetaTamano);

  const filaProgreso = document.createElement("div");
  filaProgreso.className = "progreso-fila";
  filaProgreso.innerHTML = `<span>Semana ${semana} de 40</span><span>${
    semanasRestantes > 0 ? `Faltan unas ${semanasRestantes} semanas` : "¡Ya llegó la fecha probable!"
  }</span>`;
  pantalla.appendChild(filaProgreso);

  const barra = document.createElement("div");
  barra.className = "progreso-barra";
  barra.innerHTML = `<div class="progreso-relleno" style="width:${Math.min((semana / 40) * 100, 100)}%"></div>`;
  pantalla.appendChild(barra);

  const alertaGuardia = document.createElement("button");
  alertaGuardia.className = "alerta";
  alertaGuardia.innerHTML = `<span class="punto-rojo">!</span> ¿Cuándo voy a la guardia? <span class="flecha">›</span>`;
  alertaGuardia.addEventListener("click", () => navegar("#/guardia"));
  pantalla.appendChild(alertaGuardia);

  pantalla.appendChild(encabezadoSeccion("Hoy te toca…"));

  const fechaIso = aIso(fechaDeHoy);
  const tareas = [
    ...tareasEmbarazo(semana, fpp, fechaDeHoy),
    ...recordatoriosActivos("mama", fechaIso).map((r) => tareaDesdeRecordatorio(r, fechaIso)),
  ];
  const listaTareas = document.createElement("div");
  if (tareas.length === 0) {
    listaTareas.innerHTML = `<p class="vacio">Por ahora no tenés nada pendiente. 🌿</p>`;
  } else {
    tareas.forEach((tarea) => listaTareas.appendChild(tarjetaTarea(tarea, fechaIso)));
  }
  pantalla.appendChild(listaTareas);

  const botonAgregarRecordatorio = document.createElement("button");
  botonAgregarRecordatorio.className = "boton-agregar-item";
  botonAgregarRecordatorio.style.cssText = "border:1px dashed var(--color-borde); border-radius:999px; padding:12px 18px; width:100%; text-align:center; margin-bottom:18px;";
  botonAgregarRecordatorio.textContent = "+ Agregar recordatorio (medicación, turnos...)";
  botonAgregarRecordatorio.addEventListener("click", () => navegar("#/nuevo-recordatorio"));
  pantalla.appendChild(botonAgregarRecordatorio);

  if (semana >= 30) {
    pantalla.appendChild(tarjetaBolso(navegar));
  }

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent =
    "Fuente: Calendario Nacional de Vacunación y recomendaciones del Ministerio de Salud y la SAP. Esta app no reemplaza a tu obstetra.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
  montarNavInferior(contenedor, "inicio", navegar);
}

function tarjetaBolso(navegar) {
  const tarjeta = document.createElement("button");
  tarjeta.className = "tarjeta-panel tarjeta";
  tarjeta.style.cssText = "text-align:left; width:100%; cursor:pointer; display:flex; gap:14px; align-items:center;";
  tarjeta.innerHTML = `
    <div class="icono-redondo" style="width:48px;height:48px;">${iconos.bolso}</div>
    <div style="flex:1;">
      <span class="etiqueta" style="color:var(--color-terracota);">BOLSO DE MATERNIDAD</span>
      <p style="margin:2px 0 0 0; font-weight:700;">Prepará tu lista para el día del parto</p>
    </div>
  `;
  tarjeta.addEventListener("click", () => navegar("#/bolso"));
  return tarjeta;
}

function encabezadoSeccion(texto) {
  const h2 = document.createElement("h2");
  h2.textContent = texto;
  h2.style.marginTop = "6px";
  return h2;
}

function tarjetaTarea(tarea, fechaIso) {
  const hecha = estaMarcada(tarea.id);
  const div = document.createElement("div");
  div.className = `tarea tipo-${tarea.tipo} ${tarea.urgente ? "urgente" : ""} ${hecha ? "hecha" : ""}`;
  div.innerHTML = `
    <div class="icono tipo-${tarea.tipo}">${iconoPorTipo(tarea.tipo)}</div>
    <div class="contenido">
      <span class="etiqueta">${tarea.etiqueta}</span>
      <p class="titulo-tarea">${tarea.titulo}</p>
      <p class="detalle">${tarea.detalle}</p>
    </div>
    <button class="marca ${hecha ? "tildada" : ""}" aria-label="Marcar como hecho"></button>
  `;
  div.querySelector(".marca").addEventListener("click", (e) => {
    const nuevoEstado = !estaMarcada(tarea.id);
    marcarTarea(tarea.id, nuevoEstado, fechaIso);
    e.target.classList.toggle("tildada", nuevoEstado);
    div.classList.toggle("hecha", nuevoEstado);
  });
  return div;
}

function iconoPorTipo(tipo) {
  if (tipo === "vacuna") return iconos.jeringa;
  if (tipo === "control") return iconos.estetoscopio;
  if (tipo === "estudio") return iconos.frasco;
  return iconos.pastilla;
}
