import { obtenerPerfil, obtenerAlimentosProbados, marcarAlimentoProbado } from "../almacenamiento.js";
import { hoy, aFecha, aIso, sumarDias, edadCorregidaEnDias, formatearFechaDiaMes } from "../fechas.js";
import { PRINCIPIOS, PRIMEROS_ALIMENTOS, ARCADAS_VS_ATRAGANTAMIENTO } from "../contenido-comidas.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";
import { montarNavInferior } from "./nav-inferior.js";

const SEIS_MESES_DIAS = 182.4;
let indiceBebeSeleccionado = 0;

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();

  if (perfil.etapa !== "bebe") {
    contenedor.innerHTML = "";
    const pantalla = document.createElement("div");
    pantalla.className = "pantalla";
    pantalla.appendChild(construirMarcaDeAgua());
    pantalla.innerHTML += `
      <div class="centro mt-grande">
        <div style="font-size:56px;">🥄</div>
        <h2>Comidas</h2>
        <p>Esto se activa cuando nazca tu bebé y se acerque a los 6 meses.</p>
      </div>
    `;
    contenedor.appendChild(pantalla);
    montarNavInferior(contenedor, "inicio", navegar);
    return;
  }

  if (indiceBebeSeleccionado >= perfil.bebes.length) indiceBebeSeleccionado = 0;
  dibujar(contenedor, navegar, perfil);
}

function dibujar(contenedor, navegar, perfil) {
  const bebe = perfil.bebes[indiceBebeSeleccionado];
  const fechaNacimiento = aFecha(perfil.fechaNacimiento);
  const diasCorregidos = edadCorregidaEnDias(fechaNacimiento, bebe.semanasAlNacer, hoy());
  const yaEmpezo = diasCorregidos >= SEIS_MESES_DIAS;

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos">
      <h1>Comidas</h1>
      <p class="subtitulo">De 6 a 12 meses</p>
    </div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
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

  const banner = document.createElement("div");
  banner.className = "tarjeta tarjeta-panel";
  banner.style.cssText = "display:flex; gap:14px; align-items:center;";
  if (yaEmpezo) {
    banner.innerHTML = `
      <div class="icono-redondo" style="width:48px;height:48px;font-size:22px;">🎉</div>
      <div><h3 style="margin-bottom:2px;">${bebe.nombre} ya puede comer</h3><p style="margin:0;">Mirá "Sus primeros alimentos" para ir anotando cómo le va.</p></div>
    `;
  } else {
    const diasAdelanto = bebe.semanasAlNacer && bebe.semanasAlNacer < 37 ? (40 - bebe.semanasAlNacer) * 7 : 0;
    const fechaEmpieza = sumarDias(fechaNacimiento, Math.round(SEIS_MESES_DIAS + diasAdelanto));
    banner.innerHTML = `
      <div class="icono-redondo" style="width:48px;height:48px;">${iconos.cuchara}</div>
      <div><h3 style="margin-bottom:2px;">${bebe.nombre} empieza a comer el ${formatearFechaDiaMes(fechaEmpieza)}</h3><p style="margin:0;">Cuando cumpla 6 meses. Mientras, te preparamos.</p></div>
    `;
  }
  pantalla.appendChild(banner);

  const tarjetaSemaforo = document.createElement("button");
  tarjetaSemaforo.className = "tarjeta-oscura";
  tarjetaSemaforo.innerHTML = `
    <div class="puntos-semaforo"><span style="background:var(--color-rojo);"></span><span style="background:var(--color-ambar);"></span><span style="background:var(--color-verde);"></span></div>
    <div><h3>¿Le puedo dar...?</h3><p>El semáforo de alimentos: buscá cualquier comida</p></div>
    <span class="flecha-blanca">›</span>
  `;
  tarjetaSemaforo.addEventListener("click", () => navegar("#/semaforo"));
  pantalla.appendChild(tarjetaSemaforo);

  const tituloPrincipios = document.createElement("h2");
  tituloPrincipios.textContent = "Antes de empezar";
  pantalla.appendChild(tituloPrincipios);

  const tarjetaPrincipios = document.createElement("div");
  tarjetaPrincipios.className = "tarjeta";
  PRINCIPIOS.forEach((p) => {
    const fila = document.createElement("div");
    fila.className = "fila-principio";
    fila.innerHTML = `
      <div class="circulo-numero">${p.numero}</div>
      <div><h3>${p.titulo}</h3><p>${p.detalle}</p></div>
    `;
    tarjetaPrincipios.appendChild(fila);
  });
  pantalla.appendChild(tarjetaPrincipios);

  if (yaEmpezo) {
    const tituloAlimentos = document.createElement("h2");
    tituloAlimentos.textContent = "Sus primeros alimentos";
    pantalla.appendChild(tituloAlimentos);

    const notaAlimentos = document.createElement("p");
    notaAlimentos.textContent = "Tildá lo que ya probó y cómo le fue. Te sirve para mostrarle al pediatra.";
    pantalla.appendChild(notaAlimentos);

    const tarjetaAlimentos = document.createElement("div");
    tarjetaAlimentos.className = "tarjeta";
    const probados = obtenerAlimentosProbados(indiceBebeSeleccionado);
    PRIMEROS_ALIMENTOS.forEach((alimento) => {
      tarjetaAlimentos.appendChild(filaAlimento(alimento, probados[alimento.id], contenedor, navegar, perfil));
    });
    pantalla.appendChild(tarjetaAlimentos);
  }

  const tituloArcadas = document.createElement("h2");
  tituloArcadas.textContent = "Arcadas vs. atragantamiento";
  pantalla.appendChild(tituloArcadas);

  const tarjetaArcadas = document.createElement("div");
  tarjetaArcadas.className = "tarjeta";
  tarjetaArcadas.innerHTML = `
    <h3 style="color:var(--color-oliva);">${ARCADAS_VS_ATRAGANTAMIENTO.arcadas.titulo}</h3>
    <p>${ARCADAS_VS_ATRAGANTAMIENTO.arcadas.detalle}</p>
    <hr style="border:none; border-top:1px solid var(--color-borde); margin:14px 0;" />
    <h3 style="color:var(--color-rojo);">${ARCADAS_VS_ATRAGANTAMIENTO.atragantamiento.titulo}</h3>
    <p style="margin:0;">${ARCADAS_VS_ATRAGANTAMIENTO.atragantamiento.detalle}</p>
  `;
  pantalla.appendChild(tarjetaArcadas);

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = "Fuente: recomendaciones generales de alimentación complementaria (SAP / Ministerio de Salud). Esta app no reemplaza a tu pediatra ni a una nutricionista.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
}

