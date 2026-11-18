import { obtenerPerfil, obtenerMediciones, agregarMedicion, eliminarMedicion, tomarAperturaFormularioCrecimiento } from "../almacenamiento.js";
import { hoy, aFecha, aIso, edadCorregidaEnDias, diferenciaDias, edadEnMesesExactos, formatearFechaCorta } from "../fechas.js";
import { tablaPorSexo, percentilesEnEdad, ubicarFranja } from "../contenido-crecimiento-oms.js";
import { campoTexto } from "./piezas-formulario.js";
import { montarNavInferior } from "./nav-inferior.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

let indiceBebeSeleccionado = 0;
let metricaActiva = "peso";
let formulario = null; // null = cerrado; objeto = abierto

const METRICAS = [
  { id: "peso", etiqueta: "Peso", unidad: "kg", decimales: 1, campo: "pesoKg" },
  { id: "talla", etiqueta: "Talla", unidad: "cm", decimales: 0, campo: "tallaCm" },
  { id: "perimetro", etiqueta: "Cabeza", unidad: "cm", decimales: 1, campo: "perimetroCm" },
];

export function render(contenedor, { navegar }) {
  const perfil = obtenerPerfil();

  if (perfil.etapa !== "bebe") {
    contenedor.innerHTML = "";
    const pantalla = document.createElement("div");
    pantalla.className = "pantalla";
    pantalla.innerHTML = `
      <div class="centro mt-grande">
        <div style="font-size:56px;">🌱</div>
        <h2>Crecimiento</h2>
        <p>Esto se activa cuando nazca tu bebé. Mientras tanto, podés ver el tamaño semana a semana en Inicio.</p>
        <button class="boton boton-secundario" style="margin-top:10px;">Volver a Inicio</button>
      </div>
    `;
    pantalla.appendChild(construirMarcaDeAgua());
    pantalla.querySelector("button").addEventListener("click", () => navegar("#/inicio"));
    contenedor.appendChild(pantalla);
    montarNavInferior(contenedor, "crecimiento", navegar);
    return;
  }

  if (indiceBebeSeleccionado >= perfil.bebes.length) indiceBebeSeleccionado = 0;

  const pedido = tomarAperturaFormularioCrecimiento();
  if (pedido !== null && pedido < perfil.bebes.length) {
    indiceBebeSeleccionado = pedido;
    abrirFormulario();
  }

  dibujar(contenedor, navegar, perfil);
}

function abrirFormulario() {
  formulario = { fecha: aIso(hoy()), pesoKg: "", tallaCm: "", perimetroCm: "", error: "" };
}

