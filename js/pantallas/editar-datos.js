import { obtenerPerfil, guardarPerfil, borrarPerfil } from "../almacenamiento.js";
import { hoy, aIso, aFecha, fppEsValida } from "../fechas.js";
import { botonBloque, chip, campoTexto, campoSexo } from "./piezas-formulario.js";
import { iconos } from "../iconos.js";
import { construirMarcaDeAgua } from "../marca-agua.js";
import { eliminarTodosLosRecuerdos, eliminarTodasLasFotosPerfil } from "../almacen-fotos.js";
import { supabase } from "../supabase-cliente.js";

let estado = null;

function estadoDesdePerfil(perfil) {
  return {
    etapa: perfil.etapa,
    mellizos: perfil.mellizos,
    nombreMama: perfil.nombreMama,
    modoFecha: "fpp",
    fechaFppOFum: perfil.fpp || "",
    fechaNacimiento: perfil.fechaNacimiento || "",
    bebes: perfil.bebes.map((b) => ({
      nombre: b.nombre === "Tu bebé" ? "" : b.nombre,
      sexo: b.sexo === "no-se" && perfil.etapa === "bebe" ? "" : b.sexo,
      pesoG: b.pesoG ?? "",
      tallaCm: b.tallaCm ?? "",
      semanasAlNacer: b.semanasAlNacer ?? "",
    })),
    consentimiento: perfil.consentimiento,
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
  const perfil = obtenerPerfil();
  estado = estadoDesdePerfil(perfil);
  dibujar(contenedor, navegar);
}

function dibujar(contenedor, navegar) {
  asegurarCantidadBebes();
  contenedor.innerHTML = "";
  const pantalla = document.createElement("div");
  pantalla.className = "pantalla sin-nav";
  pantalla.appendChild(construirMarcaDeAgua());

  const encabezado = document.createElement("div");
  encabezado.className = "encabezado-secundario";
  encabezado.innerHTML = `
    <button class="boton-volver" aria-label="Volver">${iconos.volver}</button>
    <div class="titulos"><h1>Editar datos</h1></div>
  `;
  encabezado.querySelector(".boton-volver").addEventListener("click", () => navegar("#/inicio"));
  pantalla.appendChild(encabezado);

  const filaEtapa = document.createElement("div");
  filaEtapa.className = "grupo-2col";
  filaEtapa.appendChild(
    botonBloque("Estoy embarazada", "Te acompaño semana a semana", estado.etapa === "embarazo", () => {
      estado.etapa = "embarazo";
      dibujar(contenedor, navegar);
    })
  );
  filaEtapa.appendChild(
    botonBloque("Mi bebé ya nació", "Cambiar a esta etapa", estado.etapa === "bebe", () => {
      estado.etapa = "bebe";
      dibujar(contenedor, navegar);
    })
  );
  pantalla.appendChild(filaEtapa);

  if (estado.etapa === "bebe" && estado.bebes.some((b) => !b.sexo)) {
    const aviso = document.createElement("div");
    aviso.className = "tarjeta tarjeta-panel";
    aviso.innerHTML = `<p style="margin:0;"><strong>¿Ya nació?</strong> Completá la fecha de nacimiento y los datos de abajo para pasar a la etapa del bebé.</p>`;
    pantalla.appendChild(aviso);
  }

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

  pantalla.appendChild(
    campoTexto("Tu nombre", "Ej.: Carolina", estado.nombreMama, (valor) => (estado.nombreMama = valor))
  );

  if (estado.etapa === "embarazo") {
    const campoFecha = campoTexto(
      "Fecha probable de parto",
      "",
      estado.fechaFppOFum,
      (valor) => (estado.fechaFppOFum = valor),
      "date"
    );
    pantalla.appendChild(campoFecha);

    estado.bebes.forEach((bebe, indice) => {
      const prefijo = estado.mellizos ? `Bebé ${indice + 1}: ` : "";
      pantalla.appendChild(
        campoTexto(`${prefijo}Nombre del bebé (opcional)`, "", bebe.nombre, (valor) => (estado.bebes[indice].nombre = valor))
      );
      pantalla.appendChild(
        campoSexo(`${prefijo}Sexo`, bebe.sexo, (valor) => (estado.bebes[indice].sexo = valor), true)
      );
    });
  } else {
    pantalla.appendChild(
      campoTexto("Fecha de nacimiento", "", estado.fechaNacimiento, (valor) => (estado.fechaNacimiento = valor), "date")
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
        campoTexto(`${prefijo}Peso al nacer (g)`, "", bebe.pesoG, (valor) => (estado.bebes[indice].pesoG = valor), "number")
      );
      fila.appendChild(
        campoTexto(`${prefijo}Talla al nacer (cm)`, "", bebe.tallaCm, (valor) => (estado.bebes[indice].tallaCm = valor), "number")
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

  if (estado.error) {
    const error = document.createElement("p");
    error.style.color = "var(--color-rojo)";
    error.style.fontWeight = "700";
    error.textContent = estado.error;
    pantalla.appendChild(error);
  }

  const botonGuardar = document.createElement("button");
  botonGuardar.className = "boton boton-primario";
  botonGuardar.textContent = "Guardar cambios";
  botonGuardar.addEventListener("click", () => intentarGuardar(contenedor, navegar));
  pantalla.appendChild(botonGuardar);

  const botonComoInstalar = document.createElement("button");
  botonComoInstalar.className = "boton boton-secundario";
  botonComoInstalar.style.marginTop = "14px";
  botonComoInstalar.textContent = "¿Cómo instalo la app?";
  botonComoInstalar.addEventListener("click", () => navegar("#/como-instalar"));
  pantalla.appendChild(botonComoInstalar);

  // Solo para la cuenta de administradora: el chequeo real de verdad lo hace
  // la Edge Function (esto es solo para no mostrar el link a cualquiera).
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user?.email?.toLowerCase() === "marodb4@gmail.com") {
      const botonAdmin = document.createElement("button");
      botonAdmin.className = "boton boton-secundario";
      botonAdmin.style.marginTop = "10px";
      botonAdmin.textContent = "Administradora: ver clientas";
      botonAdmin.addEventListener("click", () => navegar("#/admin"));
      pantalla.insertBefore(botonAdmin, pantalla.querySelector(".aviso-legal") || null);
    }
  });

  const botonBorrar = document.createElement("button");
  botonBorrar.className = "boton boton-texto";
  botonBorrar.style.marginTop = "14px";
  botonBorrar.textContent = "Borrar todos mis datos de este celular";
  botonBorrar.addEventListener("click", () => {
    if (confirm("¿Seguro que querés borrar todos tus datos de este celular? No se puede deshacer.")) {
      borrarPerfil();
      eliminarTodosLosRecuerdos();
      eliminarTodasLasFotosPerfil();
      navegar("#/registro");
    }
  });
  pantalla.appendChild(botonBorrar);

  const botonCerrarSesion = document.createElement("button");
  botonCerrarSesion.className = "boton boton-texto";
  botonCerrarSesion.style.marginTop = "8px";
  botonCerrarSesion.textContent = "Cerrar sesión";
  botonCerrarSesion.addEventListener("click", () => supabase.auth.signOut());
  pantalla.appendChild(botonCerrarSesion);

  contenedor.appendChild(pantalla);
}

