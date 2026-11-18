// Marca de agua de fondo (sección 4): dibujos de línea, sin relleno, en un
// tono apenas más oscuro que el fondo. Son solo bordes (osito con moñito,
// chupete, sonajero, estrellita y nube con luna), repartidos y repetidos
// a lo largo de toda la pantalla, detrás de las tarjetas, para que se vea
// más infantil. Se usa en todas las pantallas principales.

/** Devuelve el <div class="marca-agua"> listo para insertar como PRIMER hijo de ".pantalla". */
export function construirMarcaDeAgua() {
  const contenedor = document.createElement("div");
  contenedor.className = "marca-agua";
  contenedor.innerHTML = svgMarcaDeAgua();
  return contenedor;
}

// Cada figura, repetida con <use> a mitad de tamaño (scale 0.5) y una leve
// rotación distinta. Separadas ~100 unidades entre sí (en vez de ~45) para
// que no se amontonen cuando la pantalla tiene poco contenido (se estiran
// proporcionalmente a lo largo de lo que haya, corto o largo).
const FIGURAS = [
  ["osito", 55, 50, -6],
  ["nube", 330, 140, 4],
  ["chupete", 190, 230, 10],
  ["estrella", 40, 320, -12],
  ["sonajero", 345, 410, 8],
  ["osito", 150, 500, 7],
  ["nube", 55, 590, -5],
  ["chupete", 330, 680, -9],
  ["estrella", 190, 770, 14],
  ["sonajero", 45, 860, 6],
  ["osito", 320, 950, -4],
];

export function svgMarcaDeAgua() {
  const color = "var(--color-marca-agua)";
  const usos = FIGURAS.map(
    ([figura, x, y, giro]) =>
      `<use href="#${figura}" transform="translate(${x},${y}) scale(0.5) rotate(${giro})" />`
  ).join("");

  return `
    <svg viewBox="0 0 400 1000" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"
         fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <defs>
        <g id="osito">
          <circle cx="0" cy="40" r="34" />
          <circle cx="-26" cy="8" r="13" />
          <circle cx="26" cy="8" r="13" />
          <path d="M-9,72 L0,82 L9,72 Z" />
          <circle cx="0" cy="82" r="3" fill="${color}" />
        </g>

        <g id="chupete">
          <circle cx="0" cy="0" r="20" />
          <rect x="-26" y="16" width="52" height="20" rx="10" />
          <path d="M-10,36 a10,10 0 0 0 20,0" />
        </g>

        <g id="nube">
          <path d="M-40,10 a20,20 0 0 1 10,-38 a24,24 0 0 1 46,-6 a18,18 0 0 1 4,44 Z" />
          <path d="M-70,-10 a16,16 0 1 0 14,24 a20,20 0 0 1 -14,-24 Z" />
        </g>

        <g id="estrella">
          <path d="M0,-20 L5,-5 L20,0 L5,5 L0,20 L-5,5 L-20,0 L-5,-5 Z" />
        </g>

        <g id="sonajero">
          <circle cx="0" cy="0" r="14" />
          <circle cx="-5" cy="-3" r="2" fill="${color}" />
          <circle cx="5" cy="-3" r="2" fill="${color}" />
          <circle cx="0" cy="6" r="2" fill="${color}" />
          <line x1="0" y1="14" x2="0" y2="34" />
          <circle cx="0" cy="37" r="4" fill="${color}" />
        </g>
      </defs>

      ${usos}
    </svg>
  `;
}
