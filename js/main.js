import { obtenerPerfil } from "./almacenamiento.js";
import { supabase } from "./supabase-cliente.js";
import { activarSincronizacion, desactivarSincronizacion, descargarDesdeLaNube } from "./nube.js";
import * as sesion from "./pantallas/sesion.js";
import * as activarAcceso from "./pantallas/activar-acceso.js";
import * as registro from "./pantallas/registro.js";
import * as inicioEmbarazo from "./pantallas/inicio-embarazo.js";
import * as inicioBebe from "./pantallas/inicio-bebe.js";
import * as guardia from "./pantallas/guardia.js";
import * as editarDatos from "./pantallas/editar-datos.js";
import * as crecimiento from "./pantallas/crecimiento.js";
import * as recuerdos from "./pantallas/recuerdos.js";
import * as calendario from "./pantallas/calendario.js";
import * as cargarLoQuePaso from "./pantallas/cargar-lo-que-paso.js";
import * as proximamente from "./pantallas/proximamente.js";
import * as bienvenida from "./pantallas/bienvenida.js";
import * as comidas from "./pantallas/comidas.js";
import * as semaforo from "./pantallas/semaforo.js";
import * as bolso from "./pantallas/bolso.js";
import * as listaControl from "./pantallas/lista-control.js";
import * as nuevoRecordatorio from "./pantallas/nuevo-recordatorio.js";
import * as misRecordatorios from "./pantallas/mis-recordatorios.js";
import * as avisoAlAbrir from "./pantallas/aviso-al-abrir.js";
import * as comoInstalar from "./pantallas/como-instalar.js";
import * as admin from "./pantallas/admin.js";

const CLAVE_BIENVENIDA_MOSTRADA = "dlp_bienvenida_mostrada";

const contenedorApp = document.getElementById("app");

// Parte 5: sin sesión iniciada, no se ve ninguna otra pantalla. "sesionActual"
// se mantiene con lo que diga Supabase; descargaHecha evita bajar el
// respaldo de la nube más de una vez por inicio de sesión.
let sesionActual = null;
let descargaHecha = false;
let accesoActivo = false;

function navegar(ruta) {
  if (window.location.hash === ruta) {
    // Si ya estamos en esa ruta (por ejemplo, "Continuar" en Bienvenida
    // cuando el link ya era "#/inicio"), el navegador no dispara
    // "hashchange" solo. Forzamos el redibujado para no quedar trabados.
    renderizar();
  } else {
    window.location.hash = ruta;
  }
}

