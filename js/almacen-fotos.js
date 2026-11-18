// Guarda los recuerdos (foto + título + nota) en IndexedDB, que es el
// almacenamiento del navegador pensado para archivos (a diferencia de
// localStorage, que es chico y solo sirve para texto). Sigue siendo "en el
// celular" (sección 2): nada de esto se manda a ningún servidor.

const NOMBRE_DB = "dlp-fotos";
const VERSION_DB = 2; // v2: agrega el almacén "fotosPerfil", sin tocar "recuerdos"
const ALMACEN = "recuerdos";
const ALMACEN_PERFIL = "fotosPerfil";

let promesaDB = null;

function abrirDB() {
  if (promesaDB) return promesaDB;
  promesaDB = new Promise((resolver, rechazar) => {
    const solicitud = indexedDB.open(NOMBRE_DB, VERSION_DB);
    solicitud.onupgradeneeded = () => {
      const db = solicitud.result;
      if (!db.objectStoreNames.contains(ALMACEN)) {
        db.createObjectStore(ALMACEN, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ALMACEN_PERFIL)) {
        db.createObjectStore(ALMACEN_PERFIL, { keyPath: "id" });
      }
    };
    solicitud.onsuccess = () => {
      const db = solicitud.result;
      // Si se abre una versión más nueva en otra pestaña, esta conexión se
      // cierra sola para no bloquearla (y que esa otra pestaña no se quede
      // esperando para siempre).
      db.onversionchange = () => {
        db.close();
        promesaDB = null;
      };
      resolver(db);
    };
    solicitud.onerror = () => rechazar(solicitud.error);
    solicitud.onblocked = () => {
      // Hay otra pestaña vieja de la app abierta que no deja actualizar la
      // base. No podemos forzarla a cerrarse, así que avisamos y dejamos
      // que el código que llamó esta función decida qué hacer (lo normal
      // es seguir sin fotos en vez de colgarse).
      rechazar(new Error("IndexedDB bloqueada por otra pestaña de la app abierta."));
    };
  });
  return promesaDB;
}

/* ------------------------- Fotos de perfil (mamá/bebé) ------------------------- */
// id: "mama" o "bebe-<indice>". Son independientes de los Recuerdos.

export async function guardarFotoPerfil(id, blob) {
  const db = await abrirDB();
  await new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN_PERFIL, "readwrite");
    tx.objectStore(ALMACEN_PERFIL).put({ id, foto: blob });
    tx.oncomplete = () => resolver();
    tx.onerror = () => rechazar(tx.error);
  });
}

export async function obtenerFotoPerfil(id) {
  const db = await abrirDB();
  return new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN_PERFIL, "readonly");
    const solicitud = tx.objectStore(ALMACEN_PERFIL).get(id);
    solicitud.onsuccess = () => resolver(solicitud.result?.foto || null);
    solicitud.onerror = () => rechazar(solicitud.error);
  });
}

/**
 * recuerdo: { tipo, sugeridoId, etapa, bebeIndice, titulo, nota, fechaIso, foto (Blob|null) }
 * Devuelve el recuerdo guardado, con su id.
 */
export async function guardarRecuerdo(recuerdo) {
  const db = await abrirDB();
  const completo = { id: `r${Date.now()}${Math.random().toString(16).slice(2, 6)}`, creadoEl: new Date().toISOString(), ...recuerdo };
  await new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN, "readwrite");
    tx.objectStore(ALMACEN).put(completo);
    tx.oncomplete = () => resolver();
    tx.onerror = () => rechazar(tx.error);
  });
  return completo;
}

export async function listarRecuerdos() {
  const db = await abrirDB();
  return new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN, "readonly");
    const solicitud = tx.objectStore(ALMACEN).getAll();
    solicitud.onsuccess = () => resolver(solicitud.result || []);
    solicitud.onerror = () => rechazar(solicitud.error);
  });
}

export async function eliminarRecuerdo(id) {
  const db = await abrirDB();
  await new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN, "readwrite");
    tx.objectStore(ALMACEN).delete(id);
    tx.oncomplete = () => resolver();
    tx.onerror = () => rechazar(tx.error);
  });
}

export async function eliminarTodosLosRecuerdos() {
  const db = await abrirDB();
  await new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN, "readwrite");
    tx.objectStore(ALMACEN).clear();
    tx.oncomplete = () => resolver();
    tx.onerror = () => rechazar(tx.error);
  });
}

export async function eliminarTodasLasFotosPerfil() {
  const db = await abrirDB();
  await new Promise((resolver, rechazar) => {
    const tx = db.transaction(ALMACEN_PERFIL, "readwrite");
    tx.objectStore(ALMACEN_PERFIL).clear();
    tx.oncomplete = () => resolver();
    tx.onerror = () => rechazar(tx.error);
  });
}
