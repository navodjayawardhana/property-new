"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  bulkEmailApi,
  type Campaign,
  type CampaignDetail,
  type CampaignInput,
  type Contact,
  type EmailStats,
  type Page,
  type Suppression,
  type Template,
} from "@/lib/bulk-email-api";
import { useDebouncedValue } from "@/lib/use-debounced-value";

const input =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-green-600";
const button =
  "rounded-lg bg-[#16a34a] text-white px-4 py-2 text-sm font-semibold disabled:opacity-40";
const secondary =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40";
const groups = [
  ["users", "Registered users with consent"],
  ["customers", "Customers with consent"],
  ["agents", "Property agents with consent"],
  ["subscribers", "Newsletter subscribers with consent"],
  ["custom", "Select individual contacts"],
];
const starters = [
  {
    name: "New Property Announcements",
    subject: "Discover new properties on Greenbricks",
    body: "<h2>New properties to explore</h2><p>Hello {{recipient_name}},</p><p>Explore our latest property listings.</p>",
  },
  {
    name: "Property Offers and Promotions",
    subject: "Property offers from Greenbricks",
    body: "<h2>Property offers</h2><p>Hello {{recipient_name}},</p><p>Add the details and terms of your offer here.</p>",
  },
  {
    name: "Company News and Updates",
    subject: "The latest from Greenbricks",
    body: "<h2>Greenbricks news</h2><p>Hello {{recipient_name}},</p><p>Share your company update here.</p>",
  },
  {
    name: "Agent Announcements",
    subject: "Meet our property agents",
    body: "<h2>Agent announcements</h2><p>Hello {{recipient_name}},</p><p>Introduce an agent or company here.</p>",
  },
  {
    name: "General Notifications",
    subject: "An update from Greenbricks",
    body: "<p>Hello {{recipient_name}},</p><p>Add your marketing update here.</p>",
  },
];
function message(error: unknown) {
  const value = error as Error & { errors?: Record<string, string[]> };
  return value.errors
    ? Object.values(value.errors).flat().join(" ")
    : value.message || "Something went wrong.";
}
function date(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "-";
}
function Status({ value }: { value: string }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-2 py-1 text-xs font-semibold">
      {value.replaceAll("_", " ")}
    </span>
  );
}
function Pagination({
  page,
  last,
  change,
}: {
  page: number;
  last: number;
  change: (page: number) => void;
}) {
  return last > 1 ? (
    <nav
      aria-label="Email section pagination"
      className="flex flex-wrap justify-center items-center gap-3 mt-5"
    >
      <button
        className={secondary}
        disabled={page === 1}
        onClick={() => change(page - 1)}
      >
        Previous
      </button>
      <span className="text-sm">
        Page {page} of {last}
      </span>
      <button
        className={secondary}
        disabled={page >= last}
        onClick={() => change(page + 1)}
      >
        Next
      </button>
    </nav>
  ) : null;
}

