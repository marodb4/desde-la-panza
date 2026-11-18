// Guarda todo en el celular (localStorage) por ahora.
// En la Parte 5 esto se reemplaza/completa con Supabase (nube + login),
// así la mamá no pierde sus datos si cambia de celular.

const CLAVE_PERFIL = "dlp_perfil";
const CLAVE_MARCAS = "dlp_marcas"; // tareas tildadas en "Hoy te toca"
const CLAVE_MEDICIONES = "dlp_mediciones"; // mediciones de Crecimiento, por bebé
const CLAVE_RECORDATORIO_FOTOS = "dlp_recordatorio_fotos"; // última vez que se vio/pospuso
const CLAVE_COMIDAS = "dlp_comidas"; // primeros alimentos probados, por bebé
const CLAVE_BOLSO_PERSONALIZADO = "dlp_bolso_personalizado"; // ítems propios del bolso, por grupo
const CLAVE_RECORDATORIOS = "dlp_recordatorios"; // Mis recordatorios (propios, no sugieren dosis)
const CLAVE_AVISO_AL_ABRIR = "dlp_aviso_al_abrir_fecha"; // último día en que se mostró

// Cada vez que se guarda algo nuevo (menos al borrar todo), avisamos por acá.
// Lo escucha nube.js para mandar una copia a Supabase, sin que este archivo
// tenga que saber nada de la nube (evita depender uno del otro).
function notificarCambio() {
  window.dispatchEvent(new Event("dlp:datos-cambiaron"));
}

export function obtenerPerfil() {
  const texto = localStorage.getItem(CLAVE_PERFIL);
  return texto ? JSON.parse(texto) : null;
}

export function guardarPerfil(perfil) {
  localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
  notificarCambio();
}

export function borrarPerfil() {
  localStorage.removeItem(CLAVE_PERFIL);
  localStorage.removeItem(CLAVE_MARCAS);
  localStorage.removeItem(CLAVE_MEDICIONES);
  localStorage.removeItem(CLAVE_RECORDATORIO_FOTOS);
  localStorage.removeItem(CLAVE_COMIDAS);
  localStorage.removeItem(CLAVE_BOLSO_PERSONALIZADO);
  localStorage.removeItem(CLAVE_RECORDATORIOS);
  localStorage.removeItem(CLAVE_AVISO_AL_ABRIR);
}

export function obtenerMarcas() {
  const texto = localStorage.getItem(CLAVE_MARCAS);
  return texto ? JSON.parse(texto) : {};
}

export function marcarTarea(idTarea, hecha, fechaIso) {
  const marcas = obtenerMarcas();
  if (hecha) {
    marcas[idTarea] = { hecha: true, fecha: fechaIso };
  } else {
    delete marcas[idTarea];
  }
  localStorage.setItem(CLAVE_MARCAS, JSON.stringify(marcas));
  notificarCambio();
}

export function estaMarcada(idTarea) {
  const marcas = obtenerMarcas();
  return Boolean(marcas[idTarea]?.hecha);
}

/* --------------------------- Crecimiento --------------------------- */

function obtenerTodasLasMediciones() {
  const texto = localStorage.getItem(CLAVE_MEDICIONES);
  return texto ? JSON.parse(texto) : {};
}