function dibujar(contenedor, navegar, perfil) {
  const bebe = perfil.bebes[indiceBebeSeleccionado];
  const fechaNacimiento = aFecha(perfil.fechaNacimiento);
  const mediciones = obtenerMediciones(indiceBebeSeleccionado);
  const sexoTabla = bebe.sexo === "nino" ? "nino" : "nina";

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla";

  pantalla.appendChild(construirMarcaDeAgua());
  const contenido = pantalla;

  // --- Encabezado ---
  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-crecimiento";
  const ultima = mediciones[mediciones.length - 1];
  const subtitulo = ultima
    ? `Último control: ${formatearFechaCorta(aFecha(ultima.fecha))} (${edadSimpleMeses(edadEnMesesExactos(diasCorregidosEn(ultima.fecha, fechaNacimiento, bebe)))})`
    : "Todavía no cargaste ninguna medición.";
  encabezado.innerHTML = `
    <div><h1>Crecimiento</h1><p class="subtitulo">${subtitulo}</p></div>
  `;
  const botonMas = document.createElement("button");
  botonMas.className = "boton-mas";
  botonMas.setAttribute("aria-label", "Cargar medición");
  botonMas.textContent = "+";
  botonMas.addEventListener("click", () => {
    abrirFormulario();
    dibujar(contenedor, navegar, perfil);
  });
  encabezado.appendChild(botonMas);
  contenido.appendChild(encabezado);

  // --- Selector de mellizos ---
  if (perfil.mellizos) {
    const selector = document.createElement("div");
    selector.className = "selector-mellizos";
    perfil.bebes.forEach((b, indice) => {
      const boton = document.createElement("button");
      boton.className = `selector-mellizos-item ${indice === indiceBebeSeleccionado ? "activo" : ""}`;
      boton.textContent = b.nombre;
      boton.addEventListener("click", () => {
        indiceBebeSeleccionado = indice;
        dibujar(contenedor, navegar, perfil);
      });
      selector.appendChild(boton);
    });
    contenido.appendChild(selector);
  }

  // --- Tarjetas de métricas ---
  const tarjetas = document.createElement("div");
  tarjetas.className = "tarjetas-metricas";
  METRICAS.forEach((metrica) => {
    const ultimoValor = [...mediciones].reverse().find((m) => m[metrica.campo] != null);
    const tarjeta = document.createElement("button");
    tarjeta.className = `tarjeta-metrica ${metrica.id === metricaActiva ? "activa" : ""}`;
    tarjeta.innerHTML = `
      <span class="etiqueta-metrica">${metrica.etiqueta}</span>
      <span class="valor-metrica">${ultimoValor ? formatearNumero(ultimoValor[metrica.campo], metrica.decimales) + " " + metrica.unidad : "—"}</span>
    `;
    tarjeta.addEventListener("click", () => {
      metricaActiva = metrica.id;
      dibujar(contenedor, navegar, perfil);
    });
    tarjetas.appendChild(tarjeta);
  });
  contenido.appendChild(tarjetas);

  // --- Gráfico ---
  const metrica = METRICAS.find((m) => m.id === metricaActiva);
  const tabla = tablaPorSexo(sexoTabla, metrica.id);
  const diasCorregidosHoy = edadCorregidaEnDias(fechaNacimiento, bebe.semanasAlNacer, hoy());
  const mesesHoy = edadEnMesesExactos(diasCorregidosHoy);

  const puntosBebe = mediciones
    .filter((m) => m[metrica.campo] != null)
    .map((m) => ({
      meses: edadEnMesesExactos(diasCorregidosEn(m.fecha, fechaNacimiento, bebe)),
      valor: m[metrica.campo],
    }));

  const tarjetaGrafico = document.createElement("div");
  tarjetaGrafico.className = "tarjeta tarjeta-grafico";
  tarjetaGrafico.innerHTML = `<h3>${metrica.etiqueta} según la edad (${metrica.unidad})</h3>`;

  if (puntosBebe.length === 0) {
    const vacio = document.createElement("p");
    vacio.className = "vacio";
    vacio.style.padding = "20px 0";
    vacio.textContent = "Todavía no cargaste ninguna medición. Tocá el botón + para agregar la primera.";
    tarjetaGrafico.appendChild(vacio);
  } else {
    const contenedorSvg = document.createElement("div");
    contenedorSvg.innerHTML = construirGraficoSVG(tabla, puntosBebe, mesesHoy);
    tarjetaGrafico.appendChild(contenedorSvg);

    const leyenda = document.createElement("div");
    leyenda.className = "leyenda-grafico";
    leyenda.innerHTML = `
      <span class="item"><span class="muestra" style="background:var(--color-terracota);"></span>${bebe.nombre}</span>
      <span class="item"><span class="muestra" style="background:#BFCBAE;"></span>Lo más común (P15–P85)</span>
      <span class="item"><span class="muestra" style="background:var(--color-oliva-tinte);"></span>Franja esperada (P3–P97)</span>
      <span class="item"><span class="muestra" style="background:repeating-linear-gradient(90deg, var(--color-texto-suave) 0 4px, transparent 4px 7px);"></span>Promedio</span>
    `;
    tarjetaGrafico.appendChild(leyenda);
  }
  contenido.appendChild(tarjetaGrafico);

  // --- Mensaje automático ---
  if (puntosBebe.length > 0) {
    const mensaje = calcularMensaje(tabla, puntosBebe, metrica, bebe, mediciones, fechaNacimiento);
    const panelMensaje = document.createElement("div");
    panelMensaje.className = `mensaje-crecimiento ${mensaje.tipo}`;
    panelMensaje.innerHTML = `
      <h3>${mensaje.titulo}</h3>
      <p>Lo importante es que siga su propia curva, control a control. Quien la evalúa es tu pediatra.</p>
      <p>No hay un percentil "mejor": un bebé en el 15 puede estar tan sano como uno en el 85.</p>
    `;
    contenido.appendChild(panelMensaje);
  }

  // --- Historial ---
  if (mediciones.length > 0) {
    const tituloHistorial = document.createElement("h2");
    tituloHistorial.textContent = "Historial";
    tituloHistorial.style.marginTop = "22px";
    contenido.appendChild(tituloHistorial);

    const tarjetaHistorial = document.createElement("div");
    tarjetaHistorial.className = "tarjeta";
    [...mediciones].reverse().forEach((m) => {
      const fila = document.createElement("div");
      fila.className = "fila-historial";
      fila.innerHTML = `
        <div>
          <div class="fecha-historial">${formatearFechaCorta(aFecha(m.fecha))}</div>
          <div class="valores-historial">${formatearNumero(m.pesoKg, 1)} kg · ${formatearNumero(m.tallaCm, 0)} cm · ${formatearNumero(m.perimetroCm, 1)} cm</div>
        </div>
        <button class="boton-borrar-medicion" aria-label="Borrar esta medición">×</button>
      `;
      fila.querySelector("button").addEventListener("click", () => {
        if (confirm("¿Borrar esta medición?")) {
          eliminarMedicion(indiceBebeSeleccionado, m.id);
          dibujar(contenedor, navegar, perfil);
        }
      });
      tarjetaHistorial.appendChild(fila);
    });
    contenido.appendChild(tarjetaHistorial);
  }

  const legal = document.createElement("p");
  legal.className = "aviso-legal";
  legal.textContent = "Fuente: tablas de crecimiento de la OMS (2006). Esta app no diagnostica: consultá siempre a tu pediatra.";
  contenido.appendChild(legal);

  contenedor.appendChild(pantalla);
  montarNavInferior(contenedor, "crecimiento", navegar);

  if (formulario) {
    contenedor.appendChild(construirHojaFormulario(contenedor, navegar, perfil, bebe));
  }
}

