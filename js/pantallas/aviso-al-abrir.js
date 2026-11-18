import { obtenerPerfil, marcarAvisoAlAbrirMostrado, yaSeMostroElAvisoHoy } from "../almacenamiento.js";
import { hoy, aIso, saludoPorHora } from "../fechas.js";
import { tareasDeHoyPendientes } from "../tareas-de-hoy.js";
import { obtenerFotoPerfil } from "../almacen-fotos.js";

/** Decide si corresponde mostrar el aviso (sección 5.1): solo si hay algo
 * pendiente hoy y todavía no se mostró en el día. */
export function debeMostrarAvisoAlAbrir(perfil) {
  const fechaIso = aIso(hoy());
  if (yaSeMostroElAvisoHoy(fechaIso)) return false;
  return tareasDeHoyPendientes(perfil).length > 0;
}

export async function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  const fechaIso = aIso(hoy());
  marcarAvisoAlAbrirMostrado(fechaIso);

  const tareas = tareasDeHoyPendientes(perfil);
  const fotoId = perfil.etapa === "embarazo" ? "mama" : perfil.mellizos ? "familia" : "bebe-0";
  let foto = null;
  try {
    foto = await obtenerFotoPerfil(fotoId);
  } catch (error) {
    // seguimos sin foto
  }

  dibujar(contenedor, navegar, perfil, tareas, foto);
}

function quienLasTiene(perfil) {
  if (perfil.etapa === "embarazo") return null; // "Hoy tenés..." en vez de "Hoy {nombre} tiene..."
  if (perfil.mellizos) return perfil.bebes.map((b) => b.nombre).join(" y ");
  return perfil.bebes[0].nombre;
}

function dibujar(contenedor, navegar, perfil, tareas, foto) {
  // Importante: NO limpiamos el contenedor. Este aviso se dibuja ENCIMA de
  // Inicio (que ya se dibujó antes), como una hoja más, igual que el resto
  // de los formularios de la app.
  const superposicion = document.createElement("div");
  superposicion.className = "superposicion";

  const hoja = document.createElement("div");
  hoja.className = "hoja";

  const circulo = document.createElement("div");
  circulo.className = "avatar-bebe";
  circulo.style.margin = "0 auto 16px auto";
  if (foto) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(foto);
    img.style.cssText = "width:100%; height:100%; object-fit:cover; border-radius:50%;";
    circulo.appendChild(img);
  } else {
    circulo.textContent = perfil.etapa === "embarazo" ? "🤰" : "👶";
  }
  hoja.appendChild(circulo);

  const nombre = quienLasTiene(perfil);
  const titulo = document.createElement("h2");
  titulo.textContent = `¡${saludoPorHora()}, ${perfil.nombreMama}!`;
  hoja.appendChild(titulo);

  const verbo = perfil.mellizos ? "tienen" : "tiene";
  const subtitulo = document.createElement("p");
  subtitulo.innerHTML = nombre
    ? `Hoy <strong>${nombre}</strong> ${verbo} <strong>${tareas.length} ${tareas.length === 1 ? "cosa" : "cosas"}</strong> para hacer:`
    : `Hoy tenés <strong>${tareas.length} ${tareas.length === 1 ? "cosa" : "cosas"}</strong> para hacer:`;
  hoja.appendChild(subtitulo);

  const lista = document.createElement("div");
  lista.style.cssText = "text-align:left; margin: 16px 0;";
  tareas.slice(0, 4).forEach((tarea) => {
    const fila = document.createElement("div");
    fila.style.cssText = "display:flex; gap:12px; align-items:center; background:var(--color-panel); border-radius:14px; padding:12px 16px; margin-bottom:10px;";
    fila.innerHTML = `
      <span style="width:10px; height:10px; border-radius:50%; flex-shrink:0; background:${colorPorTipo(tarea.tipo)};"></span>
      <div>
        <span style="display:block; font-size:12px; font-weight:800; text-transform:uppercase; color:${colorPorTipo(tarea.tipo)};">${tarea.etiqueta}</span>
        <strong>${tarea.titulo}</strong>
      </div>
    `;
    lista.appendChild(fila);
  });
  if (tareas.length > 4) {
    const masTexto = document.createElement("p");
    masTexto.style.cssText = "text-align:left; color:var(--color-texto-suave); font-size:14px;";
    masTexto.textContent = `Y ${tareas.length - 4} más...`;
    lista.appendChild(masTexto);
  }
  hoja.appendChild(lista);

  const botonVer = document.createElement("button");
  botonVer.className = "boton boton-primario";
  botonVer.textContent = perfil.etapa === "bebe" ? "Ver el calendario" : "Ver qué es";
  botonVer.addEventListener("click", () => navegar(perfil.etapa === "bebe" ? "#/calendario" : "#/inicio"));
  hoja.appendChild(botonVer);

  const botonAhoraNo = document.createElement("button");
  botonAhoraNo.className = "boton boton-texto";
  botonAhoraNo.style.marginTop = "8px";
  botonAhoraNo.textContent = "Ahora no";
  botonAhoraNo.addEventListener("click", () => navegar("#/inicio"));
  hoja.appendChild(botonAhoraNo);

  superposicion.appendChild(hoja);
  contenedor.appendChild(superposicion);
}

function colorPorTipo(tipo) {
  if (tipo === "vacuna") return "var(--color-terracota)";
  if (tipo === "control" || tipo === "estudio") return "var(--color-oliva)";
  return "var(--color-ciruela)";
}
