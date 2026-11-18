import { obtenerPerfil, guardarRecordatorio } from "../almacenamiento.js";
import { hoy, aIso } from "../fechas.js";
import { chip, campoTexto } from "./piezas-formulario.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let estado = null;

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();
  estado = {
    paraQuien: "mama",
    que: "",
    comoIndicado: "",
    horarios: ["09:00"],
    hastaCuando: "fecha",
    fechaFin: "",
    error: "",
  };
  dibujar(contenedor, navegar, perfil);
}

function dibujar(contenedor, navegar, perfil) {
  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos"><h1>Nuevo recordatorio</h1></div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/mis-recordatorios"));
  pantalla.appendChild(encabezado);

  const info = document.createElement("div");
  info.className = "tarjeta";
  info.style.background = "var(--color-ciruela-tinte)";
  info.style.display = "flex";
  info.style.gap = "12px";
  info.innerHTML = `
    <div style="font-size:28px; flex-shrink:0;">💊</div>
    <p style="margin:0; color:var(--color-texto);">Copiá lo que te indicó el médico. <strong>La app no sugiere dosis:</strong> solo te avisa a la hora que vos pongas.</p>
  `;
  pantalla.appendChild(info);

  const campoPara = document.createElement("div");
  campoPara.className = "campo";
  campoPara.innerHTML = `<label>¿Para quién es?</label>`;
  const chipsPara = document.createElement("div");
  chipsPara.className = "grupo-opciones";
  const opcionesPara = [["mama", "Para mí"]];
  if (perfil.etapa === "bebe") {
    perfil.bebes.forEach((b, indice) => opcionesPara.push([String(indice), b.nombre]));
  }
  opcionesPara.forEach(([valor, etiqueta]) => {
    chipsPara.appendChild(
      chip(etiqueta, estado.paraQuien === valor, () => {
        estado.paraQuien = valor;
        dibujar(contenedor, navegar, perfil);
      })
    );
  });
  campoPara.appendChild(chipsPara);
  pantalla.appendChild(campoPara);

  pantalla.appendChild(
    campoTexto("¿Qué es?", "Ej.: Vitamina D, hierro, antibiótico", estado.que, (v) => (estado.que = v))
  );

  const campoComo = document.createElement("div");
  campoComo.className = "campo";
  campoComo.innerHTML = `
    <label>¿Cómo te lo indicaron?</label>
    <textarea placeholder="Ej.: 5 gotitas en la mañana" rows="3" style="width:100%; border-radius:18px; border:1px solid var(--color-borde); padding:12px 16px; font-family:var(--fuente-texto); font-size:16px; resize:vertical;"></textarea>
  `;
  campoComo.querySelector("textarea").value = estado.comoIndicado;
  campoComo.querySelector("textarea").addEventListener("input", (e) => (estado.comoIndicado = e.target.value));
  pantalla.appendChild(campoComo);

  const campoHorarios = document.createElement("div");
  campoHorarios.className = "campo";
  campoHorarios.innerHTML = `<label>¿A qué hora te aviso?</label>`;
  estado.horarios.forEach((horario, indice) => {
    const fila = document.createElement("div");
    fila.style.cssText = "display:flex; gap:10px; margin-bottom:10px; align-items:center;";
    const input = document.createElement("input");
    input.type = "time";
    input.value = horario;
    input.style.cssText = "flex:1; min-height:48px; border-radius:18px; border:1px solid var(--color-borde); padding:10px 16px; font-family:var(--fuente-texto); font-size:16px;";
    input.addEventListener("input", (e) => (estado.horarios[indice] = e.target.value));
    fila.appendChild(input);
    if (estado.horarios.length > 1) {
      const botonQuitar = document.createElement("button");
      botonQuitar.innerHTML = iconos.cerrar;
      botonQuitar.setAttribute("aria-label", "Quitar este horario");
      botonQuitar.style.cssText = "background:none; border:none; width:24px; height:24px; color:var(--color-texto-suave); cursor:pointer;";
      botonQuitar.addEventListener("click", () => {
        estado.horarios.splice(indice, 1);
        dibujar(contenedor, navegar, perfil);
      });
      fila.appendChild(botonQuitar);
    }
    campoHorarios.appendChild(fila);
  });
  const botonOtroHorario = document.createElement("button");
  botonOtroHorario.className = "boton-agregar-item";
  botonOtroHorario.style.cssText = "border:1px dashed var(--color-borde); border-radius:999px; padding:10px 18px; width:auto;";
  botonOtroHorario.textContent = "+ Otro horario";
  botonOtroHorario.addEventListener("click", () => {
    estado.horarios.push("09:00");
    dibujar(contenedor, navegar, perfil);
  });
  campoHorarios.appendChild(botonOtroHorario);
  pantalla.appendChild(campoHorarios);

  const campoHasta = document.createElement("div");
  campoHasta.className = "campo";
  campoHasta.innerHTML = `<label>¿Hasta cuándo?</label>`;
  const chipsHasta = document.createElement("div");
  chipsHasta.className = "grupo-opciones";
  [
    ["fecha", "Hasta una fecha"],
    ["indefinido", "Hasta que lo saque"],
  ].forEach(([valor, etiqueta]) => {
    chipsHasta.appendChild(
      chip(etiqueta, estado.hastaCuando === valor, () => {
        estado.hastaCuando = valor;
        dibujar(contenedor, navegar, perfil);
      })
    );
  });
  campoHasta.appendChild(chipsHasta);
  pantalla.appendChild(campoHasta);

  if (estado.hastaCuando === "fecha") {
    pantalla.appendChild(campoTexto("", "", estado.fechaFin, (v) => (estado.fechaFin = v), "date"));
  }

  if (estado.error) {
    const error = document.createElement("p");
    error.style.cssText = "color:var(--color-rojo); font-weight:700;";
    error.textContent = estado.error;
    pantalla.appendChild(error);
  }

  const botonGuardar = document.createElement("button");
  botonGuardar.className = "boton boton-primario";
  botonGuardar.textContent = "Guardar recordatorio";
  botonGuardar.addEventListener("click", () => {
    if (!estado.que.trim()) {
      estado.error = "Contanos qué es.";
      return dibujar(contenedor, navegar, perfil);
    }
    if (estado.hastaCuando === "fecha" && !estado.fechaFin) {
      estado.error = "Elegí una fecha, o tocá \"Hasta que lo saque\".";
      return dibujar(contenedor, navegar, perfil);
    }
    guardarRecordatorio({
      paraQuien: estado.paraQuien === "mama" ? "mama" : Number(estado.paraQuien),
      que: estado.que.trim(),
      comoIndicado: estado.comoIndicado.trim(),
      horarios: estado.horarios,
      hastaCuando: estado.hastaCuando,
      fechaFin: estado.hastaCuando === "fecha" ? estado.fechaFin : null,
      creadoEl: aIso(hoy()),
    });
    navegar("#/mis-recordatorios");
  });
  pantalla.appendChild(botonGuardar);

  const nota = document.createElement("p");
  nota.style.cssText = "text-align:center; font-size:13px; color:var(--color-texto-suave); margin-top:10px;";
  nota.textContent = "También sirve para turnos: dentista, ecografía, lo que necesites.";
  pantalla.appendChild(nota);

  contenedor.appendChild(pantalla);
}