/** Mediciones de un bebé (por índice en perfil.bebes), ordenadas por fecha. */
export function obtenerMediciones(indiceBebe) {
  const todas = obtenerTodasLasMediciones();
  const lista = todas[indiceBebe] || [];
  return [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** medicion: { fecha (iso), pesoKg, tallaCm, perimetroCm } */
export function agregarMedicion(indiceBebe, medicion) {
  const todas = obtenerTodasLasMediciones();
  const lista = todas[indiceBebe] || [];
  lista.push({ id: `${Date.now()}`, ...medicion });
  todas[indiceBebe] = lista;
  localStorage.setItem(CLAVE_MEDICIONES, JSON.stringify(todas));
  notificarCambio();
}

export function eliminarMedicion(indiceBebe, idMedicion) {
  const todas = obtenerTodasLasMediciones();
  todas[indiceBebe] = (todas[indiceBebe] || []).filter((m) => m.id !== idMedicion);
  localStorage.setItem(CLAVE_MEDICIONES, JSON.stringify(todas));
  notificarCambio();
}

/* ---- Puente entre "Hoy te toca" (control hecho) y Crecimiento ---- */
// Flag en memoria (no se guarda): para que al marcar un control como hecho,
// Crecimiento sepa que tiene que abrir el formulario de carga solo.
let indiceBebeParaAbrirFormulario = null;

export function pedirAperturaFormularioCrecimiento(indiceBebe) {
  indiceBebeParaAbrirFormulario = indiceBebe;
}

export function tomarAperturaFormularioCrecimiento() {
  const valor = indiceBebeParaAbrirFormulario;
  indiceBebeParaAbrirFormulario = null;
  return valor;
}

/* ------------------- Recordatorio "¿Guardamos tus fotos?" ------------------- */

const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export function debeMostrarRecordatorioFotos() {
  const ultima = localStorage.getItem(CLAVE_RECORDATORIO_FOTOS);
  if (!ultima) return true;
  return Date.now() - Number(ultima) >= SIETE_DIAS_MS;
}

export function posponerRecordatorioFotos() {
  localStorage.setItem(CLAVE_RECORDATORIO_FOTOS, String(Date.now()));
}

/* ------------------------------- Comidas ------------------------------- */

function obtenerTodasLasComidas() {
  const texto = localStorage.getItem(CLAVE_COMIDAS);
  return texto ? JSON.parse(texto) : {};
}

/** Alimentos probados de un bebé: { [alimentoId]: { reaccion, fechaIso } } */
export function obtenerAlimentosProbados(indiceBebe) {
  const todas = obtenerTodasLasComidas();
  return todas[indiceBebe] || {};
}

export function marcarAlimentoProbado(indiceBebe, alimentoId, reaccion, fechaIso) {
  const todas = obtenerTodasLasComidas();
  const deEsteBebe = todas[indiceBebe] || {};
  if (reaccion) {
    deEsteBebe[alimentoId] = { reaccion, fechaIso };
  } else {
    delete deEsteBebe[alimentoId];
  }
  todas[indiceBebe] = deEsteBebe;
  localStorage.setItem(CLAVE_COMIDAS, JSON.stringify(todas));
  notificarCambio();
}

/* ------------------------- Bolso de maternidad ------------------------- */

function obtenerTodoElBolsoPersonalizado() {
  const texto = localStorage.getItem(CLAVE_BOLSO_PERSONALIZADO);
  return texto ? JSON.parse(texto) : {};
}

/** Ítems propios de un grupo del bolso: [{ id, nombre }] */
export function obtenerItemsPersonalizadosBolso(grupoId) {
  const todo = obtenerTodoElBolsoPersonalizado();
  return todo[grupoId] || [];
}

export function agregarItemPersonalizadoBolso(grupoId, nombre) {
  const todo = obtenerTodoElBolsoPersonalizado();
  const lista = todo[grupoId] || [];
  lista.push({ id: `p${Date.now()}`, nombre });
  todo[grupoId] = lista;
  localStorage.setItem(CLAVE_BOLSO_PERSONALIZADO, JSON.stringify(todo));
  notificarCambio();
}

export function eliminarItemPersonalizadoBolso(grupoId, itemId) {
  const todo = obtenerTodoElBolsoPersonalizado();
  todo[grupoId] = (todo[grupoId] || []).filter((item) => item.id !== itemId);
  localStorage.setItem(CLAVE_BOLSO_PERSONALIZADO, JSON.stringify(todo));
  notificarCambio();
}

/* ------------------------------ Mis recordatorios ------------------------------ */
// recordatorio: { id, paraQuien: 'mama'|bebeIndice, que, comoIndicado,
//                 horarios: ["09:00", ...], hastaCuando: 'fecha'|'indefinido', fechaFin }

export function obtenerRecordatorios() {
  const texto = localStorage.getItem(CLAVE_RECORDATORIOS);
  return texto ? JSON.parse(texto) : [];
}

export function guardarRecordatorio(recordatorio) {
  const lista = obtenerRecordatorios();
  lista.push({ id: `r${Date.now()}`, ...recordatorio });
  localStorage.setItem(CLAVE_RECORDATORIOS, JSON.stringify(lista));
  notificarCambio();
}

export function eliminarRecordatorio(id) {
  const lista = obtenerRecordatorios().filter((r) => r.id !== id);
  localStorage.setItem(CLAVE_RECORDATORIOS, JSON.stringify(lista));
  notificarCambio();
}

/* --------------------------- Aviso al abrir --------------------------- */

export function yaSeMostroElAvisoHoy(fechaIso) {
  return localStorage.getItem(CLAVE_AVISO_AL_ABRIR) === fechaIso;
}

export function marcarAvisoAlAbrirMostrado(fechaIso) {
  localStorage.setItem(CLAVE_AVISO_AL_ABRIR, fechaIso);
  notificarCambio();
}

/* ------------------------- Sincronización con la nube ------------------------- */
// Todo lo de acá abajo es texto/números (nunca fotos): es lo único que se
// manda a Supabase para el respaldo (ver nube.js).

export function exportarTodoParaNube() {
  return {
    perfil: obtenerPerfil(),
    marcas: obtenerMarcas(),
    mediciones: obtenerTodasLasMediciones(),
    comidas: obtenerTodasLasComidas(),
    bolso_personalizado: obtenerTodoElBolsoPersonalizado(),
    recordatorios: obtenerRecordatorios(),
    aviso_al_abrir_fecha: localStorage.getItem(CLAVE_AVISO_AL_ABRIR),
  };
}

/** Escribe en este celular lo que vino de la nube (al iniciar sesión). No
 * dispara notificarCambio: sería subir de vuelta lo que acabamos de bajar. */
export function importarTodoDesdeNube(datos) {
  if (!datos) return;
  if (datos.perfil) localStorage.setItem(CLAVE_PERFIL, JSON.stringify(datos.perfil));
  if (datos.marcas) localStorage.setItem(CLAVE_MARCAS, JSON.stringify(datos.marcas));
  if (datos.mediciones) localStorage.setItem(CLAVE_MEDICIONES, JSON.stringify(datos.mediciones));
  if (datos.comidas) localStorage.setItem(CLAVE_COMIDAS, JSON.stringify(datos.comidas));
  if (datos.bolso_personalizado) localStorage.setItem(CLAVE_BOLSO_PERSONALIZADO, JSON.stringify(datos.bolso_personalizado));
  if (datos.recordatorios) localStorage.setItem(CLAVE_RECORDATORIOS, JSON.stringify(datos.recordatorios));
  if (datos.aviso_al_abrir_fecha) localStorage.setItem(CLAVE_AVISO_AL_ABRIR, datos.aviso_al_abrir_fecha);
}