function diasCorregidosEn(fechaIso, fechaNacimiento, bebe) {
  return edadCorregidaEnDias(fechaNacimiento, bebe.semanasAlNacer, aFecha(fechaIso));
}

function edadSimpleMeses(meses) {
  const redondeado = Math.round(meses);
  if (redondeado === 0) return "recién nacido";
  return redondeado === 1 ? "1 mes" : `${redondeado} meses`;
}

function formatearNumero(valor, decimales) {
  if (valor == null) return "—";
  return valor.toFixed(decimales).replace(".", ",");
}

function calcularMensaje(tabla, puntosBebe, metrica, bebe, medicionesTodas, fechaNacimiento) {
  const ultimo = puntosBebe[puntosBebe.length - 1];
  const percentiles = percentilesEnEdad(tabla, ultimo.meses);
  const franja = ubicarFranja(ultimo.valor, percentiles);

  if (metrica.id === "peso" && bebe.pesoG) {
    const ultimaMedicion = medicionesTodas[medicionesTodas.length - 1];
    const diasRealesAlMomento = diferenciaDias(aFecha(ultimaMedicion.fecha), fechaNacimiento);
    const pesoActualG = ultimo.valor * 1000;
    if (diasRealesAlMomento <= 7 && pesoActualG < bebe.pesoG) {
      const bajaPorcentual = (bebe.pesoG - pesoActualG) / bebe.pesoG;
      if (bajaPorcentual <= 0.1) {
        return { tipo: "ok", titulo: "Es normal que los bebés bajen un poco de peso la primera semana." };
      }
    }
  }

  if (franja === "muyBajo" || franja === "muyAlto") {
    return { tipo: "aviso", titulo: "Está fuera de la franja esperada. Comentalo con tu pediatra en el próximo control." };
  }

  if (puntosBebe.length >= 2) {
    const anterior = puntosBebe[puntosBebe.length - 2];
    const percentilesAnterior = percentilesEnEdad(tabla, anterior.meses);
    const franjaAnterior = ubicarFranja(anterior.valor, percentilesAnterior);
    if (franjaAnterior !== franja) {
      return { tipo: "aviso", titulo: "Cambió de carril respecto al control anterior. Comentalo con tu pediatra." };
    }
  }

  return { tipo: "ok", titulo: "Está dentro de lo esperado para su edad." };
}

