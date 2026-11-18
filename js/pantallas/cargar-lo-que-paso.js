import { obtenerPerfil, marcarTarea } from "../almacenamiento.js";
import { hoy, aFecha, edadEnDias, textoEdadBebe } from "../fechas.js";
import { etapasCalendarioBebe } from "../contenido-calendario.js";
import { campoTexto } from "./piezas-formulario.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let indiceBebeSeleccionado = 0;
let estado = {}; // clave: `${bebeIndice}-${itemId}` -> { opcion, fechaIso }

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  estado = {};
  dibujar(contenedor, navegar, perfil);
}

function dibujar(contenedor, navegar, perfil) {
  const bebe = perfil.bebes[indiceBebeSeleccionado];
  const fechaNacimiento = aFecha(perfil.fechaNacimiento);
  const diasNacimiento = edadEnDias(fechaNacimiento, hoy());
  const etapas = etapasCalendarioBebe(perfil.fechaNacimiento, indiceBebeSeleccionado).filter(
    (e) => e.edadDiasEtapa <= diasNacimiento
  );

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos">
      <h1>Contanos lo que ya pasó</h1>
      <p class="subtitulo">${bebe.nombre} · ${textoEdadBebe(diasNacimiento)}</p>
    </div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(encabezado);

  const paso = document.createElement("div");
  paso.style.marginBottom = "18px";
  paso.innerHTML = `
    <p style="color:var(--color-oliva); font-weight:800; font-size:13px; letter-spacing:0.04em; margin-bottom:6px;">PASO 2 DE 2</p>
    <div class="progreso-barra" style="margin-bottom:0;"><div class="progreso-relleno" style="background:var(--color-oliva); width:100%;"></div></div>
  `;
  pantalla.appendChild(paso);

  const info = document.createElement("div");
  info.className = "tarjeta tarjeta-panel";
  info.innerHTML = `<p style="margin:0;"><strong>Tené a mano la libreta de vacunas.</strong> Marcá lo que ya tuvo ${bebe.nombre}. Si no te acordás la fecha, no pasa nada: igual queda registrado.</p>`;
  pantalla.appendChild(info);

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

  if (etapas.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = `${bebe.nombre} recién nace: todavía no hay nada que cargar acá. Vas a ver todo en Calendario a medida que le toque.`;
    pantalla.appendChild(vacio);
  } else {
    ["vacuna", "control"].forEach((tipo) => {
      const etapasConItems = etapas
        .map((e) => ({ ...e, items: e.items.filter((i) => i.tipo === tipo) }))
        .filter((e) => e.items.length > 0);
      if (etapasConItems.length === 0) return;

      const titulo = document.createElement("h2");
      titulo.textContent = tipo === "vacuna" ? "Vacunas" : "Controles";
      pantalla.appendChild(titulo);

      etapasConItems.forEach((etapa) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta";
        const h3 = document.createElement("h3");
        h3.textContent = etapa.etiqueta;
        tarjeta.appendChild(h3);

        etapa.items.forEach((item, indice) => {
          if (indice > 0) {
            const separador = document.createElement("hr");
            separador.style.cssText = "border:none; border-top:1px solid var(--color-borde); margin:12px 0;";
            tarjeta.appendChild(separador);
          }
          tarjeta.appendChild(bloqueItem(item, contenedor, navegar, perfil));
        });

        pantalla.appendChild(tarjeta);
      });
    });
  }

  const botonGuardar = document.createElement("button");
  botonGuardar.className = "boton boton-primario";
  botonGuardar.style.marginTop = "10px";
  botonGuardar.textContent = "Guardar y continuar";
  botonGuardar.addEventListener("click", () => {
    guardarTodo(perfil);
    navegar("#/inicio");
  });
  pantalla.appendChild(botonGuardar);

  const botonSaltar = document.createElement("button");
  botonSaltar.className = "boton boton-texto";
  botonSaltar.style.marginTop = "10px";
  botonSaltar.textContent = "Saltar por ahora";
  botonSaltar.addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(botonSaltar);

  contenedor.appendChild(pantalla);
}

function bloqueItem(item, contenedor, navegar, perfil) {
  const clave = `${indiceBebeSeleccionado}-${item.id}`;
  const actual = estado[clave] || { opcion: null, fechaIso: "" };

  const bloque = document.createElement("div");
  bloque.innerHTML = `<p style="font-weight:700; margin-bottom:8px;">${item.nombre}</p>`;

  const chips = document.createElement("div");
  chips.className = "grupo-opciones";
  chips.style.marginBottom = actual.opcion === "si" ? "10px" : "0";
  [
    ["si", "Sí, se la dieron"],
    ["no-recuerdo", "No me acuerdo la fecha"],
    ["todavia-no", "Todavía no"],
  ].forEach(([valor, etiqueta]) => {
    const chip = document.createElement("button");
    chip.className = `chip ${actual.opcion === valor ? "activo" : ""}`;
    chip.textContent = etiqueta;
    chip.addEventListener("click", () => {
      estado[clave] = { opcion: valor, fechaIso: valor === "si" ? actual.fechaIso : "" };
      dibujar(contenedor, navegar, perfil);
    });
    chips.appendChild(chip);
  });
  bloque.appendChild(chips);

  if (actual.opcion === "si") {
    const campoFecha = campoTexto("¿Qué día?", "", actual.fechaIso, (v) => {
      estado[clave] = { ...actual, fechaIso: v };
    }, "date");
    campoFecha.style.marginTop = "10px";
    campoFecha.style.marginBottom = "0";
    bloque.appendChild(campoFecha);
  }

  return bloque;
}

function guardarTodo(perfil) {
  perfil.bebes.forEach((_, bebeIndice) => {
    const fechaNacimiento = aFecha(perfil.fechaNacimiento);
    const diasNacimiento = edadEnDias(fechaNacimiento, hoy());
    const etapas = etapasCalendarioBebe(perfil.fechaNacimiento, bebeIndice).filter((e) => e.edadDiasEtapa <= diasNacimiento);
    etapas.forEach((etapa) => {
      etapa.items.forEach((item) => {
        const clave = `${bebeIndice}-${item.id}`;
        const elegido = estado[clave];
        if (!elegido) return;
        if (elegido.opcion === "si") {
          marcarTarea(item.id, true, elegido.fechaIso || null);
        } else if (elegido.opcion === "no-recuerdo") {
          marcarTarea(item.id, true, null);
        }
      });
    });
  });
}
