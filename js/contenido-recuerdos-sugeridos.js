// Recuerdos sugeridos: hitos típicos del embarazo y del primer año, para que
// el álbum no empiece vacío. Funcionan igual que "Hoy te toca": se muestran
// como una tarjeta vacía invitando a cargar la foto, y desaparecen (se
// reemplazan por la foto real) en cuanto la mamá la carga. Es un primer
// borrador de contenido (sección 7), pensado para ser cálido, no exhaustivo.

export const SUGERENCIAS_PANZA = [
  { id: "sug-ecografia", titulo: "Primera ecografía", semanaDesde: 8 },
  { id: "sug-patadita", titulo: "Primera patadita", semanaDesde: 18 },
  { id: "sug-bolso", titulo: "Preparamos el bolso", semanaDesde: 29 },
  { id: "sug-ultimos-dias", titulo: "Últimos días de panza", semanaDesde: 37 },
];

export const SUGERENCIAS_BEBE = [
  { id: "sug-llego", titulo: "¡Llegó!", diaDesde: 0 },
  { id: "sug-primera-semana", titulo: "Primera semana en casa", diaDesde: 2 },
  { id: "sug-primera-sonrisa", titulo: "Su primera sonrisa", diaDesde: 35 },
  { id: "sug-primer-paseo", titulo: "Primer paseo afuera", diaDesde: 90 },
  { id: "sug-primera-papilla", titulo: "Primera papilla", diaDesde: 150 },
  { id: "sug-primer-anio", titulo: "¡Primer año!", diaDesde: 335 },
];

/** Sugerencias de embarazo cuyo momento ya llegó (sin importar si se cumplieron). */
export function sugerenciasPanzaDisponibles(semanaActual) {
  return SUGERENCIAS_PANZA.filter((s) => semanaActual >= s.semanaDesde);
}

/** Sugerencias del bebé cuyo momento ya llegó. */
export function sugerenciasBebeDisponibles(diasDeVida) {
  return SUGERENCIAS_BEBE.filter((s) => diasDeVida >= s.diaDesde);
}
