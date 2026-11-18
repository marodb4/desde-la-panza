import { obtenerPerfil, debeMostrarRecordatorioFotos, posponerRecordatorioFotos } from "../almacenamiento.js";
import { guardarRecuerdo, listarRecuerdos, eliminarRecuerdo } from "../almacen-fotos.js";
import { hoy, aFecha, aIso, semanaEmbarazoDesdeFpp, edadEnDias, textoEdadBebe, formatearFechaDiaMes } from "../fechas.js";
import { sugerenciasPanzaDisponibles, sugerenciasBebeDisponibles } from "../contenido-recuerdos-sugeridos.js";
import { campoTexto } from "./piezas-formulario.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";
import { montarNavInferior } from "./nav-inferior.js";

let indiceBebeSeleccionado = 0;
let filtroActivo = "todos";
let formulario = null; // null = cerrado
let vistaAmpliada = null; // null = cerrada; si no, el recuerdo guardado
let cacheRecuerdos = [];

const TINTES = [
  { bg: "var(--color-oliva-tinte)", color: "var(--color-oliva)" },
  { bg: "var(--color-ciruela-tinte)", color: "var(--color-ciruela)" },
  { bg: "var(--color-terracota-tinte)", color: "var(--color-terracota)" },
  { bg: "var(--color-ambar-tinte)", color: "var(--color-ambar)" },
];

export async function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  if (indiceBebeSeleccionado >= perfil.bebes.length) indiceBebeSeleccionado = 0;
  try {
    cacheRecuerdos = await listarRecuerdos();
  } catch (error) {
    // Si falla (por ejemplo, otra pestaña vieja de la app abierta bloqueando
    // la base), seguimos con la lista vacía en vez de dejar la pantalla en blanco.
    cacheRecuerdos = [];
  }
  dibujar(contenedor, navegar, perfil);
}

function recargarYDibujar(contenedor, navegar, perfil) {
  listarRecuerdos()
    .then((lista) => {
      cacheRecuerdos = lista;
    })
    .catch(() => {
      // Si falla, al menos no perdemos lo que ya teníamos en memoria.
    })
    .finally(() => {
      dibujar(contenedor, navegar, perfil);
    });
}

