import { obtenerPerfil, estaMarcada, marcarTarea, pedirAperturaFormularioCrecimiento } from "../almacenamiento.js";
import { hoy, aFecha, aIso, edadEnDias, edadCorregidaEnDias, mesesCumplidos, textoEdadBebe } from "../fechas.js";
import { tareasBebe } from "../contenido-calendario.js";
import { estimulacionDelMes } from "../contenido-estimulacion.js";
import { tieneListaParaElControl } from "../contenido-lista-control.js";
import { recordatoriosActivos, tareaDesdeRecordatorio } from "../recordatorios-del-dia.js";
import { iconos } from "../iconos.js";
import { montarNavInferior } from "./nav-inferior.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let indiceBebeSeleccionado = 0;
let mostrarJuegos = false;

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  const fechaNacimiento = aFecha(perfil.fechaNacimiento);
  const fechaDeHoy = hoy();
  const dias = edadEnDias(fechaNacimiento, fechaDeHoy);

  if (indiceBebeSeleccionado >= perfil.bebes.length) indiceBebeSeleccionado = 0;
  const bebe = perfil.bebes[indiceBebeSeleccionado];

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla";
  pantalla.appendChild(construirMarcaDeAgua());

  if (perfil.mellizos) {
    const selector = document.createElement("div");
    selector.className = "grupo-opciones";
    perfil.bebes.forEach((b, indice) => {
      const chip = document.createElement("button");
      chip.className = `chip ${indice === indiceBebeSeleccionado ? "activo" : ""}`;
      chip.textContent = b.nombre;
      chip.addEventListener("click", () => {
        indiceBebeSeleccionado = indice;
        render(contenedor, { navegar });
      });
      selector.appendChild(chip);
    });
    pantalla.appendChild(selector);
  }

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-inicio";
  encabezado.innerHTML = `
    <div class="perfil-bebe" style="margin-bottom:0;">
      <div class="avatar-bebe">👶</div>
      <div>
        <h1 style="font-size:24px;">${bebe.nombre}</h1>
        <p class="edad">${textoEdadBebe(dias)}</p>
      </div>
    </div>
    <div class="acciones">
      <button class="boton-icono" data-accion="editar" aria-label="Editar datos">${iconos.lapiz}</button>
      <button class="boton-icono" data-accion="recordatorios" aria-label="Mis recordatorios">${iconos.campana}</button>
    </div>
  `;
  encabezado.querySelector('[data-accion="editar"]').addEventListener("click", () => navegar("#/editar-datos"));
  encabezado.querySelector('[data-accion="recordatorios"]').addEventListener("click", () => navegar("#/mis-recordatorios"));
  pantalla.appendChild(encabezado);

  const titulo = document.createElement("h2");
  titulo.textContent = "Hoy te toca…";
  pantalla.appendChild(titulo);

  const fechaIso = aIso(fechaDeHoy);
  const tareas = [
    ...tareasBebe(dias, fechaDeHoy, perfil.fechaNacimiento, indiceBebeSeleccionado),
    ...recordatoriosActivos("mama", fechaIso).map((r) => tareaDesdeRecordatorio(r, fechaIso)),
    ...recordatoriosActivos(indiceBebeSeleccionado, fechaIso).map((r) => tareaDesdeRecordatorio(r, fechaIso)),
  ];
  if (tareas.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "Por ahora no tenés nada pendiente. 🌿";
    pantalla.appendChild(vacio);
  } else {
    tareas.forEach((tarea) => pantalla.appendChild(tarjetaTarea(tarea, fechaIso, navegar)));
  }

  const botonAgregarRecordatorio = document.createElement("button");
  botonAgregarRecordatorio.className = "boton-agregar-item";
  botonAgregarRecordatorio.style.cssText = "border:1px dashed var(--color-borde); border-radius:999px; padding:12px 18px; width:100%; text-align:center; margin-bottom:18px;";
  botonAgregarRecordatorio.textContent = "+ Agregar recordatorio (medicación, turnos...)";
  botonAgregarRecordatorio.addEventListener("click", () => navegar("#/nuevo-recordatorio"));
  pantalla.appendChild(botonAgregarRecordatorio);

  const diasCorregidos = edadCorregidaEnDias(fechaNacimiento, bebe.semanasAlNacer, fechaDeHoy);
  const estimulacion = estimulacionDelMes(mesesCumplidos(diasCorregidos));
  pantalla.appendChild(tarjetaJuegos(estimulacion, contenedor, navegar));
  pantalla.appendChild(tarjetaComida(bebe, diasCorregidos, navegar));

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent =
    "Fuente: Calendario Nacional de Vacunación y controles del Ministerio de Salud y la SAP. Esta app no reemplaza a tu pediatra.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
  montarNavInferior(contenedor, "inicio", navegar);

  if (mostrarJuegos) {
    contenedor.appendChild(construirHojaJuegos(estimulacion, contenedor, navegar));
  }
}

