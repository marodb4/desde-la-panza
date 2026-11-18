import { guardarPerfil } from "../almacenamiento.js";
import { hoy, aIso, aFecha, fppDesdeFum, fppEsValida } from "../fechas.js";
import { botonBloque, chip, campoTexto, campoSexo } from "./piezas-formulario.js";
import { construirMarcaDeAgua } from "../marca-agua.js";

// Estado del formulario (vive mientras la pantalla está abierta).
let estado = crearEstadoInicial();

function crearEstadoInicial() {
  return {
    etapa: "embarazo", // "embarazo" | "bebe"
    mellizos: false,
    nombreMama: "",
    modoFecha: "fpp", // "fpp" | "fum"
    fechaFppOFum: "",
    fechaNacimiento: "",
    bebes: [{ nombre: "", sexo: "", pesoG: "", tallaCm: "", semanasAlNacer: "" }],
    consentimiento: false,
    error: "",
  };
}

function asegurarCantidadBebes() {
  const cantidad = estado.mellizos ? 2 : 1;
  while (estado.bebes.length < cantidad) {
    estado.bebes.push({ nombre: "", sexo: "", pesoG: "", tallaCm: "", semanasAlNacer: "" });
  }
  estado.bebes = estado.bebes.slice(0, cantidad);
}

export function render(contenedor, { navegar }) {
  estado = crearEstadoInicial();
  dibujar(contenedor, navegar);
}

function dibujar(contenedor, navegar) {
  asegurarCantidadBebes();

  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";

  pantalla.innerHTML = `
    <div class="centro" style="margin-bottom: 18px;">
      <div style="font-size: 64px; line-height: 1;">🤱</div>
    </div>
    <h1>Bienvenida a <span style="color: var(--color-oliva);">Desde la Panza</span></h1>
    <h2 style="font-size:17px;">Contanos en qué momento estás</h2>
    <p>Con esto armamos tu calendario. Lo que no sepas, lo dejás en blanco y lo completás después.</p>
  `;
  pantalla.appendChild(construirMarcaDeAgua());

  // --- Etapa ---
  const filaEtapa = document.createElement("div");
  filaEtapa.className = "grupo-2col";
  filaEtapa.appendChild(
    botonBloque("Estoy embarazada", "Te acompaño semana a semana", estado.etapa === "embarazo", () => {
      estado.etapa = "embarazo";
      dibujar(contenedor, navegar);
    })
  );
  filaEtapa.appendChild(
    botonBloque("Mi bebé ya nació", "Cargás lo que ya pasó", estado.etapa === "bebe", () => {
      estado.etapa = "bebe";
      dibujar(contenedor, navegar);
    })
  );
  pantalla.appendChild(filaEtapa);

  // --- Mellizos ---
  const campoMellizos = document.createElement("div");
  campoMellizos.className = "campo";
  campoMellizos.innerHTML = `<label>¿Cuántos bebés ${estado.etapa === "embarazo" ? "esperás" : "tenés"}?</label>`;
  const chips = document.createElement("div");
  chips.className = "grupo-opciones";
  chips.appendChild(
    chip("Uno", !estado.mellizos, () => {
      estado.mellizos = false;
      dibujar(contenedor, navegar);
    })
  );
  chips.appendChild(
    chip("Mellizos", estado.mellizos, () => {
      estado.mellizos = true;
      dibujar(contenedor, navegar);
    })
  );
  campoMellizos.appendChild(chips);
  pantalla.appendChild(campoMellizos);

  // --- Nombre de la mamá ---
  pantalla.appendChild(
    campoTexto("Tu nombre", "Ej.: Carolina", estado.nombreMama, (valor) => (estado.nombreMama = valor))
  );

  if (estado.etapa === "embarazo") {
    dibujarCamposEmbarazo(pantalla, contenedor, navegar);
  } else {
    dibujarCamposBebe(pantalla, contenedor, navegar);
  }

  // --- Consentimiento ---
  const consentimiento = document.createElement("label");
  consentimiento.className = "campo-check";
  consentimiento.innerHTML = `
    <input type="checkbox" ${estado.consentimiento ? "checked" : ""} />
    <span>Doy mi consentimiento para que se guarden estos datos de salud, míos y de mi bebé, para usarlos dentro de la app (Ley 25.326). Podés revisar esto en Editar datos cuando quieras.</span>
  `;
  consentimiento.querySelector("input").addEventListener("change", (e) => {
    estado.consentimiento = e.target.checked;
  });
  pantalla.appendChild(consentimiento);

  if (estado.error) {
    const error = document.createElement("p");
    error.style.color = "var(--color-rojo)";
    error.style.fontWeight = "700";
    error.textContent = estado.error;
    pantalla.appendChild(error);
  }

  const botonEmpezar = document.createElement("button");
  botonEmpezar.className = "boton boton-primario";
  botonEmpezar.textContent = "Empezar";
  botonEmpezar.addEventListener("click", () => intentarGuardar(navegar));
  pantalla.appendChild(botonEmpezar);

  contenedor.appendChild(pantalla);
}

