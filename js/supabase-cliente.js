// Conexión con Supabase (Parte 5: nube y login). La "anon public key" es
// segura de tener acá, en el código que corre en el navegador: la protección
// de verdad la da el RLS (Row Level Security) configurado en la base de
// datos, que hace que cada usuaria solo pueda ver y tocar sus propias filas.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const URL_PROYECTO = "https://voeckmpolmrptrwshhdy.supabase.co";
const CLAVE_PUBLICA = "sb_publishable_xSKSe6C8iPhbnzuiN4LgMg_XObz9b_b";

export const supabase = createClient(URL_PROYECTO, CLAVE_PUBLICA);