function filaAlimento(alimento, probado, contenedor, navegar, perfil) {
  const fila = document.createElement("div");
  fila.className = "fila-alimento";
  const tildado = Boolean(probado);
  fila.innerHTML = `
    <div class="encabezado-fila">
      <button class="marca ${tildado ? "tildada" : ""}" aria-label="Marcar como probado"></button>
      <span class="nombre-alimento">${alimento.nombre}</span>
    </div>
  `;

  if (tildado) {
    const reacciones = document.createElement("div");
    reacciones.className = "reacciones";
    [
      ["legusto", "Le gustó"],
      ["masomenos", "Más o menos"],
      ["reaccion", "Tuvo reacción"],
    ].forEach(([valor, etiqueta]) => {
      const chip = document.createElement("button");
      chip.className = `chip ${probado?.reaccion === valor ? "activo" : ""}`;
      chip.style.fontSize = "13px";
      chip.textContent = etiqueta;
      chip.addEventListener("click", () => {
        marcarAlimentoProbado(indiceBebeSeleccionado, alimento.id, valor, aIso(hoy()));
        dibujar(contenedor, navegar, perfil);
      });
      reacciones.appendChild(chip);
    });
    fila.appendChild(reacciones);

    if (probado?.reaccion === "reaccion") {
      const nota = document.createElement("p");
      nota.className = "nota-reaccion";
      nota.textContent = "Comentaselo a tu pediatra antes de volver a darle este alimento.";
      fila.appendChild(nota);
    }
  }

  fila.querySelector(".marca").addEventListener("click", () => {
    if (tildado) {
      marcarAlimentoProbado(indiceBebeSeleccionado, alimento.id, null, null);
    } else {
      marcarAlimentoProbado(indiceBebeSeleccionado, alimento.id, "legusto", aIso(hoy()));
    }
    dibujar(contenedor, navegar, perfil);
  });

  return fila;
}
