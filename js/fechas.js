// Cálculos de fechas (sección 6 de instrucciones-del-proyecto.md)

const MS_POR_DIA = 1000 * 60 * 60 * 24;

export function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function aFecha(iso) {
  if (!iso) return null;
  const [anio, mes, dia] = iso.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function aIso(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function sumarDias(fecha, dias) {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

export function diferenciaDias(fechaA, fechaB) {
  return Math.round((fechaA.getTime() - fechaB.getTime()) / MS_POR_DIA);
}

// FUM = fecha de última menstruación. El embarazo dura unos 280 días (40 semanas).
export function fppDesdeFum(fum) {
  return sumarDias(fum, 280);
}

export function fumDesdeFpp(fpp) {
  return sumarDias(fpp, -280);
}

/** Semana de embarazo (1 a 42) según la fecha probable de parto. */
export function semanaEmbarazoDesdeFpp(fpp, fechaDeHoy = hoy()) {
  const fum = fumDesdeFpp(fpp);
  const dias = diferenciaDias(fechaDeHoy, fum);
  const semana = Math.floor(dias / 7) + 1;
  return Math.min(Math.max(semana, 1), 42);
}

/**
 * Un embarazo dura unas 40 semanas (280 días) y a veces se pasa de fecha
 * unas semanas más. Esto rechaza fechas probables de parto que no pueden
 * corresponder a un embarazo en curso (muy en el pasado o muy en el futuro).
 */
export function fppEsValida(fpp, fechaDeHoy = hoy()) {
  const fum = fumDesdeFpp(fpp);
  const dias = diferenciaDias(fechaDeHoy, fum);
  return dias >= 0 && dias <= 301; // hasta ~3 semanas de "pasada de fecha"
}

export function diasDeEmbarazo(fpp, fechaDeHoy = hoy()) {
  const fum = fumDesdeFpp(fpp);
  return Math.max(diferenciaDias(fechaDeHoy, fum), 0);
}

/** Edad del bebé en días, a partir de la fecha de nacimiento. */
export function edadEnDias(fechaNacimiento, fechaDeHoy = hoy()) {
  return Math.max(diferenciaDias(fechaDeHoy, fechaNacimiento), 0);
}

/**
 * Edad corregida en días para bebés prematuros (menos de 37 semanas).
 * Se usa para crecimiento, juegos e hitos (nunca para las vacunas).
 */
export function edadCorregidaEnDias(fechaNacimiento, semanasAlNacer, fechaDeHoy = hoy()) {
  const diasReales = edadEnDias(fechaNacimiento, fechaDeHoy);
  if (!semanasAlNacer || semanasAlNacer >= 37) return diasReales;
  const diasDeAdelanto = (40 - semanasAlNacer) * 7;
  return Math.max(diasReales - diasDeAdelanto, 0);
}

export function textoEdadBebe(dias) {
  if (dias < 14) return dias === 1 ? "1 día" : `${dias} días`;
  const meses = Math.floor(dias / 30.4);
  const diasRestantes = Math.round(dias - meses * 30.4);
  const semanasRestantes = Math.floor(diasRestantes / 7);
  if (meses === 0) {
    const semanas = Math.floor(dias / 7);
    return semanas === 1 ? "1 semana" : `${semanas} semanas`;
  }
  let texto = meses === 1 ? "1 mes" : `${meses} meses`;
  if (semanasRestantes > 0) {
    texto += semanasRestantes === 1 ? " y 1 semana" : ` y ${semanasRestantes} semanas`;
  }
  return texto;
}

export function mesesCumplidos(dias) {
  return Math.floor(dias / 30.4);
}

export function edadEnMesesExactos(dias) {
  return dias / 30.4;
}

export function formatearFechaLarga(fecha) {
  return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatearFechaCorta(fecha) {
  return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
}

export function formatearFechaDiaMes(fecha) {
  return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

/** "Buen día" / "Buenas tardes" / "Buenas noches" según la hora actual. */
export function saludoPorHora(fecha = new Date()) {
  const horas = fecha.getHours();
  if (horas < 12) return "Buen día";
  if (horas < 20) return "Buenas tardes";
  return "Buenas noches";
}
