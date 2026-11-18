// Junta las tareas pendientes de hoy (vacunas, controles, recordatorios),
// igual que "Hoy te toca" en Inicio, para el "Aviso al abrir".
import { estaMarcada } from "./almacenamiento.js";
import { hoy, aFecha, aIso, edadEnDias, semanaEmbarazoDesdeFpp } from "./fechas.js";
import { tareasEmbarazo, tareasBebe } from "./contenido-calendario.js";
import { recordatoriosActivos, tareaDesdeRecordatorio } from "./recordatorios-del-dia.js";

export function tareasDeHoyPendientes(perfil) {
  const fechaDeHoy = hoy();
  const fechaIso = aIso(fechaDeHoy);
  let tareas = [];

  if (perfil.etapa === "embarazo") {
    const fpp = aFecha(perfil.fpp);
    const semana = semanaEmbarazoDesdeFpp(fpp, fechaDeHoy);
    tareas = [
      ...tareasEmbarazo(semana, fpp, fechaDeHoy),
      ...recordatoriosActivos("mama", fechaIso).map((r) => tareaDesdeRecordatorio(r, fechaIso)),
    ];
  } else {
    const fechaNacimiento = aFecha(perfil.fechaNacimiento);
    const dias = edadEnDias(fechaNacimiento, fechaDeHoy);
    perfil.bebes.forEach((_, indice) => {
      tareas.push(...tareasBebe(dias, fechaDeHoy, perfil.fechaNacimiento, indice));
      tareas.push(...recordatoriosActivos(indice, fechaIso).map((r) => tareaDesdeRecordatorio(r, fechaIso)));
    });
    tareas.push(...recordatoriosActivos("mama", fechaIso).map((r) => tareaDesdeRecordatorio(r, fechaIso)));
  }

  return tareas.filter((t) => !estaMarcada(t.id));
}
