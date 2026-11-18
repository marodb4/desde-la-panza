// Activación del pago único (Parte 5): la clienta pega el número de
// operación de Mercado Pago que figura en su comprobante de Impultienda, y
// una función del servidor (Supabase Edge Function "activar-pago") lo
// verifica de verdad contra Mercado Pago. El token secreto nunca llega a
// este archivo ni a ningún celular.
import { supabase } from "../supabase-cliente.js";
import { campoTexto } from "./piezas-formulario.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let numeroOperacion = "";
let error = "";
let cargando = false;

export function render(contenedor, { navegar, alActivar }) {
  numeroOperacion = "";
  error = "";
  cargando = false;
  dibujar(contenedor, navegar, alActivar);
}

function dibujar(contenedor, navegar, alActivar) {
  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  pantalla.innerHTML += `
    <div class="centro" style="margin-bottom: 18px;">
      <div style="font-size: 64px; line-height: 1;">🧾</div>
    </div>
    <h1 class="centro">¡Ya casi!</h1>
    <h2 style="font-size:17px; text-align:center;">Activá tu acceso</h2>
    <p style="text-align:center;">Pegá el número de operación de Mercado Pago que figura en tu comprobante de compra.</p>
  `;

  pantalla.appendChild(
    campoTexto("Número de operación", "Ej: 123456789012", numeroOperacion, (valor) => {
      numeroOperacion = valor;
    })
  );

  if (error) {
    const p = document.createElement("p");
    p.style.cssText = "color: var(--color-rojo); font-size:14px; margin-bottom:12px;";
    p.textContent = error;
    pantalla.appendChild(p);
  }

  const boton = document.createElement("button");
  boton.className = "boton boton-primario";
  boton.textContent = cargando ? "Verificando..." : "Activar";
  boton.disabled = cargando;
  boton.addEventListener("click", () => verificar(contenedor, navegar, alActivar));
  pantalla.appendChild(boton);

  const botonCerrarSesion = document.createElement("button");
  botonCerrarSesion.className = "boton boton-texto";
  botonCerrarSesion.style.marginTop = "10px";
  botonCerrarSesion.textContent = "No es mi cuenta, cerrar sesión";
  botonCerrarSesion.addEventListener("click", () => supabase.auth.signOut());
  pantalla.appendChild(botonCerrarSesion);

  contenedor.appendChild(pantalla);
}

async function verificar(contenedor, navegar, alActivar) {
  if (!numeroOperacion.trim()) {
    error = "Pegá el número de operación.";
    return dibujar(contenedor, navegar, alActivar);
  }
  error = "";
  cargando = true;
  dibujar(contenedor, navegar, alActivar);

  try {
    const { data, error: errorFuncion } = await supabase.functions.invoke("activar-pago", {
      body: { numeroOperacion: numeroOperacion.trim() },
    });

    cargando = false;

    if (errorFuncion) {
      error = "No pudimos conectar para verificar el pago. Probá de nuevo en un momento.";
      return dibujar(contenedor, navegar, alActivar);
    }
    if (!data?.ok) {
      error = data?.error || "No pudimos verificar ese número de operación.";
      return dibujar(contenedor, navegar, alActivar);
    }

    alActivar();
  } catch (e) {
    cargando = false;
    error = "No pudimos conectar para verificar el pago. Probá de nuevo en un momento.";
    dibujar(contenedor, navegar, alActivar);
  }
}
