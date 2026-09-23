export type ContractType = "desarrollo" | "mantenimiento" | "general";
export type ContractStatus = "draft" | "sent" | "signed";

export interface Contract {
  id: string;
  client_id: string | null;
  title: string;
  contract_type: ContractType;
  amount: number | null;
  currency: string;
  project: string | null;
  body: string;
  status: ContractStatus;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  client?: { name: string; company: string | null; email: string | null };
}

export interface ContractTemplate {
  id: string;
  name: string;
  contract_type: ContractType;
  body: string;
}

export interface ClientOption {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}

export const contractTypeLabels: Record<ContractType, string> = {
  desarrollo: "Desarrollo",
  mantenimiento: "Mantenimiento",
  general: "General",
};

export const contractTypeColors: Record<ContractType, string> = {
  desarrollo: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  mantenimiento: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  general: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  draft: "Borrador",
  sent: "Enviado",
  signed: "Firmado",
};

export const contractStatusColors: Record<ContractStatus, string> = {
  draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  signed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export interface ContractVars {
  cliente: string;
  empresa: string;
  proyecto: string;
  moneda: string;
  monto: string;
  fecha: string;
}

export const buildVars = (
  c: Pick<Contract, "client_id" | "project" | "amount" | "currency">,
  client?: ClientOption | { name: string; company: string | null }
): ContractVars => {
  const amount = c.amount ?? 0;
  return {
    cliente: client?.name || (c.client_id ? "EL CLIENTE" : ""),
    empresa: client?.company ? ` (${client.company})` : "",
    proyecto: c.project || "el proyecto",
    moneda: c.currency || "ARS",
    monto: amount.toLocaleString("es-AR", { maximumFractionDigits: 2 }),
    fecha: new Date().toLocaleDateString("es-AR"),
  };
};

export const fillTokens = (body: string, vars: ContractVars): string => {
  return body
    .replace(/\{\{cliente\}\}/g, vars.cliente)
    .replace(/\{\{empresa\}\}/g, vars.empresa)
    .replace(/\{\{proyecto\}\}/g, vars.proyecto)
    .replace(/\{\{moneda\}\}/g, vars.moneda)
    .replace(/\{\{monto\}\}/g, vars.monto)
    .replace(/\{\{fecha\}\}/g, vars.fecha);
};

export const toHtml = (plain: string): string =>
  plain
    .split("\n")
    .map((line) => (/^\d+\./.test(line.trim()) ? `<h3>${line.trim()}</h3>` : `<p>${line || "&nbsp;"}</p>`))
    .join("");