// Sincronización con Supabase (Parte 5): sube el respaldo de texto/números
// cada vez que algo cambia, y lo baja al iniciar sesión (por si el celular
// es nuevo). Las fotos nunca pasan por acá: quedan solo en este celular.
import { supabase } from "./supabase-cliente.js";
import { exportarTodoParaNube, importarTodoDesdeNube } from "./almacenamiento.js";

let temporizadorSubida = null;
let usuarioActual = null;

export function activarSincronizacion(userId) {
  usuarioActual = userId;
  window.addEventListener("dlp:datos-cambiaron", alCambiarAlgo);
}

export function desactivarSincronizacion() {
  usuarioActual = null;
  window.removeEventListener("dlp:datos-cambiaron", alCambiarAlgo);
  clearTimeout(temporizadorSubida);
}

function alCambiarAlgo() {
  if (!usuarioActual) return;
  // Esperamos un poquito de inactividad antes de subir, para no mandar un
  // pedido a Supabase por cada tilde o letra que se escribe seguido.
  clearTimeout(temporizadorSubida);
  temporizadorSubida = setTimeout(() => subirALaNube(usuarioActual), 1500);
}

async function subirALaNube(userId) {
  const datos = { ...exportarTodoParaNube(), actualizado_el: new Date().toISOString() };

  // No usamos upsert: Postgres le exige a "authenticated" permiso de UPDATE
  // sobre TODA la tabla (incluidas acceso_activo/activado_el) para ese tipo
  // de consulta combinada, lo que rompería el bloqueo de esas dos columnas
  // (ver sql/03-bloquear-columnas-acceso.sql). Por eso hacemos primero un
  // update común, y si no existía la fila (cuenta recién creada), recién
  // ahí un insert aparte — los dos funcionan bien con permisos por columna.
  const { data: filasActualizadas, error: errorUpdate } = await supabase
    .from("datos_usuaria")
    .update(datos)
    .eq("user_id", userId)
    .select("user_id");

  if (errorUpdate) {
    console.error("No se pudo guardar el respaldo en la nube:", errorUpdate);
    return;
  }

  if (!filasActualizadas || filasActualizadas.length === 0) {
    const { error: errorInsert } = await supabase
      .from("datos_usuaria")
      .insert({ user_id: userId, ...datos });
    if (errorInsert) {
      // No bloqueamos nada por esto: los datos siguen guardados en el
      // celular igual. Si falla (por ejemplo, sin internet), se va a
      // reintentar en el próximo cambio.
      console.error("No se pudo guardar el respaldo en la nube:", errorInsert);
    }
  }
}

/** Trae el respaldo de la nube y lo escribe en este celular. Se usa al
 * iniciar sesión, antes de mostrar cualquier pantalla. */
export async function descargarDesdeLaNube(userId) {
  const { data, error } = await supabase
    .from("datos_usuaria")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("No se pudo traer el respaldo de la nube:", error);
    return null;
  }
  importarTodoDesdeNube(data);
  return data;
}
