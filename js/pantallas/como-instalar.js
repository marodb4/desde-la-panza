// Aviso de "cómo instalar la app" (Parte 6). Aparece una sola vez (y queda
// accesible siempre desde Editar datos), detectando automáticamente el
// celular para mostrar los pasos correctos.
const CLAVE_MOSTRADO = "dlp_como_instalar_mostrado";

function detectarPlataforma() {
  const ua = navigator.userAgent;
  const esIOS = /iPad|iPhone|iPod/.test(ua);
  const esOtroNavegadorEnIOS = esIOS && /CriOS|FxiOS|EdgiOS/.test(ua);
  const esAndroid = /Android/.test(ua);

  if (esIOS && esOtroNavegadorEnIOS) return "ios-no-safari";
  if (esIOS) return "ios-safari";
  if (esAndroid) return "android";
  return "otro";
}

export function yaEstaInstalada() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
}

/** Solo la primera vez (y nunca si ya está instalada o es una compu). */
export function debeMostrarComoInstalar() {
  if (yaEstaInstalada()) return false;
  if (detectarPlataforma() === "otro") return false;
  return !localStorage.getItem(CLAVE_MOSTRADO);
}

export function render(contenedor, { navegar }) {
  localStorage.setItem(CLAVE_MOSTRADO, "1");
  dibujar(contenedor, navegar);
}

/** Para abrirlo de nuevo a propósito desde Editar datos, sin el "una sola vez". */
export function renderSiempre(contenedor, { navegar }) {
  dibujar(contenedor, navegar);
}

function dibujar(contenedor, navegar) {
  const plataforma = detectarPlataforma();

  const superposicion = document.createElement("div");
  superposicion.className = "superposicion";

  const hoja = document.createElement("div");
  hoja.className = "hoja";
  hoja.style.textAlign = "left";

  const titulo = document.createElement("h2");
  titulo.className = "centro";
  titulo.textContent = "📲 Instalá la app";
  hoja.appendChild(titulo);

  const subtitulo = document.createElement("p");
  subtitulo.className = "centro";
  subtitulo.textContent = "Así la tenés como cualquier otra app, con su ícono, sin tener que buscar el link cada vez.";
  hoja.appendChild(subtitulo);

  const pasos = document.createElement("div");
  pasos.style.margin = "16px 0";

  if (plataforma === "ios-no-safari") {
    pasos.innerHTML = `
      <div class="tarjeta" style="margin-bottom:10px;">
        <p style="margin:0;"><strong>Para instalarla en el iPhone, primero tenés que abrirla con Safari</strong> (no con Chrome ni otro navegador — en el iPhone, solo Safari puede instalar apps así).</p>
      </div>
      <div class="tarjeta">
        <p style="margin:0 0 6px 0;"><strong>1.</strong> Copiá este link y pegalo en Safari:</p>
        <p style="margin:0; font-size:14px; word-break:break-all; color: var(--color-texto-suave);">${location.origin}${location.pathname}</p>
      </div>
    `;
  } else if (plataforma === "ios-safari") {
    pasos.innerHTML = `
      <div class="tarjeta" style="margin-bottom:10px;"><p style="margin:0;"><strong>1.</strong> Tocá el botón de <strong>Compartir</strong> (el cuadradito con la flecha hacia arriba), abajo en el medio de la pantalla.</p></div>
      <div class="tarjeta" style="margin-bottom:10px;"><p style="margin:0;"><strong>2.</strong> Buscá la opción <strong>"Agregar a pantalla de inicio"</strong> (puede estar un poco más abajo en la lista).</p></div>
      <div class="tarjeta"><p style="margin:0;"><strong>3.</strong> Tocá <strong>"Agregar"</strong> arriba a la derecha. Listo.</p></div>
    `;
  } else if (plataforma === "android") {
    pasos.innerHTML = `
      <div class="tarjeta" style="margin-bottom:10px;"><p style="margin:0;"><strong>1.</strong> Tocá los <strong>tres puntitos</strong> arriba a la derecha de Chrome.</p></div>
      <div class="tarjeta"><p style="margin:0;"><strong>2.</strong> Elegí <strong>"Instalar app"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.</p></div>
    `;
  }
  hoja.appendChild(pasos);

  const botonCerrar = document.createElement("button");
  botonCerrar.className = "boton boton-primario";
  botonCerrar.textContent = "Entendido";
  botonCerrar.addEventListener("click", () => navegar("#/inicio"));
  hoja.appendChild(botonCerrar);

  superposicion.appendChild(hoja);
  contenedor.appendChild(superposicion);
}
