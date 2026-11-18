// Ilustraciones de bienvenida: mismo estilo que el logo (sección 4, variante C)
// y la marca de agua — líneas simples, crema sobre terracota. Se usan cuando
// todavía no hay una foto cargada.

function envolverCirculo(contenidoSvg) {
  return `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="100" fill="var(--color-terracota)" />
      <g fill="none" stroke="var(--color-fondo)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        ${contenidoSvg}
      </g>
    </svg>
  `;
}

export function ilustracionEmbarazada() {
  return envolverCirculo(`
    <path d="M78 55
             C 58 85, 52 120, 65 150
             C 73 170, 85 183, 95 198
             C 100 206, 108 212, 120 212
             C 148 212, 168 194, 175 167
             C 183 139, 177 108, 157 85
             C 142 67, 108 44, 78 55 Z"
          transform="translate(0,-20) scale(0.85)" />
    <g fill="var(--color-fondo)" stroke="none">
      <ellipse cx="108" cy="118" rx="11" ry="14" />
      <circle cx="94" cy="100" r="4.5" />
      <circle cx="105" cy="93" r="5" />
      <circle cx="119" cy="92" r="5" />
      <circle cx="130" cy="99" r="4.5" />
    </g>
  `);
}

export function ilustracionNene() {
  return envolverCirculo(`
    <circle cx="100" cy="112" r="52" />
    <path d="M52 100 a48 40 0 0 1 96 0" />
    <path d="M58 92 L100 70 L142 92 Z" />
    <path d="M80 118 q10 10 20 0" />
    <path d="M100 118 q10 10 20 0" />
    <path d="M94 142 q6 8 12 0" />
    <circle cx="100" cy="60" r="3.5" fill="var(--color-fondo)" stroke="none" />
  `);
}

export function ilustracionNena() {
  return envolverCirculo(`
    <circle cx="100" cy="116" r="52" />
    <path d="M80 122 q10 10 20 0" />
    <path d="M100 122 q10 10 20 0" />
    <path d="M94 146 q6 8 12 0" />
    <path d="M70 74 a14 10 0 1 1 10 16 a14 10 0 1 1 -10 -16 Z" />
    <path d="M130 74 a14 10 0 1 0 -10 16 a14 10 0 1 0 10 -16 Z" />
    <circle cx="100" cy="68" r="5" fill="var(--color-fondo)" stroke="none" />
  `);
}

export function ilustracionMellizos() {
  return envolverCirculo(`
    <g transform="translate(-24,6) scale(0.72)">
      <circle cx="100" cy="112" r="52" />
      <path d="M58 92 L100 70 L142 92 Z" />
      <path d="M80 118 q10 10 20 0" />
      <path d="M100 118 q10 10 20 0" />
      <path d="M94 142 q6 8 12 0" />
    </g>
    <g transform="translate(34,16) scale(0.72)">
      <circle cx="100" cy="112" r="52" />
      <path d="M70 70 a14 10 0 1 1 10 16 a14 10 0 1 1 -10 -16 Z" />
      <path d="M130 70 a14 10 0 1 0 -10 16 a14 10 0 1 0 10 -16 Z" />
      <path d="M80 118 q10 10 20 0" />
      <path d="M100 118 q10 10 20 0" />
      <path d="M94 142 q6 8 12 0" />
    </g>
  `);
}

/** Elige la ilustración por defecto según la etapa y los datos del perfil. */
export function ilustracionPorDefecto(perfil, bebe) {
  if (perfil.etapa === "embarazo") return ilustracionEmbarazada();
  if (perfil.mellizos) return ilustracionMellizos();
  if (bebe?.sexo === "nina") return ilustracionNena();
  return ilustracionNene();
}
