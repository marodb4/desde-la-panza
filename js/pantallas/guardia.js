import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

const SENALES = [
  "Sangrado por la vagina",
  "Pérdida de líquido, aunque sea poquito",
  "Fiebre",
  "Dolor de panza fuerte o que no se va",
  "Dolor de cabeza muy fuerte, visión borrosa o lucecitas, o hinchazón brusca de cara y manos",
  "Tu bebé se mueve menos de lo habitual (desde la semana 28)",
  "Contracciones regulares antes de la semana 37",
];

export function render(contenedor, { navegar }) {
  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos">
      <h1>¿Cuándo voy a la guardia?</h1>
      <p class="subtitulo">Embarazo</p>
    </div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(encabezado);

  const alerta = document.createElement("div");
  alerta.className = "alerta";
  alerta.style.cursor = "default";
  alerta.innerHTML = `
    <div>
      <div style="font-weight:800; margin-bottom:4px;">Si te pasa algo de esto, andá a la guardia de tu maternidad</div>
      <div style="font-weight:600; opacity:0.85;">No esperes al próximo control.</div>
    </div>
  `;
  pantalla.appendChild(alerta);

  const lista = document.createElement("ul");
  lista.className = "lista-senales";
  SENALES.forEach((senal) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="punto">!</span><span>${senal}</span>`;
    lista.appendChild(li);
  });
  pantalla.appendChild(lista);

  const aviso = document.createElement("p");
  aviso.style.fontWeight = "700";
  aviso.textContent = "Llevá siempre: DNI, carnet perinatal y últimos estudios.";
  pantalla.appendChild(aviso);

  const emergencias = document.createElement("div");
  emergencias.className = "emergencias";
  emergencias.innerHTML = `
    <a class="boton-emergencia same" href="tel:107">
      <span class="numero">107</span>
      <span class="leyenda">Emergencias (SAME)</span>
    </a>
    <a class="boton-emergencia general" href="tel:911">
      <span class="numero">911</span>
      <span class="leyenda">Emergencias</span>
    </a>
  `;
  pantalla.appendChild(emergencias);

  contenedor.appendChild(pantalla);
}