/* ------------------------------ Gráfico ------------------------------ */

function construirGraficoSVG(tabla, puntosBebe, mesesHoy) {
  const ancho = 300;
  const alto = 180;
  const margenIzq = 6;
  const margenDer = 6;
  const margenSup = 10;
  const margenInf = 26;
  const anchoGrafico = ancho - margenIzq - margenDer;
  const altoGrafico = alto - margenSup - margenInf;

  const ultimoPuntoMeses = puntosBebe[puntosBebe.length - 1]?.meses || 0;
  let maxMeses = Math.ceil((Math.max(mesesHoy, ultimoPuntoMeses) + 2) / 2) * 2;
  maxMeses = Math.min(24, Math.max(6, maxMeses));

  const filas = tabla.filter((f) => f.mes <= maxMeses);
  const valores = filas.flatMap((f) => [f.p3, f.p97]);
  const yMin = Math.min(...valores) * 0.95;
  const yMax = Math.max(...valores) * 1.05;

  const x = (mes) => margenIzq + (mes / maxMeses) * anchoGrafico;
  const y = (valor) => margenSup + (1 - (valor - yMin) / (yMax - yMin)) * altoGrafico;

  const puntos = (campo) => filas.map((f) => `${x(f.mes)},${y(f[campo])}`).join(" ");
  const puntosInvertidos = (campo) =>
    [...filas].reverse().map((f) => `${x(f.mes)},${y(f[campo])}`).join(" ");

  const bandaAncha = `${puntos("p97")} ${puntosInvertidos("p3")}`;
  const bandaAngosta = `${puntos("p85")} ${puntosInvertidos("p15")}`;
  const lineaPromedio = puntos("p50");
  const lineaBebe = puntosBebe.map((p) => `${x(p.meses)},${y(p.valor)}`).join(" ");

  const ticks = [];
  for (let m = 0; m <= maxMeses; m += 2) {
    ticks.push(m);
  }

  const circulos = puntosBebe
    .map((p) => `<circle cx="${x(p.meses)}" cy="${y(p.valor)}" r="4.5" fill="var(--color-terracota)" stroke="#fff" stroke-width="1.5" />`)
    .join("");

  const etiquetasEje = ticks
    .map((m, indice) => {
      const esUltimo = indice === ticks.length - 1;
      return `<text x="${x(m)}" y="${alto - 6}" font-size="11" fill="var(--color-texto-suave)" text-anchor="${esUltimo ? "end" : "middle"}">${m}${esUltimo ? " meses" : ""}</text>`;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${ancho} ${alto}" xmlns="http://www.w3.org/2000/svg">
      <polygon points="${bandaAncha}" fill="var(--color-oliva-tinte)" />
      <polygon points="${bandaAngosta}" fill="#BFCBAE" />
      <polyline points="${lineaPromedio}" fill="none" stroke="var(--color-texto-suave)" stroke-width="1.5" stroke-dasharray="4 3" />
      <line x1="${margenIzq}" y1="${alto - margenInf}" x2="${ancho - margenDer}" y2="${alto - margenInf}" stroke="var(--color-borde)" stroke-width="1" />
      <polyline points="${lineaBebe}" fill="none" stroke="var(--color-terracota)" stroke-width="2.5" />
      ${circulos}
      ${etiquetasEje}
    </svg>
  `;
}

/* -------------------------- Hoja "cargar medición" -------------------------- */

function construirHojaFormulario(contenedor, navegar, perfil, bebe) {
  const superposicion = document.createElement("div");
  superposicion.className = "superposicion";
  superposicion.addEventListener("click", (e) => {
    if (e.target === superposicion) {
      formulario = null;
      dibujar(contenedor, navegar, perfil);
    }
  });

  const hoja = document.createElement("div");
  hoja.className = "hoja";
  hoja.style.textAlign = "left";
  hoja.innerHTML = `<h2 class="centro">Cargar medición</h2><p class="centro" style="margin-bottom:18px;">${bebe.nombre}</p>`;

  hoja.appendChild(
    campoTexto("Fecha", "", formulario.fecha, (valor) => (formulario.fecha = valor), "date")
  );

  const fila = document.createElement("div");
  fila.className = "grupo-2col";
  fila.appendChild(
    campoTexto("Peso (kg)", "Ej.: 5,9", formulario.pesoKg, (valor) => (formulario.pesoKg = valor), "number")
  );
  fila.appendChild(
    campoTexto("Talla (cm)", "Ej.: 60", formulario.tallaCm, (valor) => (formulario.tallaCm = valor), "number")
  );
  hoja.appendChild(fila);

  hoja.appendChild(
    campoTexto(
      "Perímetro cefálico (cm, opcional)",
      "Ej.: 39,5",
      formulario.perimetroCm,
      (valor) => (formulario.perimetroCm = valor),
      "number"
    )
  );

  if (formulario.error) {
    const error = document.createElement("p");
    error.style.color = "var(--color-rojo)";
    error.style.fontWeight = "700";
    error.textContent = formulario.error;
    hoja.appendChild(error);
  }

  const botonGuardar = document.createElement("button");
  botonGuardar.className = "boton boton-primario";
  botonGuardar.textContent = "Guardar medición";
  botonGuardar.addEventListener("click", () => {
    if (!formulario.fecha) {
      formulario.error = "Contanos la fecha de la medición.";
      return redibujarHoja(contenedor, navegar, perfil);
    }
    if (aFecha(formulario.fecha).getTime() > hoy().getTime()) {
      formulario.error = "La fecha no puede ser futura.";
      return redibujarHoja(contenedor, navegar, perfil);
    }
    if (!formulario.pesoKg || !formulario.tallaCm) {
      formulario.error = "Completá al menos el peso y la talla.";
      return redibujarHoja(contenedor, navegar, perfil);
    }
    agregarMedicion(indiceBebeSeleccionado, {
      fecha: formulario.fecha,
      pesoKg: Number(formulario.pesoKg),
      tallaCm: Number(formulario.tallaCm),
      perimetroCm: formulario.perimetroCm ? Number(formulario.perimetroCm) : null,
    });
    formulario = null;
    dibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonGuardar);

  const botonCancelar = document.createElement("button");
  botonCancelar.className = "boton boton-texto";
  botonCancelar.style.marginTop = "10px";
  botonCancelar.textContent = "Cancelar";
  botonCancelar.addEventListener("click", () => {
    formulario = null;
    dibujar(contenedor, navegar, perfil);
  });
  hoja.appendChild(botonCancelar);

  superposicion.appendChild(hoja);
  return superposicion;
}

function redibujarHoja(contenedor, navegar, perfil) {
  dibujar(contenedor, navegar, perfil);
}
