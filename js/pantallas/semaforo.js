import { buscarAlimentos } from "../contenido-semaforo.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let texto = "";
let filtro = "todos";

export function render(contenedor, { navegar }) {
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
    <div class="titulos">
      <h1>¿Le puedo dar...?</h1>
      <p class="subtitulo">Semáforo de alimentos</p>
    </div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/comidas"));
  pantalla.appendChild(encabezado);

  const buscador = document.createElement("div");
  buscador.className = "buscador";
  buscador.innerHTML = `${iconos.lupa}<input type="text" placeholder="Escribí: dulce de leche, huevo, miel..." />`;
  const input = buscador.querySelector("input");
  input.value = texto;
  input.addEventListener("input", (e) => {
    texto = e.target.value;
    dibujar(contenedor, navegar);
  });
  pantalla.appendChild(buscador);

  const chips = document.createElement("div");
  chips.className = "grupo-opciones";
  [
    ["todos", "Todos"],
    ["no", "No"],
    ["cuidado", "Con cuidado"],
    ["si", "Sí"],
  ].forEach(([id, etiqueta]) => {
    const chip = document.createElement("button");
    chip.className = `chip ${filtro === id ? "activo" : ""}`;
    chip.textContent = etiqueta;
    chip.addEventListener("click", () => {
      filtro = id;
      dibujar(contenedor, navegar);
    });
    chips.appendChild(chip);
  });
  pantalla.appendChild(chips);

  const resultados = buscarAlimentos(texto, filtro);

  const contador = document.createElement("p");
  contador.className = "contador-resultados";
  contador.textContent = `${resultados.length} alimento${resultados.length === 1 ? "" : "s"}`;
  pantalla.appendChild(contador);

  if (resultados.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.textContent = "No encontré ese alimento. Probá buscarlo con otro nombre.";
    pantalla.appendChild(vacio);
  } else {
    resultados.forEach((alimento) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = `tarjeta-alimento estado-${alimento.estado}`;
      tarjeta.innerHTML = `
        <span class="pastilla-estado">${alimento.etiqueta}</span>
        <h3>${alimento.nombre}</h3>
        <p>${alimento.porque}</p>
      `;
      pantalla.appendChild(tarjeta);
    });
  }

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = "Fuente: recomendaciones generales de alimentación complementaria (SAP / Ministerio de Salud). Esta app no reemplaza a tu pediatra ni a una nutricionista.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
}
