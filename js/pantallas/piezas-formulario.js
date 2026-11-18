// Piezas de formulario compartidas entre Registro y Editar datos.

export function botonBloque(titulo, descripcion, activo, alHacerClick) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = `boton-bloque ${activo ? "activo" : ""}`;
  boton.innerHTML = `<h3>${titulo}</h3><p>${descripcion}</p>`;
  boton.addEventListener("click", alHacerClick);
  return boton;
}

export function chip(texto, activo, alHacerClick) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = `chip ${activo ? "activo" : ""}`;
  boton.textContent = texto;
  boton.addEventListener("click", (evento) => alHacerClick(evento));
  return boton;
}

export function campoTexto(etiqueta, placeholder, valor, alCambiar, tipo = "text") {
  const campo = document.createElement("div");
  campo.className = "campo";
  campo.innerHTML = `<label>${etiqueta}</label><input type="${tipo}" placeholder="${placeholder}" value="${valor ?? ""}" />`;
  campo.querySelector("input").addEventListener("input", (e) => alCambiar(e.target.value));
  return campo;
}

export function campoSexo(etiqueta, valor, alCambiar, esEmbarazo) {
  const opciones = esEmbarazo
    ? [
        ["nina", "Niña"],
        ["nino", "Niño"],
        ["no-se", "Todavía no sé"],
        ["sorpresa", "Es sorpresa"],
      ]
    : [
        ["nina", "Niña"],
        ["nino", "Niño"],
      ];

  const campo = document.createElement("div");
  campo.className = "campo";
  campo.innerHTML = `<label>${etiqueta}</label>`;
  const contenedorChips = document.createElement("div");
  contenedorChips.className = "grupo-opciones";
  for (const [valorOpcion, texto] of opciones) {
    contenedorChips.appendChild(
      chip(texto, valor === valorOpcion, (evento) => {
        alCambiar(valorOpcion);
        contenedorChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("activo"));
        evento.target.classList.add("activo");
      })
    );
  }
  campo.appendChild(contenedorChips);
  return campo;
}
