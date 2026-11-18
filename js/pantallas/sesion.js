// Pantalla de "Crear cuenta" / "Iniciar sesión" (Parte 5). Aparece antes que
// cualquier otra pantalla si no hay una sesión activa. El cambio de pantalla
// después de entrar lo maneja main.js, escuchando onAuthStateChange: acá
// solo hace falta avisarle a Supabase y mostrar errores si los hay.
import { supabase } from "../supabase-cliente.js";
import { campoTexto } from "./piezas-formulario.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let modo = "login"; // "login" | "crear" | "recuperar"
let email = "";
let contrasena = "";
let error = "";
let mensaje = "";
let cargando = false;

export function render(contenedor, { navegar }) {
  modo = "login";
  email = "";
  contrasena = "";
  error = "";
  mensaje = "";
  cargando = false;
  dibujar(contenedor, navegar);
}

function dibujar(contenedor, navegar) {
  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  pantalla.innerHTML += `
    <div class="centro" style="margin-bottom: 18px;">
      <div style="font-size: 64px; line-height: 1;">🤱</div>
    </div>
    <h1 class="centro">Desde la Panza</h1>
  `;

  if (modo === "recuperar") {
    pantalla.appendChild(construirRecuperar(contenedor, navegar));
  } else {
    pantalla.appendChild(construirLoginOCrear(contenedor, navegar));
  }

  contenedor.appendChild(pantalla);
}

function construirLoginOCrear(contenedor, navegar) {
  const bloque = document.createElement("div");

  const subtitulo = document.createElement("h2");
  subtitulo.style.cssText = "font-size:17px; text-align:center;";
  subtitulo.textContent = modo === "login" ? "Iniciá sesión" : "Creá tu cuenta";
  bloque.appendChild(subtitulo);

  const explicacion = document.createElement("p");
  explicacion.style.textAlign = "center";
  explicacion.textContent =
    modo === "login"
      ? "Así, si cambiás de celular, no perdés nada."
      : "Con tu mail y una contraseña alcanza. Nunca compartimos tus datos.";
  bloque.appendChild(explicacion);

  bloque.appendChild(
    campoTexto("Tu mail", "mail@ejemplo.com", email, (valor) => {
      email = valor;
    }, "email")
  );
  bloque.appendChild(
    campoTexto("Contraseña", "Mínimo 6 caracteres", contrasena, (valor) => {
      contrasena = valor;
    }, "password")
  );

  if (modo === "crear") {
    const avisoMail = document.createElement("p");
    avisoMail.style.cssText = "font-size:13px; color: var(--color-texto-suave); margin-bottom:12px;";
    avisoMail.textContent =
      "Te va a llegar un mail para confirmar tu cuenta. Puede figurar como enviado por \"Supabase\" — es normal, es el mail de confirmación de Desde la Panza (revisá spam si no lo ves).";
    bloque.appendChild(avisoMail);
  }

  if (error) {
    const p = document.createElement("p");
    p.style.cssText = "color: var(--color-rojo); font-size:14px; margin-bottom:12px;";
    p.textContent = error;
    bloque.appendChild(p);
  }
  if (mensaje) {
    const p = document.createElement("p");
    p.style.cssText = "color: var(--color-verde); font-size:14px; margin-bottom:12px;";
    p.textContent = mensaje;
    bloque.appendChild(p);
  }

  const botonPrincipal = document.createElement("button");
  botonPrincipal.className = "boton boton-primario";
  botonPrincipal.textContent = cargando ? "Un momento..." : modo === "login" ? "Entrar" : "Crear cuenta";
  botonPrincipal.disabled = cargando;
  botonPrincipal.addEventListener("click", () => {
    if (modo === "login") entrar(contenedor, navegar);
    else crearCuenta(contenedor, navegar);
  });
  bloque.appendChild(botonPrincipal);

  const botonCambiarModo = document.createElement("button");
  botonCambiarModo.className = "boton boton-texto";
  botonCambiarModo.style.marginTop = "10px";
  botonCambiarModo.textContent =
    modo === "login" ? "¿Todavía no tenés cuenta? Creala acá" : "¿Ya tenés cuenta? Iniciá sesión";
  botonCambiarModo.addEventListener("click", () => {
    modo = modo === "login" ? "crear" : "login";
    error = "";
    mensaje = "";
    dibujar(contenedor, navegar);
  });
  bloque.appendChild(botonCambiarModo);

  if (modo === "login") {
    const botonOlvido = document.createElement("button");
    botonOlvido.className = "boton boton-texto";
    botonOlvido.textContent = "Olvidé mi contraseña";
    botonOlvido.addEventListener("click", () => {
      modo = "recuperar";
      error = "";
      mensaje = "";
      dibujar(contenedor, navegar);
    });
    bloque.appendChild(botonOlvido);
  }

  return bloque;
}