function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (body: string) => void;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const last = useRef("");
  useEffect(() => {
    if (editor.current && value !== last.current) {
      editor.current.innerHTML = value;
      last.current = value;
    }
  }, [value]);
  const update = () => {
    const html = editor.current?.innerHTML ?? "";
    last.current = html;
    onChange(html);
  };
  const format = (command: string) => {
    editor.current?.focus();
    document.execCommand(command);
    update();
  };
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-50">
        {[
          ["bold", "Bold"],
          ["italic", "Italic"],
          ["underline", "Underline"],
          ["insertUnorderedList", "Bullet list"],
          ["insertOrderedList", "Numbered list"],
          ["removeFormat", "Clear format"],
        ].map(([command, label]) => (
          <button
            key={command}
            type="button"
            className={secondary}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => format(command)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        ref={editor}
        role="textbox"
        aria-label="Email body"
        aria-multiline="true"
        contentEditable
        suppressContentEditableWarning
        className="min-h-56 p-4 text-sm outline-none break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        onInput={update}
        onPaste={(event) => {
          event.preventDefault();
          document.execCommand(
            "insertText",
            false,
            event.clipboardData.getData("text/plain"),
          );
          update();
        }}
        onDrop={(event) => event.preventDefault()}
      />
      <p className="text-xs text-gray-500 px-4 pb-3">
        Use {"{{recipient_name}}"} for the recipient name. Pasted content is
        plain text. HTML is sanitized by the server.
      </p>
    </div>
  );
}

export default function BulkEmailDashboard({ token }: { token: string }) {
  const api = useMemo(() => bulkEmailApi(token), [token]);
  const [tab, setTab] = useState("campaigns");
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [campaigns, setCampaigns] = useState<Page<Campaign> | null>(null);
  const [templates, setTemplates] = useState<Page<Template> | null>(null);
  const [contacts, setContacts] = useState<Page<Contact> | null>(null);
  const [suppressions, setSuppressions] = useState<Page<Suppression> | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search, 250);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<"campaign" | "template" | null>(null);
  const [editId, setEditId] = useState<number | undefined>();
  const key = useRef("");
  const [form, setForm] = useState<CampaignInput>({
    name: "",
    subject: "",
    body: "<p>Hello {{recipient_name}},</p>",
    recipient_group: "users",
    contact_ids: [],
    template_id: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [selected, setSelected] = useState<Contact[]>([]);
  const [selectionPage, setSelectionPage] = useState(1);
  const [selectionSearch, setSelectionSearch] = useState("");
  const selectionQuery = useDebouncedValue(selectionSearch, 250);
  const [selection, setSelection] = useState<Page<Contact> | null>(null);
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailPage, setDetailPage] = useState(1);
  const [confirm, setConfirm] = useState<{ id: number; action: string } | null>(
    null,
  );
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    source: "recorded",
    consent_evidence: "",
    consent_confirmed: false,
  });
  const [suppressionForm, setSuppressionForm] = useState({
    email: "",
    reason: "",
  });

  const reload = () => setRefresh((value) => value + 1);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.stats(),
      tab === "campaigns"
        ? api.campaigns(page, filter, query)
        : tab === "templates"
          ? api.templates(page)
          : tab === "recipients"
            ? api.contacts(page, query)
            : api.suppressions(page),
    ])
      .then(([summary, result]) => {
        if (!active) return;
        setStats(summary);
        if (tab === "campaigns") setCampaigns(result as Page<Campaign>);
        else if (tab === "templates") setTemplates(result as Page<Template>);
        else if (tab === "recipients") setContacts(result as Page<Contact>);
        else setSuppressions(result as Page<Suppression>);
      })
      .catch((e) => {
        if (active) setError(message(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, tab, page, filter, query, refresh]);
  useEffect(() => {
    if (!detailId) return;
    let active = true;
    const load = () =>
      Promise.all([api.campaign(detailId, detailPage), api.stats()])
        .then(([result, summary]) => {
          if (active) {
            setDetail(result);
            setStats(summary);
          }
        })
        .catch((e) => {
          if (active) setError(message(e));
        });
    load();
    const interval = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [api, detailId, detailPage, refresh]);
  useEffect(() => {
    if (editor !== "campaign") return;
    let active = true;
    setCount(null);
    api
      .audience(form.recipient_group, form.contact_ids)
      .then((result) => {
        if (active) setCount(result.count);
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [api, editor, form.recipient_group, form.contact_ids, refresh]);
  useEffect(() => {
    if (editor !== "campaign" || form.recipient_group !== "custom") return;
    let active = true;
    api
      .contacts(selectionPage, selectionQuery, true)
      .then((result) => {
        if (active) setSelection(result);
      })
      .catch((e) => {
        if (active) setError(message(e));
      });
    return () => {
      active = false;
    };
  }, [api, editor, form.recipient_group, selectionPage, selectionQuery]);

  async function run(action: () => Promise<void>) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      reload();
    } catch (e) {
      setError(message(e));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  function openEditor(
    kind: "campaign" | "template",
    item?: Campaign | Template,
  ) {
    setEditor(kind);
    setEditId(item?.id);
    key.current = crypto.randomUUID();
    setPreview(null);
    setDetailId(null);
    setDetail(null);
    setSelected([]);
    setError("");
    setForm({
      name: item?.name ?? "",
      subject: item?.subject ?? "",
      body: item?.body ?? "<p>Hello {{recipient_name}},</p>",
      recipient_group:
        item && "recipient_group" in item ? item.recipient_group : "users",
      contact_ids:
        item && "contact_ids" in item ? (item.contact_ids ?? []) : [],
      template_id: item && "template_id" in item ? item.template_id : null,
    });
  }
  async function save() {
    await run(async () => {
      if (editor === "template")
        await api.saveTemplate(
          { name: form.name, subject: form.subject, body: form.body },
          editId,
        );
      else {
        const result = await api.save(
          { ...form, submission_key: key.current },
          editId,
        );
        setDetailId(result.id);
        setDetailPage(1);
      }
      setEditor(null);
      setNotice(
        editor === "template"
          ? "Template saved."
          : "Campaign saved as draft. Review it before confirming a send.",
      );
    });
  }
  async function action() {
    if (!confirm) return;
    await run(async () => {
      const result = await api.action(confirm.id, confirm.action);
      setNotice(
        result.message ??
          `Campaign ${confirm.action === "send" ? "queued" : confirm.action + " requested"}.`,
      );
      setConfirm(null);
    });
  }
  function toggle(contact: Contact) {
    setForm((current) => ({
      ...current,
      contact_ids: current.contact_ids.includes(contact.id)
        ? current.contact_ids.filter((id) => id !== contact.id)
        : [...current.contact_ids, contact.id],
    }));
    setSelected((current) =>
      current.some((value) => value.id === contact.id)
        ? current.filter((value) => value.id !== contact.id)
        : [...current, contact],
    );
  }
  const field = (name: "name" | "subject") => (
    <label className="block text-sm font-semibold text-gray-700">
      {name === "name" ? "Name" : "Email subject"}
      <input
        required
        maxLength={255}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        className={input + " mt-2"}
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Bulk Emailing</h2>
          <p className="text-sm text-gray-500 mt-1">
            Create campaigns for consented recipients and monitor sending
            progress.
          </p>
        </div>
        <button className={button} onClick={() => openEditor("campaign")}>
          Create campaign
        </button>
      </div>
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-6 gap-3">
          {[
            ["Campaigns", stats.campaigns],
            ["Recipients", stats.recipients],
            ["Accepted by mailer", stats.sent],
            ["Failed / uncertain", stats.failed],
            ["Pending", stats.queued],
            ["Eligible contacts", stats.eligible_contacts],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 p-4"
            >
              <p className="text-2xl font-black">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">
        Sent means accepted by the configured mail transport. Delivery and opens
        are not tracked.
      </p>
      <nav aria-label="Bulk email sections" className="flex flex-wrap gap-2">
        {["campaigns", "templates", "recipients", "suppressions"].map(
          (value) => (
            <button
              key={value}
              className={tab === value ? button : secondary}
              onClick={() => {
                setTab(value);
                setPage(1);
                setSearch("");
                setEditor(null);
                setDetailId(null);
                setDetail(null);
              }}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ),
        )}
        <button className={secondary} onClick={reload}>
          Refresh
        </button>
      </nav>
      {error && (
        <div role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl">
          {error}{" "}
          <button className="underline" onClick={reload}>
            Retry
          </button>
        </div>
      )}
      {notice && (
        <p role="status" className="p-4 bg-green-50 text-green-800 rounded-xl">
          {notice}
        </p>
      )}

      {editor && (
        <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
          <h3 className="text-lg font-bold">
            {editId ? "Edit" : "Create"}{" "}
            {editor === "campaign" ? "draft campaign" : "email template"}
          </h3>
          <div className="flex flex-wrap gap-2">
            <label className="text-sm">
              Start from a suggested template
              <select
                className={input}
                value=""
                onChange={(e) => {
                  const item = starters[Number(e.target.value)];
                  setForm({
                    ...form,
                    name: item.name,
                    subject: item.subject,
                    body: item.body,
                  });
                }}
              >
                <option value="">Choose a starting point</option>
                {starters.map((item, i) => (
                  <option key={item.name} value={i}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className={secondary}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const result = await api.templates();
                  setTemplates(result);
                  setNotice(
                    "Saved templates loaded below. Choose Use in campaign to start a new draft.",
                  );
                })
              }
            >
              Load saved templates
            </button>
          </div>
          {editor === "campaign" && templates && (
            <label className="block text-sm font-semibold">
              Saved template
              <select
                className={input}
                value={form.template_id ?? ""}
                onChange={(event) => {
                  const template = templates.data.find(
                    (item) => item.id === Number(event.target.value),
                  );
                  if (template)
                    setForm({
                      ...form,
                      template_id: template.id,
                      subject: template.subject,
                      body: template.body,
                    });
                }}
              >
                <option value="">Choose a saved template</option>
                {templates.data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {templates.last_page > 1 && (
                <button
                  className={secondary}
                  onClick={() =>
                    run(async () => {
                      setTemplates(
                        await api.templates(
                          templates.current_page >= templates.last_page
                            ? 1
                            : templates.current_page + 1,
                        ),
                      );
                    })
                  }
                >
                  More templates
                </button>
              )}
            </label>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            {field("name")}
            {field("subject")}
          </div>
          <RichEditor
            value={form.body}
            onChange={(body) => setForm((current) => ({ ...current, body }))}
          />
          {editor === "campaign" && (
            <>
              <label className="block text-sm font-semibold">
                Recipient group
                <select
                  className={input + " mt-2"}
                  value={form.recipient_group}
                  onChange={(event) =>
                    setForm({ ...form, recipient_group: event.target.value })
                  }
                >
                  {groups.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-sm text-gray-500">
                Eligible recipients: <strong>{count ?? "Checking..."}</strong>
                {form.recipient_group === "custom" &&
                  ` (${form.contact_ids.length} selected)`}
                . Consent and suppressions are checked again at send time.
              </p>
              {form.recipient_group === "custom" && (
                <div className="border rounded-xl p-4 space-y-3">
                  <label className="block text-sm">
                    Search eligible contacts
                    <input
                      className={input}
                      value={selectionSearch}
                      onChange={(e) => {
                        setSelectionSearch(e.target.value);
                        setSelectionPage(1);
                      }}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.contact_ids.map((id) => (
                      <button
                        key={id}
                        className={secondary}
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            contact_ids: current.contact_ids.filter(
                              (value) => value !== id,
                            ),
                          }));
                          setSelected((current) =>
                            current.filter((contact) => contact.id !== id),
                          );
                        }}
                      >
                        {selected.find((contact) => contact.id === id)?.name ??
                          selection?.data.find((contact) => contact.id === id)
                            ?.name ??
                          `Contact #${id}`}{" "}
                        (remove)
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Existing saved selections are retained across pages. Clear
                    all to reset the selection.
                  </p>
                  <button
                    className={secondary}
                    onClick={() => {
                      setSelected([]);
                      setForm({ ...form, contact_ids: [] });
                    }}
                  >
                    Clear all
                  </button>
                  {selection?.data.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 border-b py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form.contact_ids.includes(contact.id)}
                        onChange={() => toggle(contact)}
                      />
                      <span className="min-w-0 break-all">
                        {contact.name} - {contact.email}
                      </span>
                    </label>
                  ))}
                  {selection?.data.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No eligible contacts. Record evidence of consent in
                      Recipients first.
                    </p>
                  )}
                  {selection && (
                    <Pagination
                      page={selectionPage}
                      last={selection.last_page}
                      change={setSelectionPage}
                    />
                  )}
                </div>
              )}
            </>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              className={button}
              disabled={busy || !form.name.trim() || !form.subject.trim()}
              onClick={save}
            >
              {busy
                ? "Saving..."
                : editor === "campaign"
                  ? "Save draft"
                  : "Save template"}
            </button>
            <button
              className={secondary}
              disabled={busy}
              onClick={() =>
                run(async () => setPreview((await api.preview(form.body)).html))
              }
            >
              Preview email
            </button>
            <button className={secondary} onClick={() => setEditor(null)}>
              Close editor
            </button>
          </div>
          {preview !== null && (
            <iframe
              title="Sanitized email preview"
              sandbox=""
              srcDoc={`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"></head><body style="font-family:Arial;padding:20px">${preview}</body></html>`}
              className="w-full min-h-64 border rounded-xl"
            />
          )}
        </section>
      )}

      {!editor && detailId && (
        <section className="bg-white rounded-2xl border p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-3 justify-between">
            <h3 className="font-bold text-lg">Campaign history and progress</h3>
            <button
              className={secondary}
              onClick={() => {
                setDetailId(null);
                setDetail(null);
              }}
            >
              Close history
            </button>
          </div>
          {!detail ? (
            <p>Loading history...</p>
          ) : (
            <>
              <h4 className="font-bold">{detail.campaign.name}</h4>
              <p className="text-sm">{detail.campaign.subject}</p>
              <Status value={detail.campaign.status} />
              <p className="text-sm text-gray-600">
                Recipient group:{" "}
                {
                  groups.find(
                    ([value]) => value === detail.campaign.recipient_group,
                  )?.[1]
                }{" "}
                | Currently eligible: {detail.eligible_count}
              </p>
              <iframe
                title="Saved campaign email preview"
                sandbox=""
                srcDoc={
                  '<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'"></head><body style="font-family:Arial;padding:20px">' +
                  detail.campaign.body +
                  "</body></html>"
                }
                className="w-full min-h-56 border rounded-xl"
              />
              <p className="text-sm text-gray-500">
                Created {date(detail.campaign.created_at)} | Completed{" "}
                {date(detail.campaign.completed_at)}
              </p>
              <progress
                aria-label="Campaign sending progress"
                className="w-full accent-green-600"
                max={detail.campaign.recipients_count || 1}
                value={
                  detail.campaign.sent_count +
                  detail.campaign.failed_count +
                  detail.campaign.skipped_count
                }
              />
              <p className="text-sm">
                {detail.campaign.recipients_count} recipients |{" "}
                {detail.campaign.queued_count} pending |{" "}
                {detail.campaign.sent_count} accepted |{" "}
                {detail.campaign.failed_count} failed / uncertain |{" "}
                {detail.campaign.skipped_count} skipped / cancelled
              </p>
              <div className="flex flex-wrap gap-2">
                {detail.campaign.status === "draft" && (
                  <>
                    <button
                      className={secondary}
                      onClick={() => openEditor("campaign", detail.campaign)}
                    >
                      Edit draft
                    </button>
                    <button
                      className={button}
                      onClick={() =>
                        setConfirm({ id: detailId, action: "send" })
                      }
                    >
                      Review and send
                    </button>
                  </>
                )}
                <button
                  className={secondary}
                  disabled={busy}
                  onClick={() => setConfirm({ id: detailId, action: "test" })}
                >
                  Send test to me
                </button>
                {["queued", "sending"].includes(detail.campaign.status) && (
                  <button
                    className={secondary}
                    onClick={() =>
                      setConfirm({ id: detailId, action: "pause" })
                    }
                  >
                    Pause
                  </button>
                )}
                {detail.campaign.status === "paused" && (
                  <button
                    className={secondary}
                    onClick={() =>
                      setConfirm({ id: detailId, action: "resume" })
                    }
                  >
                    Resume
                  </button>
                )}
                {["draft", "queued", "sending", "paused"].includes(
                  detail.campaign.status,
                ) && (
                  <button
                    className={secondary}
                    onClick={() =>
                      setConfirm({ id: detailId, action: "cancel" })
                    }
                  >
                    Cancel campaign
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Recipient</th>
                      <th>Status</th>
                      <th>Attempts and diagnostic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.recipients.data.map((recipient) => (
                      <tr key={recipient.id} className="border-b">
                        <td className="p-2 max-w-60 break-all">
                          {recipient.name}
                          <br />
                          <span className="text-xs text-gray-500">
                            {recipient.email}
                          </span>
                        </td>
                        <td>
                          <Status value={recipient.status} />
                        </td>
                        <td className="p-2">
                          {recipient.error}
                          <details>
                            <summary>{recipient.attempts} attempts</summary>
                            {recipient.send_attempts.map((attempt) => (
                              <p key={attempt.id} className="text-xs py-1">
                                #{attempt.number} {attempt.status}{" "}
                                {date(attempt.created_at)} {attempt.error}
                              </p>
                            ))}
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                page={detailPage}
                last={detail.recipients.last_page}
                change={setDetailPage}
              />
              <h4 className="font-bold text-sm">Recent campaign activity</h4>
              {detail.activity.map((item) => (
                <p key={item.id} className="text-xs text-gray-500">
                  {date(item.created_at)} {item.action}
                </p>
              ))}
            </>
          )}
        </section>
      )}

      {!editor && !detailId && (
        <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
          {tab === "campaigns" && (
            <>
              <div className="flex flex-wrap gap-3">
                <label className="flex-1 min-w-40 text-sm">
                  Search campaigns
                  <input
                    className={input}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
                <label className="text-sm">
                  Status
                  <select
                    className={input}
                    value={filter}
                    onChange={(e) => {
                      setFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All campaigns / history</option>
                    {[
                      "draft",
                      "queued",
                      "sending",
                      "paused",
                      "completed",
                      "partially_failed",
                      "failed",
                      "cancelled",
                    ].map((value) => (
                      <option key={value} value={value}>
                        {value.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {loading ? (
                <p>Loading campaigns...</p>
              ) : !campaigns?.data.length ? (
                <p className="text-gray-500">
                  No campaigns yet. Create a draft to get started.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="p-3">Campaign / subject</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">
                            Recipients / accepted / failed
                          </th>
                          <th className="p-3">Created / completed</th>
                          <th className="p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.data.map((campaign) => (
                          <tr key={campaign.id} className="border-b">
                            <td className="p-3 min-w-44">
                              <p className="font-bold">{campaign.name}</p>
                              <p className="text-gray-500 text-xs">
                                {campaign.subject}
                              </p>
                            </td>
                            <td className="p-3">
                              <Status value={campaign.status} />
                            </td>
                            <td className="p-3">
                              {campaign.recipients_count} /{" "}
                              {campaign.sent_count} / {campaign.failed_count}
                            </td>
                            <td className="p-3 text-xs whitespace-nowrap">
                              {date(campaign.created_at)}
                              <br />
                              {date(campaign.completed_at)}
                            </td>
                            <td className="p-3">
                              <button
                                className={secondary}
                                onClick={() => {
                                  setDetail(null);
                                  setDetailId(campaign.id);
                                  setDetailPage(1);
                                }}
                              >
                                View history
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    page={page}
                    last={campaigns.last_page}
                    change={setPage}
                  />
                </>
              )}
            </>
          )}
          {tab === "templates" && (
            <>
              <button className={button} onClick={() => openEditor("template")}>
                Create template
              </button>
              {loading ? (
                <p>Loading templates...</p>
              ) : !templates?.data.length ? (
                <p className="text-sm text-gray-500">
                  No saved templates. Choose a suggested template in the editor
                  to get started.
                </p>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {templates.data.map((template) => (
                      <article
                        key={template.id}
                        className="border rounded-xl p-4 space-y-3"
                      >
                        <h3 className="font-bold">{template.name}</h3>
                        <p className="text-sm text-gray-500">
                          {template.subject}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className={secondary}
                            onClick={() => openEditor("template", template)}
                          >
                            Edit / preview
                          </button>
                          <button
                            className={secondary}
                            onClick={() => {
                              openEditor("campaign");
                              setForm((current) => ({
                                ...current,
                                name: template.name,
                                subject: template.subject,
                                body: template.body,
                                template_id: template.id,
                              }));
                            }}
                          >
                            Use in campaign
                          </button>
                          <button
                            className={secondary}
                            disabled={busy}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Delete this template? Existing campaigns keep their content.",
                                )
                              )
                                run(async () => {
                                  await api.deleteTemplate(template.id);
                                  setNotice("Template deleted.");
                                });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <Pagination
                    page={page}
                    last={templates.last_page}
                    change={setPage}
                  />
                </>
              )}
            </>
          )}
          {tab === "recipients" && (
            <>
              <h3 className="font-bold">Record existing marketing consent</h3>
              <p className="text-sm text-gray-500">
                Registered accounts are not automatically enrolled. Add an
                address only when you have documented consent. Matching
                registered accounts must remain verified and active.
              </p>
              <form
                className="grid md:grid-cols-2 gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  run(async () => {
                    await api.addContact(contactForm);
                    setContactForm({
                      name: "",
                      email: "",
                      source: "recorded",
                      consent_evidence: "",
                      consent_confirmed: false,
                    });
                    setNotice("Consented contact added.");
                  });
                }}
              >
                <label className="text-sm">
                  Recipient name
                  <input
                    required
                    className={input}
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                  />
                </label>
                <label className="text-sm">
                  Email address
                  <input
                    required
                    type="email"
                    className={input}
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                  />
                </label>
                <label className="text-sm">
                  Source
                  <select
                    className={input}
                    value={contactForm.source}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, source: e.target.value })
                    }
                  >
                    <option value="recorded">
                      Documented external consent
                    </option>
                    <option value="newsletter">Newsletter opt-in</option>
                  </select>
                </label>
                <label className="text-sm">
                  Consent evidence (source and date)
                  <input
                    required
                    minLength={10}
                    maxLength={2000}
                    className={input}
                    value={contactForm.consent_evidence}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        consent_evidence: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    required
                    checked={contactForm.consent_confirmed}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        consent_confirmed: e.target.checked,
                      })
                    }
                  />
                  I have verified explicit marketing consent.
                </label>
                <button className={button} disabled={busy}>
                  Add consented contact
                </button>
              </form>
              <label className="block text-sm">
                Search contacts
                <input
                  className={input}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              {loading ? (
                <p>Loading contacts...</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="p-2">Name / email</th>
                          <th>Source</th>
                          <th>Consent / opt-out</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts?.data.map((contact) => (
                          <tr key={contact.id} className="border-b">
                            <td className="p-2 break-all">
                              {contact.name}
                              <br />
                              {contact.email}
                            </td>
                            <td>{contact.source}</td>
                            <td className="text-xs">
                              {date(contact.consented_at)}
                              <br />
                              {contact.unsubscribed_at
                                ? "Opted out: " + date(contact.unsubscribed_at)
                                : "No recorded opt-out; suppressions still apply"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {contacts && (
                    <Pagination
                      page={page}
                      last={contacts.last_page}
                      change={setPage}
                    />
                  )}
                </>
              )}
            </>
          )}
          {tab === "suppressions" && (
            <>
              <h3 className="font-bold">Suppression list</h3>
              <p className="text-sm text-gray-500">
                Suppressed addresses are excluded from every campaign. Removing
                suppression does not grant consent or clear an opt-out.
              </p>
              <form
                className="grid md:grid-cols-3 gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  run(async () => {
                    await api.suppress(
                      suppressionForm.email,
                      suppressionForm.reason,
                    );
                    setSuppressionForm({ email: "", reason: "" });
                    setNotice("Address suppressed.");
                  });
                }}
              >
                <label className="text-sm">
                  Email
                  <input
                    type="email"
                    required
                    className={input}
                    value={suppressionForm.email}
                    onChange={(e) =>
                      setSuppressionForm({
                        ...suppressionForm,
                        email: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm">
                  Reason
                  <input
                    required
                    maxLength={255}
                    className={input}
                    value={suppressionForm.reason}
                    onChange={(e) =>
                      setSuppressionForm({
                        ...suppressionForm,
                        reason: e.target.value,
                      })
                    }
                  />
                </label>
                <button className={button} disabled={busy}>
                  Suppress address
                </button>
              </form>
              {loading ? (
                <p>Loading suppressions...</p>
              ) : (
                <>
                  <div className="space-y-3">
                    {suppressions?.data.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex flex-wrap items-center justify-between gap-3 border-b py-3"
                      >
                        <div className="min-w-0 break-all text-sm">
                          <strong>{entry.email}</strong>
                          <p className="text-gray-500">{entry.reason}</p>
                        </div>
                        <button
                          className={secondary}
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Remove suppression? Existing consent and unsubscribe preferences still apply.",
                              )
                            )
                              run(async () => {
                                await api.unsuppress(entry.id);
                                setNotice("Suppression removed.");
                              });
                          }}
                        >
                          Remove suppression
                        </button>
                      </div>
                    ))}
                  </div>
                  {suppressions && (
                    <Pagination
                      page={page}
                      last={suppressions.last_page}
                      change={setPage}
                    />
                  )}
                </>
              )}
            </>
          )}
        </section>
      )}
      {confirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-confirmation"
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 id="email-confirmation" className="text-lg font-bold">
              Confirm{" "}
              {confirm.action === "send" ? "campaign send" : confirm.action}
            </h3>
            <p className="text-sm text-gray-600">
              {confirm.action === "send"
                ? "This queues real marketing email to all currently eligible recipients in this saved campaign. Review its subject, body and recipient group first. Sending cannot recall messages already accepted by the mail provider."
                : confirm.action === "test"
                  ? "A test email will be queued only to your verified administrator address."
                  : "Pending work will follow this action. An email already being submitted cannot be recalled."}
            </p>
            <div className="flex flex-wrap gap-3">
              <button className={button} disabled={busy} onClick={action}>
                {busy ? "Working..." : "Confirm " + confirm.action}
              </button>
              <button
                className={secondary}
                disabled={busy}
                onClick={() => setConfirm(null)}
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
