import { obtenerPerfil } from "../almacenamiento.js";
import { guardarFotoPerfil, obtenerFotoPerfil } from "../almacen-fotos.js";
import { ilustracionPorDefecto } from "../ilustraciones-bienvenida.js";

export async function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  const { fotoId, nombre } = datosDePerfil(perfil);
  let foto = null;
  try {
    foto = await obtenerFotoPerfil(fotoId);
  } catch (error) {
    // Si falla (por ejemplo, otra pestaña vieja de la app abierta bloqueando
    // la base), seguimos sin foto en vez de dejar la pantalla en blanco.
  }
  dibujar(contenedor, navegar, perfil, fotoId, nombre, foto);
}

function datosDePerfil(perfil) {
  if (perfil.etapa === "embarazo") {
    return { fotoId: "mama", nombre: perfil.nombreMama };
  }
  if (perfil.mellizos) {
    return { fotoId: "familia", nombre: perfil.bebes.map((b) => b.nombre).join(" y ") };
  }
  return { fotoId: "bebe-0", nombre: perfil.bebes[0].nombre };
}

function dibujar(contenedor, navegar, perfil, fotoId, nombre, foto) {
  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.style.cssText = "display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; flex:1;";

  const circulo = document.createElement("button");
  circulo.setAttribute("aria-label", foto ? "Cambiar foto" : "Agregar foto");
  circulo.style.cssText =
    "width:190px; height:190px; border-radius:50%; border:none; padding:0; overflow:hidden; cursor:pointer; background:var(--color-terracota); box-shadow: var(--sombra-suave);";
  if (foto) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(foto);
    img.style.cssText = "width:100%; height:100%; object-fit:cover;";
    circulo.appendChild(img);
  } else {
    circulo.innerHTML = ilustracionPorDefecto(perfil, perfil.etapa === "bebe" ? perfil.bebes[0] : null);
  }

  const inputFoto = document.createElement("input");
  inputFoto.type = "file";
  inputFoto.accept = "image/*";
  inputFoto.style.display = "none";
  inputFoto.addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    try {
      await guardarFotoPerfil(fotoId, archivo);
    } catch (error) {
      alert("No se pudo guardar la foto. Si tenés otra pestaña de la app abierta, cerrala y probá de nuevo.");
      return;
    }
    const nuevaFoto = await obtenerFotoPerfil(fotoId).catch(() => archivo);
    dibujar(contenedor, navegar, perfil, fotoId, nombre, nuevaFoto);
  });
  circulo.addEventListener("click", () => inputFoto.click());

  const titulo = document.createElement("h1");
  titulo.style.marginTop = "26px";
  titulo.innerHTML =
    perfil.etapa === "embarazo" ? `¡Hola, ${nombre}!` : `¡Hola, familia de ${nombre}!`;

  const subtitulo = document.createElement("p");
  subtitulo.style.cssText = "color:var(--color-texto-suave); margin-bottom: 22px;";
  subtitulo.textContent = "De tu embarazo a sus primeros pasos.";

  const enlaceFoto = document.createElement("button");
  enlaceFoto.className = "boton boton-texto";
  enlaceFoto.style.cssText = "width:auto; margin-bottom: 8px;";
  enlaceFoto.textContent = foto ? "Cambiar foto" : "Agregar una foto";
  enlaceFoto.addEventListener("click", () => inputFoto.click());

  const botonContinuar = document.createElement("button");
  botonContinuar.className = "boton boton-primario";
  botonContinuar.style.cssText = "width:220px; margin-top: 10px;";
  botonContinuar.textContent = "Continuar";
  botonContinuar.addEventListener("click", () => navegar("#/inicio"));

  pantalla.append(circulo, inputFoto, titulo, subtitulo, enlaceFoto, botonContinuar);
  contenedor.appendChild(pantalla);
}
