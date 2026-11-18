// Pantalla de administradora (Parte 5): ver clientas y activar/quitar el
// acceso a mano, para casos raros (pago no verificado, contracargo, etc.).
// La seguridad de verdad la hacen las Edge Functions (chequean el mail),
// esto de acá es solo la pantalla.
import { supabase } from "../supabase-cliente.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let usuarias = [];
let cargando = true;
let error = "";
let sinPermiso = false;

export function render(contenedor, { navegar }) {
  usuarias = [];
  cargando = true;
  error = "";
  sinPermiso = false;
  dibujar(contenedor, navegar);
  cargarUsuarias(contenedor, navegar);
}

async function cargarUsuarias(contenedor, navegar) {
  const { data, error: errorFuncion } = await supabase.functions.invoke("admin-listar-usuarias");
  cargando = false;

  if (errorFuncion) {
    error = "No pudimos cargar la lista. Probá de nuevo.";
    dibujar(contenedor, navegar);
    return;
  }
  if (!data?.ok) {
    if (data?.error?.includes("permiso")) sinPermiso = true;
    else error = data?.error || "No pudimos cargar la lista.";
    dibujar(contenedor, navegar);
    return;
  }
  usuarias = data.usuarias;
  dibujar(contenedor, navegar);
}

function dibujar(contenedor, navegar) {
  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos"><h1>Administradora</h1><p class="subtitulo">Tus clientas</p></div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(encabezado);

  if (sinPermiso) {
    const p = document.createElement("p");
    p.className = "vacio";
    p.textContent = "No tenés permiso para ver esta pantalla.";
    pantalla.appendChild(p);
  } else if (cargando) {
    const p = document.createElement("p");
    p.className = "vacio";
    p.textContent = "Cargando...";
    pantalla.appendChild(p);
  } else if (error) {
    const p = document.createElement("p");
    p.className = "vacio";
    p.textContent = error;
    pantalla.appendChild(p);
  } else if (usuarias.length === 0) {
    const p = document.createElement("p");
    p.className = "vacio";
    p.textContent = "Todavía no hay ninguna clienta registrada.";
    pantalla.appendChild(p);
  } else {
    const contador = document.createElement("p");
    contador.className = "contador-resultados";
    contador.textContent = `${usuarias.length} cuenta${usuarias.length === 1 ? "" : "s"}`;
    pantalla.appendChild(contador);

    usuarias.forEach((u) => pantalla.appendChild(tarjetaUsuaria(u, contenedor, navegar)));
  }

  contenedor.appendChild(pantalla);
}

function tarjetaUsuaria(u, contenedor, navegar) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "tarjeta";
  tarjeta.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
      <div>
        <p style="margin:0; font-weight:800;">${u.nombre_mama || "(sin nombre todavía)"}</p>
        <p style="margin:2px 0 0 0; font-size:14px; color: var(--color-texto-suave);">${u.email}</p>
        <p style="margin:4px 0 0 0; font-size:13px; color: var(--color-texto-suave);">
          Registrada: ${formatearFecha(u.creado_el)} · Mail confirmado: ${u.confirmado ? "Sí" : "No"}
        </p>
        ${u.activado_el ? `<p style="margin:2px 0 0 0; font-size:13px; color: var(--color-texto-suave);">Activada: ${formatearFecha(u.activado_el)}</p>` : ""}
      </div>
      <span class="pastilla-estado" style="background:${u.acceso_activo ? "var(--color-verde-tinte)" : "var(--color-rojo-tinte)"}; color:${u.acceso_activo ? "var(--color-verde)" : "var(--color-rojo)"}; white-space:nowrap;">
        ${u.acceso_activo ? "Activa" : "Sin pagar"}
      </span>
    </div>
  `;

  const botonAccion = document.createElement("button");
  botonAccion.className = `boton ${u.acceso_activo ? "boton-texto" : "boton-primario"}`;
  botonAccion.style.marginTop = "10px";
  botonAccion.textContent = u.acceso_activo ? "Quitar acceso" : "Activar acceso a mano";
  botonAccion.addEventListener("click", () => cambiarAcceso(u, !u.acceso_activo, contenedor, navegar));
  tarjeta.appendChild(botonAccion);

  return tarjeta;
}

async function cambiarAcceso(usuaria, nuevoEstado, contenedor, navegar) {
  const confirmacion = nuevoEstado
    ? `¿Activar el acceso de ${usuaria.email} a mano?`
    : `¿Quitarle el acceso a ${usuaria.email}?`;
  if (!confirm(confirmacion)) return;

  const { data, error: errorFuncion } = await supabase.functions.invoke("admin-cambiar-acceso", {
    body: { userId: usuaria.user_id, nuevoEstado },
  });

  if (errorFuncion || !data?.ok) {
    alert(data?.error || "No se pudo cambiar el acceso. Probá de nuevo.");
    return;
  }

  usuaria.acceso_activo = nuevoEstado;
  usuaria.activado_el = nuevoEstado ? new Date().toISOString() : null;
  dibujar(contenedor, navegar);
}

function formatearFecha(iso) {
  if (!iso) return "-";
  const fecha = new Date(iso);
  return fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