function construirRecuperar(contenedor, navegar) {
  const bloque = document.createElement("div");

  const subtitulo = document.createElement("h2");
  subtitulo.style.cssText = "font-size:17px; text-align:center;";
  subtitulo.textContent = "Recuperar contraseña";
  bloque.appendChild(subtitulo);

  const explicacion = document.createElement("p");
  explicacion.style.textAlign = "center";
  explicacion.textContent = "Te mandamos un mail con un link para crear una nueva.";
  bloque.appendChild(explicacion);

  bloque.appendChild(
    campoTexto("Tu mail", "mail@ejemplo.com", email, (valor) => {
      email = valor;
    }, "email")
  );

  if (error) {
    const p = document.createElement("p");
    p.style.cssText = "color: var(--color-rojo); font-size:14px; margin-bottom:12px;";
    p.textContent = error;
    bloque.appendChild(p);
  }
  if (mensaje) {
    const p = document.createElement("p");
    p.style.cssText = "color: var(--color-verde); font-size:14px; margin-bottom:12px;";
    p.textContent = mensaje;
    bloque.appendChild(p);
  }

  const botonEnviar = document.createElement("button");
  botonEnviar.className = "boton boton-primario";
  botonEnviar.textContent = cargando ? "Un momento..." : "Mandar el mail";
  botonEnviar.disabled = cargando;
  botonEnviar.addEventListener("click", () => mandarRecuperacion(contenedor, navegar));
  bloque.appendChild(botonEnviar);

  const botonVolver = document.createElement("button");
  botonVolver.className = "boton boton-texto";
  botonVolver.style.marginTop = "10px";
  botonVolver.textContent = "Volver a iniciar sesión";
  botonVolver.addEventListener("click", () => {
    modo = "login";
    error = "";
    mensaje = "";
    dibujar(contenedor, navegar);
  });
  bloque.appendChild(botonVolver);

  return bloque;
}

function validarCampos() {
  if (!email.trim() || !email.includes("@")) return "Escribí un mail válido.";
  if (!contrasena || contrasena.length < 6) return "La contraseña tiene que tener al menos 6 caracteres.";
  return "";
}

async function entrar(contenedor, navegar) {
  error = validarCampos();
  if (error) return dibujar(contenedor, navegar);

  cargando = true;
  dibujar(contenedor, navegar);

  const { error: errorSupabase } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: contrasena,
  });

  cargando = false;
  if (errorSupabase) {
    error = traducirError(errorSupabase);
    dibujar(contenedor, navegar);
    return;
  }
  // Si salió bien, onAuthStateChange (en main.js) se encarga de mostrar
  // la pantalla que corresponda. No hace falta hacer nada más acá.
}

async function crearCuenta(contenedor, navegar) {
  error = validarCampos();
  if (error) return dibujar(contenedor, navegar);

  cargando = true;
  dibujar(contenedor, navegar);

  const { data, error: errorSupabase } = await supabase.auth.signUp({
    email: email.trim(),
    password: contrasena,
  });

  cargando = false;
  if (errorSupabase) {
    error = traducirError(errorSupabase);
    dibujar(contenedor, navegar);
    return;
  }

  if (!data.session) {
    // El proyecto pide confirmar el mail antes de poder entrar.
    modo = "login";
    mensaje =
      "¡Listo! Te mandamos un mail para confirmar tu cuenta de Desde la Panza (puede figurar como enviado por \"Supabase\", revisá spam si no lo ves). Confirmalo y volvé a entrar acá.";
    dibujar(contenedor, navegar);
    return;
  }
  // Si ya vino con sesión (no pide confirmar mail), onAuthStateChange se
  // encarga de seguir.
}

async function mandarRecuperacion(contenedor, navegar) {
  if (!email.trim() || !email.includes("@")) {
    error = "Escribí un mail válido.";
    return dibujar(contenedor, navegar);
  }
  error = "";
  cargando = true;
  dibujar(contenedor, navegar);

  const { error: errorSupabase } = await supabase.auth.resetPasswordForEmail(email.trim());

  cargando = false;
  if (errorSupabase) {
    error = traducirError(errorSupabase);
    dibujar(contenedor, navegar);
    return;
  }
  mensaje = "Listo, revisá tu mail.";
  dibujar(contenedor, navegar);
}

function traducirError(errorSupabase) {
  const texto = errorSupabase.message || "";
  if (texto.includes("Invalid login credentials")) return "El mail o la contraseña no son correctos.";
  if (texto.includes("User already registered")) return "Ese mail ya tiene una cuenta. Iniciá sesión.";
  if (texto.includes("Password should be at least")) return "La contraseña tiene que tener al menos 6 caracteres.";
  if (texto.toLowerCase().includes("network")) return "No hay conexión a internet. Probá de nuevo.";
  if (texto.toLowerCase().includes("rate limit")) return "Se mandaron demasiados mails en poco tiempo. Esperá un ratito y probá de nuevo.";
  return "No pudimos completar la acción. Probá de nuevo en un momento.";
}
