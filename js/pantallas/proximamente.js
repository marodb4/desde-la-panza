import { iconos } from "../iconos.js";
import { montarNavInferior } from "./nav-inferior.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

const TITULOS = {
  calendario: "Calendario",
  recuerdos: "Recuerdos",
  crecimiento: "Crecimiento",
};

export function render(contenedor, { navegar, parametro }) {
  const titulo = TITULOS[parametro] || "Próximamente";

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla";
  pantalla.innerHTML = `
    <div class="centro mt-grande">
      <div style="font-size:56px;">🌙</div>
      <h2>${titulo}</h2>
      <p>Esta pantalla se programa en una próxima parte del proyecto.<br>Por ahora podés usar Inicio.</p>
      <button class="boton boton-secundario" style="margin-top:10px;">${iconos.casa} Volver a Inicio</button>
    </div>
  `;
  pantalla.appendChild(construirMarcaDeAgua());
  pantalla.querySelector("button").addEventListener("click", () => navegar("#/inicio"));

  contenedor.appendChild(pantalla);
  montarNavInferior(contenedor, parametro, navegar);
}
