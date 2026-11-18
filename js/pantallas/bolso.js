import {
  obtenerPerfil,
  estaMarcada,
  marcarTarea,
  obtenerItemsPersonalizadosBolso,
  agregarItemPersonalizadoBolso,
  eliminarItemPersonalizadoBolso,
} from "../almacenamiento.js";
import { hoy, aFecha, aIso, semanaEmbarazoDesdeFpp } from "../fechas.js";
import { GRUPOS_BOLSO } from "../contenido-bolso.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";
import { montarNavInferior } from "./nav-inferior.js";

let grupoConFormularioAbierto = null; // id de grupo, o null
let textoNuevoItem = "";

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();

  if (perfil.etapa !== "embarazo") {
    contenedor.innerHTML = "";
    const pantalla = document.createElement("div");
    pantalla.className = "pantalla";
    pantalla.appendChild(construirMarcaDeAgua());
    pantalla.innerHTML += `
      <div class="centro mt-grande">
        <div style="font-size:56px;">🧳</div>
        <h2>Bolso de maternidad</h2>
        <p>Esto era para prepararte durante el embarazo. ¡Esperamos que ya lo hayas usado!</p>
      </div>
    `;
    contenedor.appendChild(pantalla);
    montarNavInferior(contenedor, "inicio", navegar);
    return;
  }

  dibujar(contenedor, navegar, perfil);
}

function idItem(grupoId, indice) {
  return `bolso-${grupoId}-${indice}`;
}
function idItemPersonalizado(grupoId, itemId) {
  return `bolso-${grupoId}-custom-${itemId}`;
}

function dibujar(contenedor, navegar, perfil) {
  const semana = perfil.fpp ? semanaEmbarazoDesdeFpp(aFecha(perfil.fpp), hoy()) : null;

  let totalItems = 0;
  let totalHechos = 0;
  GRUPOS_BOLSO.forEach((grupo) => {
    grupo.items.forEach((_, indice) => {
      totalItems++;
      if (estaMarcada(idItem(grupo.id, indice))) totalHechos++;
    });
    obtenerItemsPersonalizadosBolso(grupo.id).forEach((item) => {
      totalItems++;
      if (estaMarcada(idItemPersonalizado(grupo.id, item.id))) totalHechos++;
    });
  });
  const porcentaje = totalItems ? Math.round((totalHechos / totalItems) * 100) : 0;

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos">
      <h1>Bolso de maternidad</h1>
      <p class="subtitulo">${semana ? `Semana ${semana} · ${mensajePorProgreso(porcentaje)}` : mensajePorProgreso(porcentaje)}</p>
    </div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(encabezado);

  const banner = document.createElement("div");
  banner.className = "tarjeta tarjeta-panel";
  banner.style.cssText = "display:flex; gap:14px; align-items:center;";
  banner.innerHTML = `
    <div class="icono-redondo" style="width:56px;height:56px;">${iconos.bolso}</div>
    <div style="flex:1;">
      <h3 style="margin-bottom:8px;">Tenés listo el ${porcentaje} % del bolso</h3>
      <div class="progreso-barra" style="margin-bottom:8px;"><div class="progreso-relleno" style="width:${porcentaje}%"></div></div>
      <p style="margin:0; font-size:14px;">Ideal: listo cerca de la puerta desde la semana 36.</p>
    </div>
  `;
  pantalla.appendChild(banner);

  const aviso = document.createElement("div");
  aviso.className = "tarjeta";
  aviso.style.background = "var(--color-ambar-tinte)";
  aviso.innerHTML = `<p style="margin:0; color:var(--color-ambar);"><strong>Cada maternidad pide cosas distintas.</strong> <span style="color:var(--color-texto);">Preguntá en la tuya qué tenés que llevar y agregalo acá.</span></p>`;
  pantalla.appendChild(aviso);

  GRUPOS_BOLSO.forEach((grupo) => {
    pantalla.appendChild(tarjetaGrupo(grupo, perfil, contenedor, navegar));
  });

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = "Es una lista orientativa: la maternidad donde vayas a tener a tu bebé puede pedir otras cosas.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
}

function mensajePorProgreso(porcentaje) {
  if (porcentaje === 0) return "empezá tu lista";
  if (porcentaje < 60) return "vas por buen camino";
  if (porcentaje < 100) return "¡ya casi está!";
  return "¡bolso listo! 🎉";
}

