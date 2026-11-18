// Filtra "Mis recordatorios" para mostrar en "Hoy te toca": los de la mamá,
// o los de un bebé puntual, que todavía estén vigentes hoy.
import { obtenerRecordatorios } from "./almacenamiento.js";

export function recordatoriosActivos(paraQuien, fechaIso) {
  return obtenerRecordatorios().filter((r) => {
    if (r.paraQuien !== paraQuien) return false;
    if (r.hastaCuando === "fecha" && r.fechaFin && r.fechaFin < fechaIso) return false;
    return true;
  });
}

/** Convierte un recordatorio en una "tarea" para la tarjeta de Hoy te toca. */
export function tareaDesdeRecordatorio(r, fechaIso) {
  return {
    id: `recordatorio-${r.id}-${fechaIso}`,
    tipo: "recordatorio",
    etiqueta: `TU RECORDATORIO · ${r.horarios.join(", ")}`,
    titulo: r.que,
    detalle: r.comoIndicado || "",
  };
}
