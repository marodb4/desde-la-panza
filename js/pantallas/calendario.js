import { obtenerPerfil, estaMarcada, marcarTarea, obtenerMarcas } from "../almacenamiento.js";
import { hoy, aFecha, aIso, formatearFechaCorta, edadEnDias } from "../fechas.js";
import { etapasCalendarioBebe, alertaRotavirus } from "../contenido-calendario.js";
import { campoTexto } from "./piezas-formulario.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";
import { montarNavInferior } from "./nav-inferior.js";

let indiceBebeSeleccionado = 0;
let filtroActivo = "todo";
let formularioFecha = null; // { id, nombre, fechaIso, error } o null

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();

  if (perfil.etapa !== "bebe") {
    contenedor.innerHTML = "";
    const pantalla = document.createElement("div");
    pantalla.className = "pantalla";
    pantalla.appendChild(construirMarcaDeAgua());
    const contenido = document.createElement("div");
    contenido.innerHTML = `
      <div class="centro mt-grande">
        <div style="font-size:56px;">🗓️</div>
        <h2>Calendario</h2>
        <p>El calendario de vacunas y controles del bebé se activa cuando nazca. Mientras tanto, mirá "Hoy te toca" en Inicio.</p>
      </div>
    `;
    const boton = document.createElement("button");
    boton.className = "boton boton-secundario";
    boton.textContent = "Volver a Inicio";
    boton.addEventListener("click", () => navegar("#/inicio"));
    contenido.appendChild(boton);
    pantalla.appendChild(contenido);
    contenedor.appendChild(pantalla);
    montarNavInferior(contenedor, "calendario", navegar);
    return;
  }

  if (indiceBebeSeleccionado >= perfil.bebes.length) indiceBebeSeleccionado = 0;
  dibujar(contenedor, navegar, perfil);
}

function dibujar(contenedor, navegar, perfil) {
  const bebe = perfil.bebes[indiceBebeSeleccionado];
  const fechaNacimiento = aFecha(perfil.fechaNacimiento);
  const diasNacimiento = edadEnDias(fechaNacimiento, hoy());
  const etapas = etapasCalendarioBebe(perfil.fechaNacimiento, indiceBebeSeleccionado);

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.innerHTML = `
    <h1>Calendario de ${bebe.nombre}</h1>
    <p class="subtitulo" style="color:var(--color-texto-suave); margin-top:-6px;">Vacunas y controles del calendario argentino</p>
  `;
  pantalla.appendChild(encabezado);

  if (perfil.mellizos) {
    const selector = document.createElement("div");
    selector.className = "selector-mellizos";
    perfil.bebes.forEach((b, indice) => {
      const boton = document.createElement("button");
      boton.className = `selector-mellizos-item ${indice === indiceBebeSeleccionado ? "activo" : ""}`;
      boton.textContent = b.nombre;
      boton.addEventListener("click", () => {
        indiceBebeSeleccionado = indice;
        dibujar(contenedor, navegar, perfil);
      });
      selector.appendChild(boton);
    });
    pantalla.appendChild(selector);
  }

  // --- Vacunas al día ---
  let totalDebidas = 0;
  let totalHechas = 0;
  etapas.forEach((etapa) => {
    etapa.items.forEach((item) => {
      if (item.tipo !== "vacuna") return;
      if (etapa.edadDiasEtapa > diasNacimiento) return;
      totalDebidas++;
      if (estaMarcada(item.id)) totalHechas++;
    });
  });

  const bloqueProgreso = document.createElement("div");
  bloqueProgreso.style.marginTop = "18px";
  bloqueProgreso.innerHTML = `
    <div class="progreso-fila"><span>Vacunas al día</span><span style="font-weight:800; color:var(--color-oliva);">${totalHechas} de ${totalDebidas} hasta hoy</span></div>
    <div class="progreso-barra"><div class="progreso-relleno" style="background:var(--color-oliva); width:${totalDebidas ? (totalHechas / totalDebidas) * 100 : 100}%"></div></div>
  `;
  pantalla.appendChild(bloqueProgreso);

  // --- Alerta rotavirus ---
  const alerta = alertaRotavirus(diasNacimiento, estaMarcada, indiceBebeSeleccionado);
  if (alerta) {
    const cajaAlerta = document.createElement("div");
    cajaAlerta.className = "tarjeta";
    cajaAlerta.style.cssText = "border: 2px solid var(--color-terracota); display:flex; gap:12px; align-items:flex-start;";
    cajaAlerta.innerHTML = `
      <span style="color:var(--color-terracota); font-size:22px; line-height:1;">⚠️</span>
      <div>
        <h3 style="color:var(--color-terracota); margin-bottom:4px;">${alerta.titulo}</h3>
        <p style="margin:0;">${alerta.texto}</p>
      </div>
    `;
    pantalla.appendChild(cajaAlerta);
  }

  // --- Filtros ---
  const filtros = document.createElement("div");
  filtros.className = "grupo-opciones";
  [
    ["todo", "Todo"],
    ["vacuna", "Vacunas"],
    ["control", "Controles"],
  ].forEach(([id, etiqueta]) => {
    const chip = document.createElement("button");
    chip.className = `chip ${filtroActivo === id ? "activo" : ""}`;
    chip.textContent = etiqueta;
    chip.addEventListener("click", () => {
      filtroActivo = id;
      dibujar(contenedor, navegar, perfil);
    });
    filtros.appendChild(chip);
  });
  pantalla.appendChild(filtros);

  // --- Etapas ---
  etapas.forEach((etapa) => {
    const items = filtroActivo === "todo" ? etapa.items : etapa.items.filter((i) => i.tipo === filtroActivo);
    if (items.length === 0) return;

    const todosListos = etapa.items.every((i) => estaMarcada(i.id));

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    const filaTitulo = document.createElement("div");
    filaTitulo.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;";
    filaTitulo.innerHTML = `
      <h3 style="margin:0;">${etapa.etiqueta}</h3>
      ${todosListos ? '<span style="background:var(--color-oliva-tinte); color:var(--color-oliva); font-weight:800; font-size:13px; padding:4px 12px; border-radius:999px;">Listo</span>' : ""}
    `;
    tarjeta.appendChild(filaTitulo);

    items.forEach((item) => {
      tarjeta.appendChild(filaItem(item, contenedor, navegar, perfil));
    });

    pantalla.appendChild(tarjeta);
  });

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = "Fuente: Calendario Nacional de Vacunación y controles del Ministerio de Salud y la SAP. Esta app no reemplaza a tu pediatra.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
  montarNavInferior(contenedor, "calendario", navegar);

  if (formularioFecha) {
    contenedor.appendChild(construirHojaFecha(contenedor, navegar, perfil));
  }
}