function intentarGuardar(contenedor, navegar) {
  estado.error = "";
  if (!estado.nombreMama.trim()) {
    estado.error = "Contanos tu nombre para seguir.";
    return dibujar(contenedor, navegar);
  }

  let fpp = null;
  let fechaNacimiento = null;

  if (estado.etapa === "embarazo") {
    if (!estado.fechaFppOFum) {
      estado.error = "Contanos la fecha probable de parto.";
      return dibujar(contenedor, navegar);
    }
    fpp = aFecha(estado.fechaFppOFum);
    if (!fppEsValida(fpp, hoy())) {
      estado.error =
        "Esa fecha no parece corresponder a un embarazo en curso (un embarazo dura unas 40 semanas). Revisá la fecha que pusiste.";
      return dibujar(contenedor, navegar);
    }
  } else {
    if (!estado.fechaNacimiento) {
      estado.error = "Contanos la fecha de nacimiento del bebé.";
      return dibujar(contenedor, navegar);
    }
    fechaNacimiento = aFecha(estado.fechaNacimiento);
    for (const bebe of estado.bebes) {
      if (!bebe.sexo || !bebe.pesoG || !bebe.tallaCm) {
        estado.error = "Completá sexo, peso y talla al nacer de cada bebé.";
        return dibujar(contenedor, navegar);
      }
    }
  }

  const perfilAnterior = obtenerPerfil();
  const perfil = {
    ...perfilAnterior,
    etapa: estado.etapa,
    mellizos: estado.mellizos,
    nombreMama: estado.nombreMama.trim(),
    fpp: fpp ? aIso(fpp) : perfilAnterior.fpp,
    fechaNacimiento: fechaNacimiento ? aIso(fechaNacimiento) : perfilAnterior.fechaNacimiento,
    bebes: estado.bebes.map((bebe) => ({
      nombre: bebe.nombre.trim() || "Tu bebé",
      sexo: bebe.sexo || "no-se",
      pesoG: bebe.pesoG ? Number(bebe.pesoG) : null,
      tallaCm: bebe.tallaCm ? Number(bebe.tallaCm) : null,
      semanasAlNacer: bebe.semanasAlNacer ? Number(bebe.semanasAlNacer) : 40,
    })),
  };

  const pasoDeEtapa = perfilAnterior.etapa === "embarazo" && perfil.etapa === "bebe";
  guardarPerfil(perfil);
  navegar(pasoDeEtapa ? "#/cargar-lo-que-paso" : "#/inicio");
}
