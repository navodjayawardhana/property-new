import { request } from "./api";

export type Page<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
};
export type Campaign = {
  id: number;
  name: string;
  subject: string;
  body: string;
  recipient_group: string;
  contact_ids: number[] | null;
  template_id: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  recipients_count: number;
  queued_count: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
};
export type Template = {
  id: number;
  name: string;
  subject: string;
  body: string;
};
export type Contact = {
  id: number;
  name: string;
  email: string;
  source: string;
  consented_at: string | null;
  unsubscribed_at: string | null;
};
export type Suppression = { id: number; email: string; reason: string };
export type Attempt = {
  id: number;
  number: number;
  status: string;
  error: string | null;
  created_at: string;
};
export type Recipient = {
  id: number;
  name: string;
  email: string;
  status: string;
  attempts: number;
  error: string | null;
  sent_at: string | null;
  send_attempts: Attempt[];
};
export type Activity = { id: number; action: string; created_at: string };
export type CampaignDetail = {
  campaign: Campaign;
  eligible_count: number;
  recipients: Page<Recipient>;
  activity: Activity[];
};
export type EmailStats = {
  campaigns: number;
  recipients: number;
  sent: number;
  failed: number;
  queued: number;
  eligible_contacts: number;
};
export type CampaignInput = {
  name: string;
  subject: string;
  body: string;
  recipient_group: string;
  contact_ids: number[];
  template_id: number | null;
  submission_key?: string;
};

const base = "/admin/bulk-email";
export function bulkEmailApi(token: string) {
  const get = <T>(url: string) => request<T>(base + url, { token });
  const send = <T>(url: string, body?: unknown, method = "POST") =>
    request<T>(base + url, { token, method, body });
  return {
    stats: () => get<EmailStats>("/stats"),
    campaigns: (page = 1, status = "", search = "") =>
      get<Page<Campaign>>(
        `/campaigns?${new URLSearchParams({ page: String(page), status, search })}`,
      ),
    campaign: (id: number, page = 1) =>
      get<CampaignDetail>(`/campaigns/${id}?page=${page}`),
    save: (data: CampaignInput, id?: number) =>
      send<Campaign>(
        id ? `/campaigns/${id}` : "/campaigns",
        data,
        id ? "PUT" : "POST",
      ),
    action: (id: number, action: string) =>
      send<Campaign & { message?: string }>(`/campaigns/${id}/${action}`, {
        confirmed: true,
      }),
    audience: (group: string, ids: number[]) =>
      send<{ count: number }>("/audience", {
        recipient_group: group,
        contact_ids: ids,
      }),
    preview: (body: string) => send<{ html: string }>("/preview", { body }),
    templates: (page = 1) => get<Page<Template>>(`/templates?page=${page}`),
    saveTemplate: (data: Omit<Template, "id">, id?: number) =>
      send<Template>(
        id ? `/templates/${id}` : "/templates",
        data,
        id ? "PUT" : "POST",
      ),
    deleteTemplate: (id: number) =>
      send(`/templates/${id}`, undefined, "DELETE"),
    contacts: (page = 1, search = "", eligible = false, group = "all") =>
      get<Page<Contact>>(
        `/contacts?${new URLSearchParams({ page: String(page), search, eligible: eligible ? "1" : "0", group })}`,
      ),
    addContact: (data: {
      name: string;
      email: string;
      source: string;
      consent_evidence: string;
      consent_confirmed: boolean;
    }) => send<Contact>("/contacts", data),
    suppressions: (page = 1) =>
      get<Page<Suppression>>(`/suppressions?page=${page}`),
    suppress: (email: string, reason: string) =>
      send<Suppression>("/suppressions", { email, reason }),
    unsuppress: (id: number) =>
      send(`/suppressions/${id}`, undefined, "DELETE"),
  };
}