function renderizar() {
  if (!sesionActual) {
    return sesion.render(contenedorApp, { navegar });
  }

  if (!accesoActivo) {
    return activarAcceso.render(contenedorApp, {
      navegar,
      alActivar: () => {
        accesoActivo = true;
        renderizar();
      },
    });
  }

  const perfil = obtenerPerfil();
  const hash = window.location.hash || "";
  const [, ruta, parametro] = hash.match(/^#\/?([^/]*)\/?(.*)$/) || [];

  window.scrollTo(0, 0);

  // Un perfil incompleto (por ejemplo, de una versión vieja, o corrupto)
  // nunca debería romper la app con una pantalla en blanco: lo tratamos
  // como si no hubiera perfil y mandamos de vuelta al Registro.
  const perfilIncompleto =
    perfil && ((perfil.etapa === "bebe" && !perfil.fechaNacimiento) || (perfil.etapa === "embarazo" && !perfil.fpp));

  if (!perfil || perfilIncompleto) {
    return registro.render(contenedorApp, { navegar });
  }

  // Bienvenida: solo la primera vez que se llega a Inicio en esta sesión del
  // navegador, y nunca pisa otras rutas (como "cargar-lo-que-paso") para no
  // arriesgar nada de lo que ya funciona.
  const esRutaInicio = !ruta || ruta === "inicio";
  if (esRutaInicio && !sessionStorage.getItem(CLAVE_BIENVENIDA_MOSTRADA)) {
    sessionStorage.setItem(CLAVE_BIENVENIDA_MOSTRADA, "1");
    return bienvenida.render(contenedorApp, { navegar });
  }

  if (esRutaInicio) {
    // Primero dibujamos Inicio de verdad...
    perfil.etapa === "embarazo"
      ? inicioEmbarazo.render(contenedorApp, { navegar })
      : inicioBebe.render(contenedorApp, { navegar });
    // ...y si hoy hay algo pendiente que todavía no se avisó, el aviso se
    // dibuja ENCIMA (como una hoja más), sin pisar lo que ya se dibujó.
    // "Cómo instalar" solo se muestra si no hay un aviso más importante hoy.
    if (avisoAlAbrir.debeMostrarAvisoAlAbrir(perfil)) {
      avisoAlAbrir.render(contenedorApp, { navegar });
    } else if (comoInstalar.debeMostrarComoInstalar()) {
      comoInstalar.render(contenedorApp, { navegar });
    }
    return;
  }

  switch (ruta) {
    case "guardia":
      return guardia.render(contenedorApp, { navegar });
    case "editar-datos":
      return editarDatos.render(contenedorApp, { navegar });
    case "crecimiento":
      return crecimiento.render(contenedorApp, { navegar });
    case "recuerdos":
      return recuerdos.render(contenedorApp, { navegar });
    case "calendario":
      return calendario.render(contenedorApp, { navegar });
    case "cargar-lo-que-paso":
      return cargarLoQuePaso.render(contenedorApp, { navegar });
    case "comidas":
      return comidas.render(contenedorApp, { navegar });
    case "semaforo":
      return semaforo.render(contenedorApp, { navegar });
    case "bolso":
      return bolso.render(contenedorApp, { navegar });
    case "lista-control":
      return listaControl.render(contenedorApp, { navegar, parametro });
    case "nuevo-recordatorio":
      return nuevoRecordatorio.render(contenedorApp, { navegar });
    case "mis-recordatorios":
      return misRecordatorios.render(contenedorApp, { navegar });
    case "como-instalar":
      // Para poder abrirlo de nuevo a propósito (desde Editar datos), aunque
      // ya se haya mostrado antes. Se dibuja sobre Inicio, como siempre.
      perfil.etapa === "embarazo"
        ? inicioEmbarazo.render(contenedorApp, { navegar })
        : inicioBebe.render(contenedorApp, { navegar });
      comoInstalar.renderSiempre(contenedorApp, { navegar });
      return;
    case "admin":
      return admin.render(contenedorApp, { navegar });
    case "proximamente":
      return proximamente.render(contenedorApp, { navegar, parametro });
    case "registro":
      return registro.render(contenedorApp, { navegar });
    case "inicio":
    default:
      return perfil.etapa === "embarazo"
        ? inicioEmbarazo.render(contenedorApp, { navegar })
        : inicioBebe.render(contenedorApp, { navegar });
  }
}

window.addEventListener("hashchange", renderizar);

// Supabase avisa el estado de la sesión de forma asincrónica, incluso al
// cargar la página por primera vez (evento "INITIAL_SESSION"). Por eso todo
// el primer dibujado de la app depende de este único listener, en vez de
// llamar a renderizar() directo.
supabase.auth.onAuthStateChange(async (_evento, session) => {
  const yaHabiaSesion = Boolean(sesionActual);
  sesionActual = session;

  if (session) {
    activarSincronizacion(session.user.id);
    if (!yaHabiaSesion) descargaHecha = false;
    if (!descargaHecha) {
      descargaHecha = true;
      const datosDeLaNube = await descargarDesdeLaNube(session.user.id);
      // La cuenta de administradora no tiene que pagarse a sí misma.
      const esAdmin = session.user.email?.toLowerCase() === "marodb4@gmail.com";
      accesoActivo = esAdmin || Boolean(datosDeLaNube?.acceso_activo);
    }
  } else {
    desactivarSincronizacion();
    descargaHecha = false;
    accesoActivo = false;
  }

  renderizar();
});

// El service worker es lo que permite "instalar" la app (Parte 6). Usa
// siempre la red primero (ver sw.js), así no se queda pegado en una versión
// vieja mientras se sigue cambiando la app.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