function tarjetaJuegos(estimulacion, contenedor, navegar) {
  const tarjeta = document.createElement("button");
  tarjeta.className = "tarjeta-panel tarjeta";
  tarjeta.style.cssText = "text-align:left; width:100%; cursor:pointer; display:flex; gap:14px; align-items:center;";
  tarjeta.innerHTML = `
    <div style="flex:1;">
      <span class="etiqueta" style="color:var(--color-terracota);">JUEGOS DEL MES</span>
      <p style="font-family:var(--fuente-titulos); font-weight:700; font-size:17px; margin:2px 0 6px 0;">Camino a los ${estimulacion.mes} meses</p>
      <p style="margin:0; font-size:14px;"><strong>Lo que está aprendiendo:</strong> ${estimulacion.aprendiendo}</p>
    </div>
    <div style="font-size:34px; flex-shrink:0;">🧸</div>
  `;
  tarjeta.addEventListener("click", () => {
    mostrarJuegos = true;
    render(contenedor, { navegar });
  });
  return tarjeta;
}

const SEIS_MESES_DIAS = 182.4;

function tarjetaComida(bebe, diasCorregidos, navegar) {
  const yaEmpezo = diasCorregidos >= SEIS_MESES_DIAS;
  const tarjeta = document.createElement("button");
  tarjeta.className = "tarjeta";
  tarjeta.style.cssText = "text-align:left; width:100%; cursor:pointer; display:flex; gap:14px; align-items:center;";
  tarjeta.innerHTML = `
    <div class="icono tipo-estudio">${iconos.cuchara}</div>
    <div style="flex:1;">
      <span class="etiqueta" style="color:var(--color-oliva);">COMIDA</span>
      <p style="margin:2px 0 0 0; font-weight:700;">${yaEmpezo ? `${bebe.nombre} ya puede comer` : `${bebe.nombre} todavía toma solo pecho o fórmula`}</p>
    </div>
  `;
  tarjeta.addEventListener("click", () => navegar("#/comidas"));
  return tarjeta;
}

function construirHojaJuegos(estimulacion, contenedor, navegar) {
  const superposicion = document.createElement("div");
  superposicion.className = "superposicion";
  superposicion.addEventListener("click", (e) => {
    if (e.target === superposicion) {
      mostrarJuegos = false;
      render(contenedor, { navegar });
    }
  });

  const hoja = document.createElement("div");
  hoja.className = "hoja";
  hoja.style.textAlign = "left";
  hoja.innerHTML = `
    <h2 class="centro">Camino a los ${estimulacion.mes} meses</h2>
    <p style="text-align:center; margin-bottom:18px;"><strong>Lo que está aprendiendo:</strong> ${estimulacion.aprendiendo}</p>
  `;

  const listaJuegos = document.createElement("div");
  estimulacion.juegos.forEach((juego) => {
    const item = document.createElement("div");
    item.className = "tarjeta";
    item.innerHTML = `<h3 style="margin-bottom:4px;">${juego.titulo}</h3><p style="margin:0;">${juego.detalle}</p>`;
    listaJuegos.appendChild(item);
  });
  hoja.appendChild(listaJuegos);

  const seguridad = document.createElement("p");
  seguridad.className = "aviso-legal";
  seguridad.style.borderTop = "none";
  seguridad.innerHTML = `<strong>Antes de jugar:</strong> ${estimulacion.reglasSeguridad}`;
  hoja.appendChild(seguridad);

  const consulta = document.createElement("p");
  consulta.className = "aviso-legal";
  consulta.textContent = estimulacion.cuandoConsultar;
  hoja.appendChild(consulta);

  const botonCerrar = document.createElement("button");
  botonCerrar.className = "boton boton-secundario";
  botonCerrar.style.marginTop = "10px";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => {
    mostrarJuegos = false;
    render(contenedor, { navegar });
  });
  hoja.appendChild(botonCerrar);

  superposicion.appendChild(hoja);
  return superposicion;
}

function tarjetaTarea(tarea, fechaIso, navegar) {
  const hecha = estaMarcada(tarea.id);
  const div = document.createElement("div");
  div.className = `tarea tipo-${tarea.tipo} ${hecha ? "hecha" : ""}`;
  div.innerHTML = `
    <div class="icono tipo-${tarea.tipo}">${iconoPorTipo(tarea.tipo)}</div>
    <div class="contenido">
      <span class="etiqueta">${tarea.etiqueta}</span>
      <p class="titulo-tarea">${tarea.titulo}</p>
      <p class="detalle">${tarea.detalle}</p>
    </div>
    <button class="marca ${hecha ? "tildada" : ""}" aria-label="Marcar como hecho"></button>
  `;
  if (tarea.tipo === "control" && tieneListaParaElControl(tarea.mesControl)) {
    const contenido = div.querySelector(".contenido");
    contenido.style.cursor = "pointer";
    contenido.addEventListener("click", () => {
      navegar(`#/lista-control/${tarea.mesControl}?bebe=${indiceBebeSeleccionado}`);
    });
  }

  div.querySelector(".marca").addEventListener("click", (e) => {
    const nuevoEstado = !estaMarcada(tarea.id);
    marcarTarea(tarea.id, nuevoEstado, fechaIso);
    e.target.classList.toggle("tildada", nuevoEstado);
    div.classList.toggle("hecha", nuevoEstado);

    if (nuevoEstado && tarea.tipo === "control") {
      if (confirm("¿Cargamos las medidas de hoy?")) {
        pedirAperturaFormularioCrecimiento(indiceBebeSeleccionado);
        navegar("#/crecimiento");
      }
    }
  });
  return div;
}

function iconoPorTipo(tipo) {
  if (tipo === "vacuna") return iconos.jeringa;
  if (tipo === "control") return iconos.estetoscopio;
  return iconos.pastilla;
}
