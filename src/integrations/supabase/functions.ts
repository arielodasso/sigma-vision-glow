import { supabase } from "./client";

/**
 * Invoca una edge function usando el access token de la sesión activa.
 *
 * `supabase.functions.invoke` reemplaza el header Authorization por el token del
 * usuario, que es lo que exigen las funciones que validan permisos leyendo
 * `user_roles`. Enviar la publishable key (o ninguna) devuelve 401.
 */
export async function invokeFunction<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    let message = error.message;
    const context = error.context;

    if (context instanceof Response) {
      try {
        const payload = await context.json();
        if (typeof payload?.error === "string" && payload.error) {
          message = payload.error;
        }
      } catch {
        // Respuesta sin cuerpo JSON: se conserva error.message
      }
    }

    throw new Error(message);
  }

  if (data === null || data === undefined) {
    throw new Error(`La función ${functionName} no devolvió respuesta`);
  }

  return data as T;
}