function tarjetaGrupo(grupo, perfil, contenedor, navegar) {
  const personalizados = obtenerItemsPersonalizadosBolso(grupo.id);
  const totalGrupo = grupo.items.length + personalizados.length;
  const hechosGrupo =
    grupo.items.filter((_, i) => estaMarcada(idItem(grupo.id, i))).length +
    personalizados.filter((item) => estaMarcada(idItemPersonalizado(grupo.id, item.id))).length;

  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta";

  const encabezadoGrupo = document.createElement("div");
  encabezadoGrupo.className = "encabezado-grupo-bolso";
  encabezadoGrupo.innerHTML = `<h3 style="margin:0;">${grupo.nombre}</h3><span>${hechosGrupo} de ${totalGrupo}</span>`;
  tarjeta.appendChild(encabezadoGrupo);

  grupo.items.forEach((nombreItem, indice) => {
    const texto = perfil.mellizos && grupo.duplicaConMellizos ? `${nombreItem} (x2)` : nombreItem;
    tarjeta.appendChild(filaBolso(idItem(grupo.id, indice), texto, null, contenedor, navegar, perfil));
  });

  personalizados.forEach((item) => {
    tarjeta.appendChild(
      filaBolso(idItemPersonalizado(grupo.id, item.id), item.nombre, () => {
        eliminarItemPersonalizadoBolso(grupo.id, item.id);
        dibujar(contenedor, navegar, perfil);
      }, contenedor, navegar, perfil)
    );
  });

  if (grupoConFormularioAbierto === grupo.id) {
    const formulario = document.createElement("div");
    formulario.style.cssText = "display:flex; gap:8px; margin-top:12px;";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Ej.: Faja posparto";
    input.value = textoNuevoItem;
    input.style.cssText =
      "flex:1; min-height:44px; border-radius:12px; border:1px solid var(--color-borde); padding:8px 14px; font-family:var(--fuente-texto); font-size:15px;";
    input.addEventListener("input", (e) => (textoNuevoItem = e.target.value));
    const botonOk = document.createElement("button");
    botonOk.className = "boton boton-primario";
    botonOk.style.cssText = "width:auto; padding:10px 18px;";
    botonOk.textContent = "Agregar";
    botonOk.addEventListener("click", () => {
      if (textoNuevoItem.trim()) {
        agregarItemPersonalizadoBolso(grupo.id, textoNuevoItem.trim());
      }
      textoNuevoItem = "";
      grupoConFormularioAbierto = null;
      dibujar(contenedor, navegar, perfil);
    });
    formulario.append(input, botonOk);
    tarjeta.appendChild(formulario);
  } else {
    const botonAgregar = document.createElement("button");
    botonAgregar.className = "boton-agregar-item";
    botonAgregar.textContent = "+ Agregar algo propio";
    botonAgregar.addEventListener("click", () => {
      grupoConFormularioAbierto = grupo.id;
      textoNuevoItem = "";
      dibujar(contenedor, navegar, perfil);
    });
    tarjeta.appendChild(botonAgregar);
  }

  return tarjeta;
}

function filaBolso(id, texto, alEliminar, contenedor, navegar, perfil) {
  const tildado = estaMarcada(id);
  const fila = document.createElement("div");
  fila.className = `fila-bolso ${tildado ? "tildado" : ""}`;
  fila.innerHTML = `
    <button class="marca ${tildado ? "tildada" : ""}" aria-label="Tildar"></button>
    <span class="texto-item">${texto}</span>
  `;
  fila.querySelector(".marca").addEventListener("click", () => {
    marcarTarea(id, !tildado, tildado ? null : aIso(hoy()));
    dibujar(contenedor, navegar, perfil);
  });

  if (alEliminar) {
    const botonQuitar = document.createElement("button");
    botonQuitar.className = "boton-quitar-item";
    botonQuitar.setAttribute("aria-label", "Quitar este ítem");
    botonQuitar.innerHTML = iconos.cerrar;
    botonQuitar.style.width = "18px";
    botonQuitar.style.height = "18px";
    botonQuitar.addEventListener("click", alEliminar);
    fila.appendChild(botonQuitar);
  }

  return fila;
}
