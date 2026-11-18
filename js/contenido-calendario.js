// Motor de reglas de "Hoy te toca" y del Calendario completo (sección 6 de
// instrucciones-del-proyecto.md). Corresponde al documento
// `contenido-calendario-vacunas-controles` de la sección 7: es un primer
// borrador con el Calendario Nacional y los controles. ANTES DE LANZAR hay
// que confirmarlo contra el PDF oficial del Ministerio de Salud + SAP
// (sección 7, "a confirmar con una profesional").

import { mesesCumplidos, diasDeEmbarazo } from "./fechas.js";

const SEMANA_EN_DIAS = 7;

/* ----------------------------- EMBARAZO ----------------------------- */

/**
 * Tareas del embarazo para "Hoy te toca": vacunas y estudios según la semana.
 */
export function tareasEmbarazo(semanaActual, fechaProbableParto, fechaDeHoy) {
  const tareas = [];
  const dias = diasDeEmbarazo(fechaProbableParto, fechaDeHoy);

  // Antigripal: en cualquier trimestre.
  tareas.push({
    id: "vacuna-antigripal-embarazo",
    tipo: "vacuna",
    etiqueta: "VACUNA · CUALQUIER TRIMESTRE",
    titulo: "Antigripal",
    detalle: "Te protege a vos y a tu bebé los primeros meses. Gratis en el vacunatorio.",
  });

  // Triple bacteriana acelular: desde la semana 20.
  if (semanaActual >= 20) {
    tareas.push({
      id: "vacuna-triple-bacteriana-embarazo",
      tipo: "vacuna",
      etiqueta: "VACUNA · DESDE LA SEMANA 20",
      titulo: "Triple bacteriana acelular",
      detalle: "Protege a tu bebé de la tos convulsa. Gratis en el vacunatorio.",
    });
  }

  // VSR: entre la semana 32 y la 36 + 6 días, con cuenta regresiva.
  const diaInicioVsr = 32 * SEMANA_EN_DIAS;
  const diaFinVsr = 36 * SEMANA_EN_DIAS + 6;
  if (dias >= diaInicioVsr && dias <= diaFinVsr) {
    const diasRestantes = diaFinVsr - dias;
    tareas.push({
      id: "vacuna-vsr-embarazo",
      tipo: "vacuna",
      urgente: diasRestantes <= 7,
      etiqueta: `VACUNA · QUEDAN ${diasRestantes} DÍAS`,
      titulo: "VSR (virus respiratorio sincicial)",
      detalle: "Se aplica solo entre la semana 32 y la 36 + 6 días. Gratis en el vacunatorio.",
    });
  }

  // Curva de glucosa (estudio), semanas 24 a 28, si se la indicaron.
  if (semanaActual >= 24 && semanaActual <= 28) {
    tareas.push({
      id: "estudio-curva-glucosa",
      tipo: "estudio",
      etiqueta: "ESTUDIO · SEMANAS 24 A 28 · SI TE LA INDICARON",
      titulo: "Curva de glucosa",
      detalle: "Pedile la orden a tu obstetra. Se hace en ayunas.",
    });
  }

  // Control de esta semana, según la cadencia de la sección 6.
  const controlDeHoy = controlEmbarazoDeEstaSemana(semanaActual);
  if (controlDeHoy) {
    tareas.push({
      id: `control-embarazo-semana-${semanaActual}`,
      tipo: "control",
      etiqueta: "CONTROL · ESTA SEMANA",
      titulo: controlDeHoy,
      detalle: "Anotá tus dudas antes de ir. Llevá tu carnet perinatal.",
    });
  }

  return tareas;
}

/**
 * Cadencia de controles del embarazo: mensual hasta la semana 32,
 * cada 15 días hasta la 38 y semanal desde la 39.
 * Es orientativo: la fecha real la da la obstetra en cada visita.
 */
function controlEmbarazoDeEstaSemana(semana) {
  if (semana <= 32) {
    return semana % 4 === 0 ? "Control mensual de embarazo" : null;
  }
  if (semana <= 38) {
    return semana % 2 === 0 ? "Control de embarazo (cada 15 días)" : null;
  }
  return "Control semanal de embarazo";
}

/* ------------------------------- BEBÉ -------------------------------- */