function filaItem(item, contenedor, navegar, perfil) {
  const marca = obtenerMarcaCompleta(item.id);
  const hecho = Boolean(marca?.hecha);

  const fila = document.createElement("div");
  fila.style.cssText = "display:flex; gap:14px; align-items:center; padding:10px 0; border-top:1px solid var(--color-borde);";
  fila.innerHTML = `
    <button class="marca ${hecho ? "tildada" : ""}" style="flex-shrink:0;" aria-label="Marcar"></button>
    <div>
      <p style="font-weight:700; margin:0;">${item.nombre}</p>
      <p style="margin:0; font-size:13px; color:${hecho ? "var(--color-oliva)" : "var(--color-texto-suave)"};">
        ${item.tipo === "vacuna" ? "Vacuna" : "Control"} · ${descripcionEstado(marca, hecho, item.tipo)}
      </p>
    </div>
  `;
  fila.querySelector(".marca").addEventListener("click", () => {
    if (hecho) {
      if (confirm(`¿Quitar la marca de hecho en "${item.nombre}"?`)) {
        marcarTarea(item.id, false, null);
        dibujar(contenedor, navegar, perfil);
      }
    } else {
      formularioFecha = { id: item.id, nombre: item.nombre, fechaIso: aIso(hoy()), error: "" };
      dibujar(contenedor, navegar, perfil);
    }
  });
  return fila;
}

function descripcionEstado(marca, hecho, tipo) {
  if (!hecho) return "pendiente";
  const verbo = tipo === "vacuna" ? "aplicada" : "hecho";
  if (!marca.fecha) return `${verbo}, sin fecha`;
  return `${verbo} el ${formatearFechaCorta(aFecha(marca.fecha))}`;
}

function obtenerMarcaCompleta(id) {
  return obtenerMarcas()[id];
}

function construirHojaFecha(contenedor, navegar, perfil) {
  const superposicion = document.createElement("div");
  superposicion.className = "superposicion";
  superposicion.addEventListener("click", (e) => {
    if (e.target === superposicion) {
      formularioFecha = null;
      dibujar(contenedor, navegar, perfil);
    }
  });

  const hoja = document.createElement("div");
  hoja.style.textAlign = "left";
  hoja.className = "hoja";
  hoja.innerHTML = `<h2 class="centro">${formularioFecha.nombre}</h2>`;

  hoja.appendChild(
    campoTexto("¿Cuándo se la dieron / hicieron?", "", formularioFecha.fechaIso, (v) => (formularioFecha.fechaIso = v), "date")
  );

  if (formularioFecha.error) {
    const error = document.createElement("p");
    error.style.cssText = "color:var(--color-rojo); font-weight:700;";
    error.textContent = formularioFecha.error;
    hoja.appendChild(error);
  }

  const botonConfirmar = document.createElement("button");
  botonConfirmar.className = "boton boton-primario";
  botonConfirmar.textContent = "Confirmar con esta fecha";
  botonConfirmar.addEventListener("click", () => {
    if (!formularioFecha.fechaIso) {
      formularioFecha.error = "Elegí una fecha, o tocá \"No me acuerdo la fecha\".";
      return dibujar(contenedor, navegar, perfil);
    }
    if (aFecha(formularioFecha.fechaIso).getTime() > hoy().getTime()) {
      formularioFecha.error = "La fecha no puede ser futura.";
      return dibujar(contenedor, navegar, perfil);
    }
    marcarTarea(formularioFecha.id, true, formularioFecha.fechaIso);
    formularioFecha = null;
    dibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonConfirmar);

  const botonSinFecha = document.createElement("button");
  botonSinFecha.className = "boton boton-secundario";
  botonSinFecha.style.marginTop = "10px";
  botonSinFecha.textContent = "No me acuerdo la fecha";
  botonSinFecha.addEventListener("click", () => {
    marcarTarea(formularioFecha.id, true, null);
    formularioFecha = null;
    dibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonSinFecha);

  const botonCancelar = document.createElement("button");
  botonCancelar.className = "boton boton-texto";
  botonCancelar.style.marginTop = "10px";
  botonCancelar.textContent = "Cancelar";
  botonCancelar.addEventListener("click", () => {
    formularioFecha = null;
    dibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonCancelar);

  superposicion.appendChild(hoja);
  return superposicion;
}