function dibujarCamposEmbarazo(pantalla, contenedor, navegar) {
  const campoFecha = document.createElement("div");
  campoFecha.className = "campo";
  const etiqueta = estado.modoFecha === "fpp" ? "Fecha probable de parto" : "Fecha de tu última menstruación";
  campoFecha.innerHTML = `
    <label>${etiqueta}</label>
    <input type="date" value="${estado.fechaFppOFum}" />
    <p class="ayuda">
      ${
        estado.modoFecha === "fpp"
          ? `¿No la sabés? <a href="#" data-accion="usar-fum">Poné la fecha de tu última menstruación</a> y la calculamos.`
          : `<a href="#" data-accion="usar-fpp">Volver a poner la fecha probable de parto</a>.`
      }
    </p>
  `;
  campoFecha.querySelector("input").addEventListener("change", (e) => {
    estado.fechaFppOFum = e.target.value;
  });
  campoFecha.querySelector("a").addEventListener("click", (e) => {
    e.preventDefault();
    estado.modoFecha = estado.modoFecha === "fpp" ? "fum" : "fpp";
    estado.fechaFppOFum = "";
    dibujar(contenedor, navegar);
  });
  pantalla.appendChild(campoFecha);

  estado.bebes.forEach((bebe, indice) => {
    const prefijo = estado.mellizos ? `Bebé ${indice + 1}: ` : "";
    pantalla.appendChild(
      campoTexto(`${prefijo}Nombre del bebé (opcional)`, "Si todavía no tiene...", bebe.nombre, (valor) => {
        estado.bebes[indice].nombre = valor;
      })
    );
    pantalla.appendChild(
      campoSexo(`${prefijo}Sexo`, bebe.sexo, (valor) => (estado.bebes[indice].sexo = valor), true)
    );
  });
}

function dibujarCamposBebe(pantalla, contenedor, navegar) {
  pantalla.appendChild(
    campoTexto(
      "Fecha de nacimiento",
      "",
      estado.fechaNacimiento,
      (valor) => (estado.fechaNacimiento = valor),
      "date"
    )
  );

  estado.bebes.forEach((bebe, indice) => {
    const prefijo = estado.mellizos ? `Bebé ${indice + 1}: ` : "";
    pantalla.appendChild(
      campoTexto(`${prefijo}Nombre`, "Ej.: Mateo", bebe.nombre, (valor) => (estado.bebes[indice].nombre = valor))
    );
    pantalla.appendChild(
      campoSexo(`${prefijo}Sexo`, bebe.sexo, (valor) => (estado.bebes[indice].sexo = valor), false)
    );

    const fila = document.createElement("div");
    fila.className = "grupo-2col";
    fila.appendChild(
      campoTexto(
        `${prefijo}Peso al nacer (g)`,
        "Ej.: 3200",
        bebe.pesoG,
        (valor) => (estado.bebes[indice].pesoG = valor),
        "number"
      )
    );
    fila.appendChild(
      campoTexto(
        `${prefijo}Talla al nacer (cm)`,
        "Ej.: 50",
        bebe.tallaCm,
        (valor) => (estado.bebes[indice].tallaCm = valor),
        "number"
      )
    );
    pantalla.appendChild(fila);

    pantalla.appendChild(
      campoTexto(
        `${prefijo}Semanas de embarazo al nacer`,
        "Si nació a término, 40",
        bebe.semanasAlNacer,
        (valor) => (estado.bebes[indice].semanasAlNacer = valor),
        "number"
      )
    );
  });
}

function intentarGuardar(navegar) {
  estado.error = "";

  if (!estado.nombreMama.trim()) {
    estado.error = "Contanos tu nombre para seguir.";
    return redibujarConError(navegar);
  }
  if (!estado.consentimiento) {
    estado.error = "Hace falta tildar el consentimiento para guardar tus datos.";
    return redibujarConError(navegar);
  }

  let fpp = null;
  let fechaNacimiento = null;

  if (estado.etapa === "embarazo") {
    if (!estado.fechaFppOFum) {
      estado.error = "Contanos la fecha probable de parto (o tu última menstruación).";
      return redibujarConError(navegar);
    }
    const fecha = aFecha(estado.fechaFppOFum);
    fpp = estado.modoFecha === "fpp" ? fecha : fppDesdeFum(fecha);
    if (!fppEsValida(fpp, hoy())) {
      estado.error =
        "Esa fecha no parece corresponder a un embarazo en curso (un embarazo dura unas 40 semanas). Revisá la fecha que pusiste.";
      return redibujarConError(navegar);
    }
  } else {
    if (!estado.fechaNacimiento) {
      estado.error = "Contanos la fecha de nacimiento del bebé.";
      return redibujarConError(navegar);
    }
    fechaNacimiento = aFecha(estado.fechaNacimiento);
    for (const bebe of estado.bebes) {
      if (!bebe.sexo || !bebe.pesoG || !bebe.tallaCm) {
        estado.error = "Completá sexo, peso y talla al nacer de cada bebé.";
        return redibujarConError(navegar);
      }
    }
  }

  const perfil = {
    etapa: estado.etapa,
    mellizos: estado.mellizos,
    nombreMama: estado.nombreMama.trim(),
    fpp: fpp ? aIso(fpp) : null,
    fechaNacimiento: fechaNacimiento ? aIso(fechaNacimiento) : null,
    bebes: estado.bebes.map((bebe) => ({
      nombre: bebe.nombre.trim() || "Tu bebé",
      sexo: bebe.sexo || "no-se",
      pesoG: bebe.pesoG ? Number(bebe.pesoG) : null,
      tallaCm: bebe.tallaCm ? Number(bebe.tallaCm) : null,
      semanasAlNacer: bebe.semanasAlNacer ? Number(bebe.semanasAlNacer) : 40,
    })),
    consentimiento: true,
    creadoEl: new Date().toISOString(),
  };

  guardarPerfil(perfil);
  navegar(perfil.etapa === "bebe" ? "#/cargar-lo-que-paso" : "#/inicio");
}

function redibujarConError(navegar) {
  const contenedor = document.getElementById("app");
  dibujar(contenedor, navegar);
}