// Calendario Nacional de Vacunación (borrador a confirmar). Edad en meses.
// Cada vacuna lleva su etapa (para agrupar en la pantalla Calendario).
const VACUNAS_BEBE = [
  { etapaClave: "al-nacer", etapaEtiqueta: "Al nacer", mes: 0, nombre: "BCG", detalle: "Se aplica en la maternidad, al nacer." },
  { etapaClave: "al-nacer", etapaEtiqueta: "Al nacer", mes: 0, nombre: "Hepatitis B, 1ª dosis", detalle: "Se aplica en la maternidad, al nacer." },
  { etapaClave: "mes-2", etapaEtiqueta: "2 meses", mes: 2, nombre: "Quíntuple (pentavalente), 1ª dosis", detalle: "Llevá la libreta. Es gratis en cualquier vacunatorio." },
  { etapaClave: "mes-2", etapaEtiqueta: "2 meses", mes: 2, nombre: "IPV (polio), 1ª dosis", detalle: "Se da junto con la Quíntuple." },
  { etapaClave: "mes-2", etapaEtiqueta: "2 meses", mes: 2, nombre: "Neumococo conjugada, 1ª dosis", detalle: "Se da junto con la Quíntuple." },
  { etapaClave: "mes-2", etapaEtiqueta: "2 meses", mes: 2, nombre: "Rotavirus, 1ª dosis", detalle: "Importante: tiene fecha límite (antes de las 14 semanas y 6 días)." },
  { etapaClave: "mes-4", etapaEtiqueta: "4 meses", mes: 4, nombre: "Quíntuple (pentavalente), 2ª dosis", detalle: "Llevá la libreta. Es gratis en cualquier vacunatorio." },
  { etapaClave: "mes-4", etapaEtiqueta: "4 meses", mes: 4, nombre: "IPV (polio), 2ª dosis", detalle: "Se da junto con la Quíntuple." },
  { etapaClave: "mes-4", etapaEtiqueta: "4 meses", mes: 4, nombre: "Neumococo conjugada, 2ª dosis", detalle: "Se da junto con la Quíntuple." },
  { etapaClave: "mes-4", etapaEtiqueta: "4 meses", mes: 4, nombre: "Rotavirus, 2ª dosis", detalle: "Importante: tiene fecha límite (antes de las 24 semanas)." },
  { etapaClave: "mes-6", etapaEtiqueta: "6 meses", mes: 6, nombre: "Quíntuple (pentavalente), 3ª dosis", detalle: "Llevá la libreta. Es gratis en cualquier vacunatorio." },
  { etapaClave: "mes-6", etapaEtiqueta: "6 meses", mes: 6, nombre: "IPV (polio), 3ª dosis", detalle: "Se da junto con la Quíntuple." },
  { etapaClave: "mes-12", etapaEtiqueta: "12 meses", mes: 12, nombre: "Triple viral, 1ª dosis", detalle: "Protege de sarampión, rubéola y paperas." },
  { etapaClave: "mes-12", etapaEtiqueta: "12 meses", mes: 12, nombre: "Neumococo conjugada, refuerzo", detalle: "Refuerzo del año." },
  { etapaClave: "mes-12", etapaEtiqueta: "12 meses", mes: 12, nombre: "Hepatitis A", detalle: "Dosis única." },
  { etapaClave: "mes-15", etapaEtiqueta: "15 meses", mes: 15, nombre: "Triple bacteriana acelular, refuerzo", detalle: "Refuerzo de los 15-18 meses." },
  { etapaClave: "mes-15", etapaEtiqueta: "15 meses", mes: 15, nombre: "IPV (polio), refuerzo", detalle: "Refuerzo de los 15-18 meses." },
  {
    etapaClave: "mes-15",
    etapaEtiqueta: "15 meses",
    mes: 15,
    nombre: "Triple viral, 2ª dosis",
    detalle: "Para nacidos desde el 1/7/2024 (Resolución 339/2026). Antes, se da a los 4-5 años.",
    soloSiNacioDesde: "2024-07-01",
  },
];

