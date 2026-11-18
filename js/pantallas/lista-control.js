import { obtenerPerfil, estaMarcada, marcarTarea } from "../almacenamiento.js";
import { hoy, aFecha, aIso } from "../fechas.js";
import { controlPorMes, CUANDO_CONSULTAR_SIN_ESPERAR } from "../contenido-lista-control.js";
import { vacunasDelMes } from "../contenido-calendario.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

export function render(contenedor, { navegar, parametro }) {
  const perfil = obtenerPerfil();
  const [mesTexto, consulta] = (parametro || "").split("?");
  const mes = Number(mesTexto);
  const indiceBebe = Number(new URLSearchParams(consulta || "").get("bebe") || 0);

  if (perfil.etapa !== "bebe" || !controlPorMes(mes)) {
    navegar("#/inicio");
    return;
  }

  dibujar(contenedor, navegar, perfil, mes, indiceBebe);
}

function idHito(bebeIndice, mes, indice) {
  return `hito-b${bebeIndice}-mes${mes}-${indice}`;
}

function dibujar(contenedor, navegar, perfil, mes, indiceBebe) {
  const bebe = perfil.bebes[indiceBebe] || perfil.bebes[0];
  const control = controlPorMes(mes);
  const vacunas = vacunasDelMes(mes, perfil.fechaNacimiento);

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos">
      <h1>Para el control de los ${mes} meses</h1>
      <p class="subtitulo">${bebe.nombre} · lista para llevar</p>
    </div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(encabezado);

  const banner = document.createElement("div");
  banner.className = "tarjeta tarjeta-panel";
  banner.style.cssText = "display:flex; gap:14px; align-items:center;";
  banner.innerHTML = `
    <div class="icono-redondo" style="width:48px;height:48px;">${iconos.portapapeles}</div>
    <div>
      <h3 style="margin-bottom:2px;">Mostrale esta lista al pediatra</h3>
      <p style="margin:0;">Así no te olvidás de nada en la consulta.</p>
    </div>
  `;
  pantalla.appendChild(banner);

  const tituloHitos = document.createElement("h2");
  tituloHitos.textContent = `Lo que hace ${bebe.nombre}`;
  pantalla.appendChild(tituloHitos);

  const tarjetaHitos = document.createElement("div");
  tarjetaHitos.className = "tarjeta";
  const intro = document.createElement("p");
  intro.style.cssText = "border-bottom:1px solid var(--color-borde); padding-bottom:12px; margin-bottom:4px;";
  intro.textContent = `Lo que hacen ${control.proporcion} a los ${mes} meses. Cada bebé tiene su ritmo.`;
  tarjetaHitos.appendChild(intro);

  control.hitos.forEach((hito, indice) => {
    tarjetaHitos.appendChild(filaHito(hito, idHito(indiceBebe, mes, indice), contenedor, navegar, perfil, mes, indiceBebe));
  });
  pantalla.appendChild(tarjetaHitos);

  if (vacunas.length > 0) {
    const tituloVacunas = document.createElement("h2");
    tituloVacunas.textContent = "Vacunas de este control";
    pantalla.appendChild(tituloVacunas);

    const tarjetaVacunas = document.createElement("div");
    tarjetaVacunas.className = "tarjeta";
    vacunas.forEach((v, indice) => {
      if (indice > 0) {
        const sep = document.createElement("hr");
        sep.style.cssText = "border:none; border-top:1px solid var(--color-borde); margin:12px 0;";
        tarjetaVacunas.appendChild(sep);
      }
      const fila = document.createElement("div");
      fila.innerHTML = `<p style="font-weight:700; margin:0 0 2px 0;">${v.nombre}</p><p style="margin:0; font-size:14px;">${v.detalle}</p>`;
      tarjetaVacunas.appendChild(fila);
    });
    pantalla.appendChild(tarjetaVacunas);
  }

  const tituloPreguntas = document.createElement("h2");
  tituloPreguntas.textContent = "Preguntas para el pediatra";
  pantalla.appendChild(tituloPreguntas);

  const tarjetaPreguntas = document.createElement("div");
  tarjetaPreguntas.className = "tarjeta";
  control.preguntas.forEach((pregunta, indice) => {
    if (indice > 0) {
      const sep = document.createElement("hr");
      sep.style.cssText = "border:none; border-top:1px solid var(--color-borde); margin:10px 0;";
      tarjetaPreguntas.appendChild(sep);
    }
    const p = document.createElement("p");
    p.style.margin = "0";
    p.textContent = `• ${pregunta}`;
    tarjetaPreguntas.appendChild(p);
  });
  pantalla.appendChild(tarjetaPreguntas);

  const tituloAlarma = document.createElement("h2");
  tituloAlarma.textContent = "¿Cuándo consultar sin esperar al control?";
  pantalla.appendChild(tituloAlarma);

  const listaAlarma = document.createElement("ul");
  listaAlarma.className = "lista-senales";
  CUANDO_CONSULTAR_SIN_ESPERAR.forEach((senal) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="punto">!</span><span>${senal}</span>`;
    listaAlarma.appendChild(li);
  });
  pantalla.appendChild(listaAlarma);

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = "Fuente: hitos de desarrollo (CDC 2022) y Calendario Nacional de Vacunación. Esta app no diagnostica ni reemplaza a tu pediatra.";
  pantalla.appendChild(legal);

  contenedor.appendChild(pantalla);
}

function filaHito(texto, id, contenedor, navegar, perfil, mes, indiceBebe) {
  const hecho = estaMarcada(id);
  const fila = document.createElement("div");
  fila.style.cssText = "padding:12px 0; border-top:1px solid var(--color-borde);";
  fila.innerHTML = `
    <p style="font-weight:700; margin-bottom:8px;">${texto}</p>
    <div class="grupo-opciones" style="margin-bottom:0;">
      <button class="chip ${hecho ? "activo" : ""}" data-opcion="si">Lo hace</button>
      <button class="chip ${!hecho ? "activo" : ""}" data-opcion="no">Todavía no</button>
    </div>
  `;
  fila.querySelector('[data-opcion="si"]').addEventListener("click", () => {
    marcarTarea(id, true, aIso(hoy()));
    dibujar(contenedor, navegar, perfil, mes, indiceBebe);
  });
  fila.querySelector('[data-opcion="no"]').addEventListener("click", () => {
    marcarTarea(id, false, null);
    dibujar(contenedor, navegar, perfil, mes, indiceBebe);
  });
  return fila;
}
