import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();
    const { task_id, old_status, new_status, assignee_id } = body;

    if (!task_id || !new_status) {
      return new Response(JSON.stringify({ error: "task_id y new_status requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: task } = await supabase
      .from("tasks")
      .select("*, assignee:profiles!tasks_assignee_id_fkey(full_name, email), creator:profiles!tasks_created_by_fkey(full_name, email)")
      .eq("id", task_id)
      .single();

    if (!task) {
      return new Response(JSON.stringify({ error: "Tarea no encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: superadmins } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["superadmin", "admin"]);

    if (!superadmins || superadmins.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No hay superadmins" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const superadminIds = superadmins.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", superadminIds);

    const emails = profiles?.map((p) => p.email).filter(Boolean) || [];
    if (emails.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "Sin emails de superadmin" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusLabels: Record<string, string> = {
      pending: "Pendiente",
      in_progress: "En progreso",
      done: "Completada",
      cancelled: "Cancelada",
    };

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY && emails.length > 0) {
      const assigneeName = task.assignee?.full_name || task.assignee?.email || "Sin asignar";
      const htmlBody = `
        <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #0B0D10; color: #fff; border-radius: 16px; overflow: hidden;">
          <div style="padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.1);">
            <span style="font-weight: bold; font-size: 18px; color: #fff;">Sigma</span>
            <span style="font-weight: 400; font-size: 18px; color: rgba(255,255,255,0.7);">Tecnologías</span>
          </div>
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 24px; font-size: 22px; color: #fff;">Actualización de tarea</h2>
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px; width: 120px;">Tarea:</td>
                <td style="padding: 8px 0; color: #fff; font-size: 14px; font-weight: 600;">${task.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Asignado a:</td>
                <td style="padding: 8px 0; color: #fff; font-size: 14px;">${assigneeName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Estado anterior:</td>
                <td style="padding: 8px 0; color: #fff; font-size: 14px;">${old_status ? statusLabels[old_status] : "—"}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Estado nuevo:</td>
                <td style="padding: 8px 0; color: #E2FC03; font-size: 14px; font-weight: 600;">${statusLabels[new_status]}</td>
              </tr>
              ${task.due_date ? `<tr>
                <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Vence:</td>
                <td style="padding: 8px 0; color: #fff; font-size: 14px;">${new Date(task.due_date).toLocaleDateString("es-AR")}</td>
              </tr>` : ""}
            </table>
            ${task.description ? `<div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <p style="margin: 0; font-size: 14px; color: #fff; line-height: 1.6;">${task.description}</p>
            </div>` : ""}
          </div>
        </div>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Sigma Tecnologías <contacto@sigmatecnologiasarg.com>",
          to: emails,
          subject: `Tarea "${task.title}" - ${statusLabels[new_status]}`,
          html: htmlBody,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, notified: emails.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[notify-task] Error:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});