// Pesquisas y controles especiales que no son "un control pediátrico más".
const CONTROLES_FIJOS = [
  { id: "control-bebe-talon", etapaClave: "al-nacer", etapaEtiqueta: "Al nacer", diasDesde: 0, nombre: "Prueba del talón" },
  { id: "control-bebe-audicion", etapaClave: "al-nacer", etapaEtiqueta: "Al nacer", diasDesde: 0, nombre: "Prueba de audición" },
  { id: "control-bebe-alta", etapaClave: "al-nacer", etapaEtiqueta: "Al nacer", diasDesde: 2, nombre: "Control de las 48-72 hs del alta" },
  { id: "control-bebe-7-14", etapaClave: "al-nacer", etapaEtiqueta: "Al nacer", diasDesde: 7, nombre: "Control de los 7 a 14 días" },
  { id: "control-bebe-ecografia-caderas", etapaClave: "mes-1", etapaEtiqueta: "1 mes", diasDesde: 30, nombre: "Ecografía de caderas" },
];

// Con mellizos, cada bebé tiene su propio progreso: el id de cada vacuna o
// control lleva el índice del bebé adelante, para que marcar una no marque
// la del hermano/a.
function idDeBebe(bebeIndice, idBase) {
  return `b${bebeIndice ?? 0}-${idBase}`;
}

function vacunaAplica(vacuna, fechaNacimientoIso) {
  if (!vacuna.soloSiNacioDesde) return true;
  if (!fechaNacimientoIso) return true;
  return fechaNacimientoIso >= vacuna.soloSiNacioDesde;
}

// Controles pediátricos (sección 6): primeros días + mensual + trimestral.
function controlesBebe(diasNacimiento) {
  const controles = [];
  if (diasNacimiento >= 2 && diasNacimiento <= 3) {
    controles.push({ id: "control-bebe-alta", titulo: "Control de las 48-72 hs del alta" });
  }
  if (diasNacimiento >= 7 && diasNacimiento <= 14) {
    controles.push({ id: "control-bebe-7-14", titulo: "Control de los 7 a 14 días" });
  }
  const meses = mesesCumplidos(diasNacimiento);
  if (meses >= 1 && meses <= 12) {
    controles.push({ id: `control-bebe-mes-${meses}`, titulo: `Control pediátrico del mes ${meses}`, mes: meses });
  } else if (meses > 12 && meses <= 24 && meses % 3 === 0) {
    controles.push({ id: `control-bebe-trimestre-${meses}`, titulo: `Control pediátrico de los ${meses} meses`, mes: meses });
  }
  return controles;
}

/** Vacunas que corresponden exactamente a un mes (para "Lista para el control"). */
export function vacunasDelMes(mes, fechaNacimientoIso) {
  return VACUNAS_BEBE.filter((v) => v.mes === mes && vacunaAplica(v, fechaNacimientoIso));
}

const VENTANA_VACUNA_DIAS = 20; // margen antes/después del mes exacto para seguir mostrando la tarea

export function tareasBebe(diasNacimiento, fechaDeHoy, fechaNacimientoIso, bebeIndice = 0) {
  const tareas = [];
  const mesesExactos = diasNacimiento / 30.4;

  for (const vacuna of VACUNAS_BEBE) {
    if (!vacunaAplica(vacuna, fechaNacimientoIso)) continue;
    const diaObjetivo = vacuna.mes * 30.4;
    const diferencia = diasNacimiento - diaObjetivo;
    if (diferencia >= -VENTANA_VACUNA_DIAS && diferencia <= VENTANA_VACUNA_DIAS) {
      tareas.push({
        id: idDeBebe(bebeIndice, `vacuna-bebe-${vacuna.mes}-${vacuna.nombre}`),
        tipo: "vacuna",
        etiqueta: vacuna.mes === 0 ? "VACUNA · AL NACER" : `VACUNA · MES ${vacuna.mes}`,
        titulo: vacuna.nombre,
        detalle: vacuna.detalle,
      });
    }
  }

  // Antigripal del bebé: desde los 6 meses, solo en temporada (marzo a agosto, a confirmar).
  const mesCalendario = fechaDeHoy.getMonth() + 1;
  if (mesesExactos >= 6 && mesCalendario >= 3 && mesCalendario <= 8) {
    tareas.push({
      id: idDeBebe(bebeIndice, "vacuna-antigripal-bebe"),
      tipo: "vacuna",
      etiqueta: "VACUNA · TEMPORADA",
      titulo: "Antigripal del bebé",
      detalle: "La primera vez son 2 dosis. Gratis en el vacunatorio.",
    });
  }

  for (const control of controlesBebe(diasNacimiento)) {
    tareas.push({
      id: idDeBebe(bebeIndice, control.id),
      tipo: "control",
      etiqueta: "CONTROL",
      titulo: control.titulo,
      detalle: "Anotá peso, talla y cabecita al salir. Llevá tus dudas escritas.",
      mesControl: control.mes,
    });
  }

  return tareas;
}