function dibujar(contenedor, navegar, perfil) {
  const fechaDeHoy = hoy();
  const bebe = perfil.etapa === "bebe" ? perfil.bebes[indiceBebeSeleccionado] : null;
  const fechaNacimiento = perfil.fechaNacimiento ? aFecha(perfil.fechaNacimiento) : null;
  const diasDeVida = fechaNacimiento ? edadEnDias(fechaNacimiento, fechaDeHoy) : null;
  const semanaEmbarazo = perfil.fpp ? semanaEmbarazoDesdeFpp(aFecha(perfil.fpp), fechaDeHoy) : null;

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla";
  pantalla.appendChild(construirMarcaDeAgua());

  // --- Encabezado ---
  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-recuerdos";
  encabezado.innerHTML = `
    <div>
      <h1>${bebe ? `Recuerdos de ${bebe.nombre}` : "Recuerdos"}</h1>
      <p class="subtitulo">Desde la panza hasta hoy</p>
    </div>
  `;
  const botonMas = document.createElement("button");
  botonMas.className = "boton-mas";
  botonMas.setAttribute("aria-label", "Agregar recuerdo");
  botonMas.textContent = "+";
  botonMas.addEventListener("click", () => {
    abrirFormulario(null, null);
    dibujar(contenedor, navegar, perfil);
  });
  encabezado.appendChild(botonMas);
  pantalla.appendChild(encabezado);

  // --- Selector de mellizos (solo con el bebé ya nacido) ---
  if (perfil.mellizos && perfil.etapa === "bebe") {
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

  // --- Filtros ---
  const filtros = document.createElement("div");
  filtros.className = "grupo-opciones";
  [
    ["todos", "Todos"],
    ["panza", "La panza"],
    ["primerAno", "Primer año"],
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

  // --- Aviso "¿Guardamos tus fotos?" ---
  const recuerdosConFoto = cacheRecuerdos.filter((r) => r.foto);
  if (recuerdosConFoto.length > 0 && debeMostrarRecordatorioFotos()) {
    pantalla.appendChild(construirBannerFotos(contenedor, navegar, perfil, recuerdosConFoto));
  }

  // --- Grilla ---
  const items = construirItems(perfil, semanaEmbarazo, diasDeVida);
  if (items.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "Todavía no hay recuerdos acá. Tocá + para agregar el primero.";
    pantalla.appendChild(vacio);
  } else {
    const grilla = document.createElement("div");
    grilla.className = "grilla-recuerdos";
    items.forEach((item, indice) => grilla.appendChild(tarjetaItem(item, indice, contenedor, navegar, perfil)));
    pantalla.appendChild(grilla);
  }

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = "Tus fotos se guardan en este celular. Recordá hacer una copia en tu Google Drive o por mail.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
  montarNavInferior(contenedor, "recuerdos", navegar);

  if (formulario) {
    contenedor.appendChild(construirHojaFormulario(contenedor, navegar, perfil));
  }
  if (vistaAmpliada) {
    contenedor.appendChild(construirVistaAmpliada(contenedor, navegar, perfil));
  }
}

/* ------------------------------ Items ------------------------------ */

function construirItems(perfil, semanaEmbarazo, diasDeVida) {
  const items = [];

  if (filtroActivo !== "primerAno" && perfil.fpp) {
    sugerenciasPanzaDisponibles(semanaEmbarazo).forEach((s) => {
      const cumplido = cacheRecuerdos.find((r) => r.sugeridoId === s.id);
      items.push(cumplido ? itemDesdeGuardado(cumplido, perfil) : itemPendientePanza(s));
    });
    cacheRecuerdos
      .filter((r) => r.etapa === "panza" && !r.sugeridoId)
      .forEach((r) => items.push(itemDesdeGuardado(r, perfil)));
  }

  if (filtroActivo !== "panza" && diasDeVida != null) {
    sugerenciasBebeDisponibles(diasDeVida).forEach((s) => {
      const cumplido = cacheRecuerdos.find((r) => r.sugeridoId === s.id && (r.bebeIndice ?? 0) === indiceBebeSeleccionado);
      items.push(cumplido ? itemDesdeGuardado(cumplido, perfil) : itemPendienteBebe(s));
    });
    cacheRecuerdos
      .filter((r) => r.etapa === "primerAno" && !r.sugeridoId && (r.bebeIndice ?? 0) === indiceBebeSeleccionado)
      .forEach((r) => items.push(itemDesdeGuardado(r, perfil)));
  }

  items.sort((a, b) => a.orden - b.orden);
  return items;
}

function itemPendientePanza(s) {
  return { tipo: "pendiente", titulo: s.titulo, subtitulo: `Semana ${s.semanaDesde}`, orden: s.semanaDesde, sugerido: s, etapa: "panza" };
}

function itemPendienteBebe(s) {
  const subtitulo = s.id === "sug-llego" ? "El día que nació" : textoEdadBebe(s.diaDesde);
  return { tipo: "pendiente", titulo: s.titulo, subtitulo, orden: 1000 + s.diaDesde, sugerido: s, etapa: "primerAno" };
}

function itemDesdeGuardado(r, perfil) {
  const fecha = aFecha(r.fechaIso);
  let subtitulo;
  let orden;
  if (r.etapa === "panza") {
    const semana = perfil.fpp ? semanaEmbarazoDesdeFpp(aFecha(perfil.fpp), fecha) : null;
    subtitulo = semana ? `Semana ${semana}` : "";
    orden = semana ?? 0;
  } else {
    subtitulo = r.sugeridoId === "sug-llego" ? formatearFechaDiaMes(fecha) : textoEdadBebe(edadEnDias(aFecha(perfil.fechaNacimiento), fecha));
    orden = 1000 + edadEnDias(aFecha(perfil.fechaNacimiento), fecha);
  }
  return { tipo: "guardado", titulo: r.titulo, subtitulo, orden, foto: r.foto, registro: r };
}

function tarjetaItem(item, indice, contenedor, navegar, perfil) {
  const tinte = TINTES[indice % TINTES.length];
  const boton = document.createElement("button");
  boton.className = `tarjeta-recuerdo ${item.tipo === "pendiente" ? "pendiente" : ""}`;
  const imagenHtml = item.foto
    ? `<div class="imagen"><img src="${URL.createObjectURL(item.foto)}" alt="" /></div>`
    : `<div class="imagen" style="background:${tinte.bg}; color:${tinte.color};">${iconos.fotos}</div>`;
  boton.innerHTML = `
    ${imagenHtml}
    <div class="info">
      <p class="titulo-recuerdo">${item.titulo}</p>
      <p class="subtitulo-recuerdo">${item.subtitulo}</p>
    </div>
  `;
  boton.addEventListener("click", () => {
    if (item.tipo === "pendiente") {
      abrirFormulario(item.sugerido, item.etapa);
    } else {
      vistaAmpliada = item.registro;
    }
    dibujar(contenedor, navegar, perfil);
  });
  return boton;
}

/* ------------------------- Aviso de respaldo ------------------------- */

function construirBannerFotos(contenedor, navegar, perfil, recuerdosConFoto) {
  const banner = document.createElement("div");
  banner.className = "banner-fotos";
  banner.innerHTML = `
    <div class="icono-camara">${iconos.camara}</div>
    <div style="flex:1;">
      <h3>¿Guardamos tus fotos?</h3>
      <p>Hacé una copia en tu Google Drive o por mail, por las dudas.</p>
      <div class="acciones-banner">
        <button class="boton boton-oliva" data-accion="guardar">Guardar ahora</button>
        <button class="boton boton-texto" data-accion="ahora-no">Ahora no</button>
      </div>
    </div>
  `;
  banner.querySelector('[data-accion="ahora-no"]').addEventListener("click", () => {
    posponerRecordatorioFotos();
    dibujar(contenedor, navegar, perfil);
  });
  banner.querySelector('[data-accion="guardar"]').addEventListener("click", async () => {
    await exportarFotos(recuerdosConFoto);
    posponerRecordatorioFotos();
    dibujar(contenedor, navegar, perfil);
  });
  return banner;
}

async function exportarFotos(recuerdos) {
  const archivos = recuerdos.map((r, i) => new File([r.foto], `recuerdo-${i + 1}.jpg`, { type: r.foto.type || "image/jpeg" }));
  if (navigator.canShare && navigator.canShare({ files: archivos })) {
    try {
      await navigator.share({ files: archivos, title: "Recuerdos de Desde la Panza" });
    } catch (error) {
      // La mamá canceló el compartir: no pasa nada.
    }
    return;
  }
  archivos.forEach((archivo) => {
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = archivo.name;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });
}

/* --------------------------- Nuevo recuerdo --------------------------- */

function abrirFormulario(sugerido, etapaForzada) {
  formulario = {
    sugerido,
    titulo: sugerido ? sugerido.titulo : "",
    nota: "",
    fechaIso: aIso(hoy()),
    etapa: etapaForzada,
    archivo: null,
    previewUrl: null,
    error: "",
  };
}

function cerrarFormulario() {
  if (formulario?.previewUrl) URL.revokeObjectURL(formulario.previewUrl);
  formulario = null;
}

function construirHojaFormulario(contenedor, navegar, perfil) {
  if (!formulario.etapa) {
    formulario.etapa = perfil.etapa === "embarazo" ? "panza" : "primerAno";
  }

  const superposicion = document.createElement("div");
  superposicion.className = "superposicion";
  superposicion.addEventListener("click", (e) => {
    if (e.target === superposicion) {
      cerrarFormulario();
      dibujar(contenedor, navegar, perfil);
    }
  });

  const hoja = document.createElement("div");
  hoja.className = "hoja";
  hoja.style.textAlign = "left";
  hoja.innerHTML = `<h2 class="centro">${formulario.sugerido ? "Cargar foto" : "Nuevo recuerdo"}</h2>`;

  if (!formulario.sugerido && perfil.etapa === "bebe" && perfil.fpp) {
    const grupo = document.createElement("div");
    grupo.className = "grupo-opciones";
    grupo.style.marginBottom = "16px";
    [
      ["panza", "La panza"],
      ["primerAno", "Primer año"],
    ].forEach(([id, etiqueta]) => {
      const chip = document.createElement("button");
      chip.className = `chip ${formulario.etapa === id ? "activo" : ""}`;
      chip.textContent = etiqueta;
      chip.addEventListener("click", () => {
        formulario.etapa = id;
        dibujar(contenedor, navegar, perfil);
      });
      grupo.appendChild(chip);
    });
    hoja.appendChild(grupo);
  }

  hoja.appendChild(campoTexto("Título", "Ej.: Primer baño en casa", formulario.titulo, (v) => (formulario.titulo = v)));

  const campoFoto = document.createElement("div");
  campoFoto.className = "campo";
  campoFoto.innerHTML = `<label>Foto</label>`;
  if (formulario.previewUrl) {
    const img = document.createElement("img");
    img.src = formulario.previewUrl;
    img.style.cssText = "width:100%;border-radius:12px;margin-bottom:10px;";
    campoFoto.appendChild(img);
  }
  const botonFoto = document.createElement("button");
  botonFoto.type = "button";
  botonFoto.className = "boton boton-secundario";
  botonFoto.textContent = formulario.previewUrl ? "Cambiar foto" : "Elegir o sacar foto";
  const inputFoto = document.createElement("input");
  inputFoto.type = "file";
  inputFoto.accept = "image/*";
  inputFoto.capture = "environment";
  inputFoto.style.display = "none";
  inputFoto.addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      if (formulario.previewUrl) URL.revokeObjectURL(formulario.previewUrl);
      formulario.archivo = archivo;
      formulario.previewUrl = URL.createObjectURL(archivo);
      dibujar(contenedor, navegar, perfil);
    }
  });
  botonFoto.addEventListener("click", () => inputFoto.click());
  campoFoto.appendChild(botonFoto);
  campoFoto.appendChild(inputFoto);
  hoja.appendChild(campoFoto);

  hoja.appendChild(campoTexto("Fecha", "", formulario.fechaIso, (v) => (formulario.fechaIso = v), "date"));
  hoja.appendChild(campoTexto("Nota (opcional)", "Un recuerdo de ese día...", formulario.nota, (v) => (formulario.nota = v)));

  if (formulario.error) {
    const error = document.createElement("p");
    error.style.cssText = "color:var(--color-rojo);font-weight:700;";
    error.textContent = formulario.error;
    hoja.appendChild(error);
  }

  const botonGuardar = document.createElement("button");
  botonGuardar.className = "boton boton-primario";
  botonGuardar.textContent = "Guardar recuerdo";
  botonGuardar.addEventListener("click", async () => {
    if (!formulario.titulo.trim()) {
      formulario.error = "Ponele un título.";
      return dibujar(contenedor, navegar, perfil);
    }
    if (!formulario.fechaIso) {
      formulario.error = "Elegí la fecha.";
      return dibujar(contenedor, navegar, perfil);
    }
    const bebeIndice = formulario.etapa === "primerAno" ? indiceBebeSeleccionado : null;
    await guardarRecuerdo({
      tipo: formulario.sugerido ? "sugerido" : "propio",
      sugeridoId: formulario.sugerido ? formulario.sugerido.id : null,
      etapa: formulario.etapa,
      bebeIndice,
      titulo: formulario.titulo.trim(),
      nota: formulario.nota.trim(),
      fechaIso: formulario.fechaIso,
      foto: formulario.archivo || null,
    });
    cerrarFormulario();
    recargarYDibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonGuardar);

  const botonCancelar = document.createElement("button");
  botonCancelar.className = "boton boton-texto";
  botonCancelar.style.marginTop = "10px";
  botonCancelar.textContent = "Cancelar";
  botonCancelar.addEventListener("click", () => {
    cerrarFormulario();
    dibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonCancelar);

  superposicion.appendChild(hoja);
  return superposicion;
}

/* --------------------------- Vista ampliada --------------------------- */

function construirVistaAmpliada(contenedor, navegar, perfil) {
  const r = vistaAmpliada;
  const superposicion = document.createElement("div");
  superposicion.className = "superposicion";
  superposicion.addEventListener("click", (e) => {
    if (e.target === superposicion) {
      vistaAmpliada = null;
      dibujar(contenedor, navegar, perfil);
    }
  });

  const hoja = document.createElement("div");
  hoja.className = "hoja vista-ampliada";
  hoja.style.textAlign = "left";

  if (r.foto) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(r.foto);
    hoja.appendChild(img);
  }

  const titulo = document.createElement("h2");
  titulo.textContent = r.titulo;
  hoja.appendChild(titulo);

  if (r.nota) {
    const nota = document.createElement("p");
    nota.textContent = r.nota;
    hoja.appendChild(nota);
  }

  const botonBorrar = document.createElement("button");
  botonBorrar.className = "boton boton-texto";
  botonBorrar.style.color = "var(--color-rojo)";
  botonBorrar.textContent = "Borrar este recuerdo";
  botonBorrar.addEventListener("click", async () => {
    if (confirm("¿Borrar este recuerdo? No se puede deshacer.")) {
      await eliminarRecuerdo(r.id);
      vistaAmpliada = null;
      recargarYDibujar(contenedor, navegar, perfil);
    }
  });
  hoja.appendChild(botonBorrar);

  const botonCerrar = document.createElement("button");
  botonCerrar.className = "boton boton-secundario";
  botonCerrar.style.marginTop = "10px";
  botonCerrar.textContent = "Cerrar";
  botonCerrar.addEventListener("click", () => {
    vistaAmpliada = null;
    dibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonCerrar);

  superposicion.appendChild(hoja);
  return superposicion;
}