/* ------------------------- Calendario completo ------------------------- */

/**
 * Arma el Calendario completo del bebé, agrupado por etapa (igual que el
 * boceto: "Al nacer", "1 mes", "2 meses"...), con vacunas y controles juntos.
 * Cada item: { id, tipo: 'vacuna'|'control', nombre, detalle }.
 */
export function etapasCalendarioBebe(fechaNacimientoIso, bebeIndice = 0) {
  const mapa = new Map();
  function obtenerEtapa(clave, etiqueta, edadDiasEtapa) {
    if (!mapa.has(clave)) mapa.set(clave, { clave, etiqueta, edadDiasEtapa, items: [] });
    return mapa.get(clave);
  }

  for (const vacuna of VACUNAS_BEBE) {
    if (!vacunaAplica(vacuna, fechaNacimientoIso)) continue;
    const etapa = obtenerEtapa(vacuna.etapaClave, vacuna.etapaEtiqueta, vacuna.mes * 30.4);
    etapa.items.push({
      id: idDeBebe(bebeIndice, `vacuna-bebe-${vacuna.mes}-${vacuna.nombre}`),
      tipo: "vacuna",
      nombre: vacuna.nombre,
      detalle: vacuna.detalle,
    });
  }

  for (const control of CONTROLES_FIJOS) {
    const etapa = obtenerEtapa(control.etapaClave, control.etapaEtiqueta, control.diasDesde);
    etapa.items.push({ id: idDeBebe(bebeIndice, control.id), tipo: "control", nombre: control.nombre, detalle: "" });
  }

  for (let mes = 1; mes <= 12; mes++) {
    const etapa = obtenerEtapa(`mes-${mes}`, mes === 1 ? "1 mes" : `${mes} meses`, mes * 30.4);
    etapa.items.push({ id: idDeBebe(bebeIndice, `control-bebe-mes-${mes}`), tipo: "control", nombre: "Control pediátrico", detalle: "" });
  }
  for (const mes of [15, 18, 21, 24]) {
    const etapa = obtenerEtapa(`mes-${mes}`, `${mes} meses`, mes * 30.4);
    etapa.items.push({ id: idDeBebe(bebeIndice, `control-bebe-trimestre-${mes}`), tipo: "control", nombre: "Control pediátrico", detalle: "" });
  }

  return [...mapa.values()].sort((a, b) => a.edadDiasEtapa - b.edadDiasEtapa);
}

/** Alerta urgente de rotavirus para la pantalla Calendario (sección 6). */
export function alertaRotavirus(diasNacimiento, estaMarcadaFn, bebeIndice = 0) {
  const ventanas = [
    { id: idDeBebe(bebeIndice, "vacuna-bebe-2-Rotavirus, 1ª dosis"), limiteDias: 14 * 7 + 6, etiqueta: "1ª dosis" },
    { id: idDeBebe(bebeIndice, "vacuna-bebe-4-Rotavirus, 2ª dosis"), limiteDias: 24 * 7, etiqueta: "2ª dosis" },
  ];
  for (const v of ventanas) {
    if (estaMarcadaFn(v.id)) continue;
    if (diasNacimiento > v.limiteDias) continue;
    const semanaLimite = Math.floor(v.limiteDias / 7);
    const mesesLimite = Math.round(v.limiteDias / 30.4);
    return {
      titulo: "Ojo con el rotavirus",
      texto: `La ${v.etiqueta} se puede dar solo hasta las ${semanaLimite} semanas (${mesesLimite} meses aprox.). Si se pasa la fecha, ya no se aplica.`,
    };
  }
  return null;
}
