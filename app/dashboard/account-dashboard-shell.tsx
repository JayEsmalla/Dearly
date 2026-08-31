"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { GiftFormatExperience, defaultGiftFormatDetails } from "@/app/create/personalize/gift-format-experience";
import { RecipientExperience } from "@/app/ui/recipient-experience";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { DashboardGift, SavedGiftTemplate } from "@/lib/gifts/schema";

type DashboardMetrics = { created: number; opened: number; reactions: number };
type DashboardPayload = {
  email: string;
  gifts: DashboardGift[];
  templates: SavedGiftTemplate[];
  metrics: DashboardMetrics;
  error?: { message?: string };
};
type DashboardTab = "drafts" | "scheduled" | "sent" | "opened" | "reactions" | "templates" | "archived";
type EditForm = {
  recipientName: string;
  senderName: string;
  message: string;
  finalMessage: string;
  signature: string;
  theme: DashboardGift["theme"];
  opensAt: string;
  expiresAt: string;
  pin: string;
  removePin: boolean;
};

const tabs: { id: DashboardTab; label: string }[] = [
  { id: "drafts", label: "Drafts" },
  { id: "scheduled", label: "Scheduled" },
  { id: "sent", label: "Sent" },
  { id: "opened", label: "Opened" },
  { id: "reactions", label: "Reactions" },
  { id: "templates", label: "Saved Templates" },
  { id: "archived", label: "Archived" },
];

const publicStatuses = new Set<DashboardGift["status"]>(["published", "opened", "replied"]);

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function toLocalDateTimeInput(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoOrNull(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function statusLabel(gift: DashboardGift, now: number) {
  if (gift.status === "archived" || gift.status === "disabled") return "Archived";
  if (gift.status === "draft" || gift.status === "wrapped") return "Draft";
  if (gift.status === "replied") return "Replied";
  if (gift.status === "opened") return "Opened";
  if (gift.status === "published" && gift.opensAt && new Date(gift.opensAt).getTime() > now) return "Scheduled";
  return "Sent";
}

function initialEditForm(gift: DashboardGift): EditForm {
  return {
    recipientName: gift.recipientName,
    senderName: gift.senderName,
    message: gift.message,
    finalMessage: gift.builderData.finalMessage,
    signature: gift.builderData.signature,
    theme: gift.theme,
    opensAt: toLocalDateTimeInput(gift.opensAt),
    expiresAt: toLocalDateTimeInput(gift.expiresAt),
    pin: "",
    removePin: false,
  };
}

export default function AccountDashboardShell() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "signed-in" | "guest" | "unconfigured" | "error">("loading");
  const [email, setEmail] = useState("");
  const [gifts, setGifts] = useState<DashboardGift[]>([]);
  const [templates, setTemplates] = useState<SavedGiftTemplate[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({ created: 0, opened: 0, reactions: 0 });
  const [activeTab, setActiveTab] = useState<DashboardTab>("sent");
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [editGift, setEditGift] = useState<DashboardGift | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [previewGift, setPreviewGift] = useState<DashboardGift | null>(null);
  const [qrGift, setQrGift] = useState<DashboardGift | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [deleteGift, setDeleteGift] = useState<DashboardGift | null>(null);
  const [templateGift, setTemplateGift] = useState<DashboardGift | null>(null);
  const [templateName, setTemplateName] = useState("");

  const getToken = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const refreshDashboard = useCallback(async (token?: string) => {
    const accessToken = token ?? await getToken();
    if (!accessToken) {
      setState("guest");
      return;
    }
    const response = await fetch("/api/dashboard/gifts", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
    const result = await response.json() as DashboardPayload;
    if (!response.ok) throw new Error(result.error?.message ?? "Your gifts could not be loaded.");
    setEmail(result.email);
    setGifts(result.gifts);
    setTemplates(result.templates);
    setMetrics(result.metrics);
    setNow(Date.now());
    setState("signed-in");
  }, [getToken]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      const timeout = window.setTimeout(() => setState("unconfigured"), 0);
      return () => window.clearTimeout(timeout);
    }
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        setState("guest");
        return;
      }
      try {
        await refreshDashboard(data.session.access_token);
      } catch {
        if (active) setState("error");
      }
    });
    return () => { active = false; };
  }, [refreshDashboard]);

  useEffect(() => {
    if (!qrGift) return;
    let active = true;
    QRCode.toDataURL(new URL(`/g/${qrGift.publicId}`, window.location.origin).toString(), { width: 240, margin: 1, errorCorrectionLevel: "M" })
      .then((dataUrl) => { if (active) setQrDataUrl(dataUrl); })
      .catch(() => { if (active) setQrDataUrl(""); });
    return () => { active = false; };
  }, [qrGift]);

  const counts = useMemo(() => {
    const effectiveNow = now || Number.MAX_SAFE_INTEGER;
    return {
      drafts: gifts.filter((gift) => gift.status === "draft" || gift.status === "wrapped").length,
      scheduled: gifts.filter((gift) => gift.status === "published" && Boolean(gift.opensAt) && new Date(gift.opensAt as string).getTime() > effectiveNow).length,
      sent: gifts.filter((gift) => gift.status === "published" && (!gift.opensAt || new Date(gift.opensAt).getTime() <= effectiveNow)).length,
      opened: gifts.filter((gift) => gift.status === "opened" || gift.status === "replied").length,
      reactions: gifts.filter((gift) => Boolean(gift.response)).length,
      templates: templates.length,
      archived: gifts.filter((gift) => gift.status === "archived" || gift.status === "disabled").length,
    };
  }, [gifts, now, templates.length]);

  const visibleGifts = useMemo(() => {
    const effectiveNow = now || Number.MAX_SAFE_INTEGER;
    if (activeTab === "drafts") return gifts.filter((gift) => gift.status === "draft" || gift.status === "wrapped");
    if (activeTab === "scheduled") return gifts.filter((gift) => gift.status === "published" && Boolean(gift.opensAt) && new Date(gift.opensAt as string).getTime() > effectiveNow);
    if (activeTab === "sent") return gifts.filter((gift) => gift.status === "published" && (!gift.opensAt || new Date(gift.opensAt).getTime() <= effectiveNow));
    if (activeTab === "opened") return gifts.filter((gift) => gift.status === "opened" || gift.status === "replied");
    if (activeTab === "reactions") return gifts.filter((gift) => Boolean(gift.response));
    if (activeTab === "archived") return gifts.filter((gift) => gift.status === "archived" || gift.status === "disabled");
    return [];
  }, [activeTab, gifts, now]);

  const authorizedFetch = async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    if (!token) throw new Error("Your session has ended. Sign in again.");
    const response = await fetch(path, {
      ...init,
      headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
    });
    const result = await response.json() as { error?: { message?: string }; gift?: DashboardGift; template?: SavedGiftTemplate; deleted?: boolean };
    if (!response.ok) throw new Error(result.error?.message ?? "That action could not be completed.");
    return result;
  };

  const runGiftAction = async (gift: DashboardGift, action: "archive" | "restore" | "publish") => {
    setBusyKey(`${gift.publicId}:${action}`);
    setNotice("");
    try {
      await authorizedFetch(`/api/dashboard/gifts/${encodeURIComponent(gift.publicId)}`, { method: "PATCH", body: JSON.stringify({ action }) });
      setNotice(action === "archive" ? "Gift archived." : action === "restore" ? "Gift restored." : "Draft published.");
      await refreshDashboard();
      if (action === "archive") setActiveTab("archived");
      if (action === "publish") setActiveTab("sent");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "That action could not be completed.");
    } finally {
      setBusyKey("");
    }
  };

  const duplicateGift = async (gift: DashboardGift) => {
    setBusyKey(`${gift.publicId}:duplicate`);
    setNotice("");
    try {
      await authorizedFetch(`/api/dashboard/gifts/${encodeURIComponent(gift.publicId)}/duplicate`, { method: "POST" });
      await refreshDashboard();
      setActiveTab("drafts");
      setNotice("A draft copy is ready to edit.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This gift could not be duplicated.");
    } finally {
      setBusyKey("");
    }
  };

  const copyGiftLink = async (gift: DashboardGift) => {
    await navigator.clipboard.writeText(new URL(`/g/${gift.publicId}`, window.location.origin).toString());
    setNotice(`Link for ${gift.recipientName} copied.`);
  };

  const openEdit = (gift: DashboardGift) => {
    setEditGift(gift);
    setEditForm(initialEditForm(gift));
  };

  const saveEdit = async () => {
    if (!editGift || !editForm) return;
    setBusyKey(`${editGift.publicId}:edit`);
    setNotice("");
    try {
      await authorizedFetch(`/api/dashboard/gifts/${encodeURIComponent(editGift.publicId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "update",
          gift: {
            recipientName: editForm.recipientName,
            senderName: editForm.senderName,
            message: editForm.message,
            theme: editForm.theme,
            builderData: {
              ...editGift.builderData,
              finalMessage: editForm.finalMessage,
              signature: editForm.signature,
            },
            opensAt: toIsoOrNull(editForm.opensAt),
            expiresAt: toIsoOrNull(editForm.expiresAt),
            ...(editForm.removePin ? { pin: null } : editForm.pin ? { pin: editForm.pin } : {}),
          },
        }),
      });
      setEditGift(null);
      setEditForm(null);
      setNotice("Gift changes saved.");
      await refreshDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This gift could not be saved.");
    } finally {
      setBusyKey("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteGift) return;
    setBusyKey(`${deleteGift.publicId}:delete`);
    try {
      await authorizedFetch(`/api/dashboard/gifts/${encodeURIComponent(deleteGift.publicId)}`, { method: "DELETE" });
      setDeleteGift(null);
      setNotice("Gift permanently deleted.");
      await refreshDashboard();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This gift could not be deleted.");
    } finally {
      setBusyKey("");
    }
  };

  const saveTemplate = async () => {
    if (!templateGift || !templateName.trim()) return;
    setBusyKey(`${templateGift.publicId}:template`);
    try {
      await authorizedFetch("/api/dashboard/templates", {
        method: "POST",
        body: JSON.stringify({ sourcePublicId: templateGift.publicId, name: templateName.trim() }),
      });
      setTemplateGift(null);
      setTemplateName("");
      setNotice("Template saved.");
      await refreshDashboard();
      setActiveTab("templates");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This template could not be saved.");
    } finally {
      setBusyKey("");
    }
  };

  const createDraftFromTemplate = async (template: SavedGiftTemplate) => {
    setBusyKey(`${template.id}:use`);
    try {
      await authorizedFetch(`/api/dashboard/templates/${template.id}/use`, { method: "POST" });
      await refreshDashboard();
      setActiveTab("drafts");
      setNotice(`A new ${template.giftType} draft is ready.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This template could not be used.");
    } finally {
      setBusyKey("");
    }
  };

  const deleteTemplate = async (template: SavedGiftTemplate) => {
    setBusyKey(`${template.id}:delete`);
    try {
      await authorizedFetch(`/api/dashboard/templates/${template.id}`, { method: "DELETE" });
      await refreshDashboard();
      setNotice("Template deleted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "This template could not be deleted.");
    } finally {
      setBusyKey("");
    }
  };

  const signOut = async () => {
    await getSupabaseBrowser()?.auth.signOut();
    router.replace("/");
  };

  if (state !== "signed-in") {
    return (
      <section className="account-dashboard-intro">
        <span className="step-label">Your Dearly account</span>
        <h1>{state === "guest" ? "Sign in to see your gifts." : "Your gifts, together."}</h1>
        {state === "loading" && <p>Loading your account…</p>}
        {state === "guest" && <><p>Your gifts and recipient responses stay private to your account.</p><Link className="button button--primary" href="/login?next=/dashboard">Sign in</Link></>}
        {state === "unconfigured" && <p>Account services need Supabase browser environment variables before sign-in can run.</p>}
        {state === "error" && <><p>Your dashboard could not be loaded right now.</p><button className="button button--quiet" type="button" onClick={() => { setState("loading"); void refreshDashboard().catch(() => setState("error")); }}>Try again</button></>}
      </section>
    );
  }

  return (
    <section className="gift-dashboard">
      <div className="dashboard-heading">
        <div><span className="step-label">Your Dearly account</span><h1>Your gifts, <em>together.</em></h1><p>{email}</p></div>
        <button className="dashboard-signout" type="button" onClick={signOut}>Sign out</button>
      </div>

      <div className="dashboard-metrics" aria-label="Gift metrics">
        <article><span>Gifts Created</span><strong>{metrics.created}</strong><small>Active account gifts</small></article>
        <article><span>Gifts Opened</span><strong>{metrics.opened}</strong><small>Opened by recipients</small></article>
        <article><span>Reactions Received</span><strong>{metrics.reactions}</strong><small>Private responses</small></article>
      </div>

      <nav className="dashboard-tabs" aria-label="Your gift views">
        {tabs.map((tab) => <button className={activeTab === tab.id ? "active" : ""} type="button" key={tab.id} onClick={() => setActiveTab(tab.id)}><span>{tab.label}</span><i>{counts[tab.id]}</i></button>)}
      </nav>

      {notice && <p className="dashboard-notice" role="status" aria-live="polite">{notice}</p>}

      {activeTab === "templates" ? (
        <div className="dashboard-template-grid">
          {templates.length ? templates.map((template) => (
            <article className="dashboard-template-card" key={template.id}>
              <span className="mini-label">Saved template</span><h2>{template.name}</h2><p>{template.giftType}{template.occasion ? ` · ${template.occasion}` : ""}</p>
              <small>Updated {formatDate(template.updatedAt)}</small>
              <div><button type="button" onClick={() => void createDraftFromTemplate(template)} disabled={Boolean(busyKey)}>Use template</button><button type="button" onClick={() => void deleteTemplate(template)} disabled={Boolean(busyKey)}>Delete</button></div>
            </article>
          )) : <div className="dashboard-empty"><span aria-hidden="true">♡</span><h2>No saved templates yet.</h2><p>Open “More” on any gift and save its structure for another occasion.</p></div>}
        </div>
      ) : visibleGifts.length ? (
        <div className="dashboard-gift-list">
          {visibleGifts.map((gift) => {
            const isPublic = publicStatuses.has(gift.status);
            const isDraft = gift.status === "draft" || gift.status === "wrapped";
            const inactive = gift.status === "archived" || gift.status === "disabled";
            return (
              <article className="dashboard-gift-card" key={gift.publicId}>
                <div className="dashboard-gift-main">
                  <div className="dashboard-gift-icon" aria-hidden="true">♥</div>
                  <div className="dashboard-gift-copy"><span className={`dashboard-status dashboard-status--${statusLabel(gift, now).toLowerCase()}`}>{statusLabel(gift, now)}</span><h2>{gift.recipientName}</h2><p>{gift.occasion} · {gift.giftType}</p></div>
                </div>
                <dl className="dashboard-gift-meta">
                  <div><dt>Scheduled</dt><dd>{gift.opensAt ? formatDate(gift.opensAt) : "Open immediately"}</dd></div>
                  <div><dt>Created</dt><dd>{formatDate(gift.createdAt)}</dd></div>
                </dl>
                {gift.response && <div className="dashboard-response"><span>Recipient response</span><strong>{gift.response.reaction ?? "Reply received"}</strong>{gift.response.reply && <p>“{gift.response.reply}”</p>}</div>}
                <div className="dashboard-card-actions">
                  {!inactive && <button type="button" onClick={() => openEdit(gift)}>Edit</button>}
                  <button type="button" onClick={() => setPreviewGift(gift)}>Preview</button>
                  {isDraft ? <button className="primary" type="button" disabled={Boolean(busyKey)} onClick={() => void runGiftAction(gift, "publish")}>Publish</button> : isPublic ? <button className="primary" type="button" onClick={() => void copyGiftLink(gift)}>Copy link</button> : null}
                  <details><summary>More</summary><div>
                    {isPublic && <button type="button" onClick={() => { setQrDataUrl(""); setQrGift(gift); }}>QR code</button>}
                    <button type="button" disabled={Boolean(busyKey)} onClick={() => void duplicateGift(gift)}>Duplicate as draft</button>
                    <button type="button" onClick={() => { setTemplateGift(gift); setTemplateName(`${gift.giftType} · ${gift.occasion}`); }}>Save template</button>
                    {gift.status === "archived" ? <button type="button" disabled={Boolean(busyKey)} onClick={() => void runGiftAction(gift, "restore")}>Restore</button> : gift.status !== "disabled" ? <button type="button" disabled={Boolean(busyKey)} onClick={() => void runGiftAction(gift, "archive")}>Archive</button> : null}
                    <button className="danger" type="button" onClick={() => setDeleteGift(gift)}>Delete</button>
                  </div></details>
                </div>
              </article>
            );
          })}
        </div>
      ) : <div className="dashboard-empty"><span aria-hidden="true">♡</span><h2>Nothing here yet.</h2><p>{activeTab === "drafts" ? "Duplicate a gift or use a saved template to create a reusable draft." : activeTab === "reactions" ? "Recipient reactions and replies will appear here after they respond." : "Your gifts will move here automatically as their status changes."}</p></div>}

      {editGift && editForm && <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setEditGift(null); setEditForm(null); } }}><section className="dashboard-modal dashboard-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-gift-title"><button className="dashboard-modal-close" type="button" onClick={() => { setEditGift(null); setEditForm(null); }} aria-label="Close edit gift">×</button><span className="mini-label">Edit gift</span><h2 id="edit-gift-title">For {editGift.recipientName}</h2><div className="dashboard-edit-grid">
        <label><span>Recipient</span><input value={editForm.recipientName} maxLength={80} onChange={(event) => setEditForm({ ...editForm, recipientName: event.target.value })} /></label>
        <label><span>From</span><input value={editForm.senderName} maxLength={80} onChange={(event) => setEditForm({ ...editForm, senderName: event.target.value })} /></label>
        <label className="wide"><span>Message</span><textarea rows={4} maxLength={240} value={editForm.message} onChange={(event) => setEditForm({ ...editForm, message: event.target.value })} /></label>
        <label className="wide"><span>Final message</span><textarea rows={3} maxLength={180} value={editForm.finalMessage} onChange={(event) => setEditForm({ ...editForm, finalMessage: event.target.value })} /></label>
        <label><span>Signature</span><input value={editForm.signature} maxLength={48} onChange={(event) => setEditForm({ ...editForm, signature: event.target.value })} /></label>
        <label><span>Theme</span><select value={editForm.theme} onChange={(event) => setEditForm({ ...editForm, theme: event.target.value as EditForm["theme"] })}><option value="rose">Rose</option><option value="wine">Wine</option><option value="sage">Sage</option><option value="gold">Gold</option></select></label>
        <label><span>Scheduled opening</span><input type="datetime-local" value={editForm.opensAt} onChange={(event) => setEditForm({ ...editForm, opensAt: event.target.value })} /></label>
        <label><span>Expiration</span><input type="datetime-local" value={editForm.expiresAt} onChange={(event) => setEditForm({ ...editForm, expiresAt: event.target.value })} /></label>
        <label className="wide"><span>{editGift.pinProtected ? "Change PIN (optional)" : "Add PIN (optional)"}</span><input inputMode="numeric" pattern="[0-9]*" minLength={4} maxLength={8} value={editForm.pin} placeholder="4–8 digits" onChange={(event) => setEditForm({ ...editForm, pin: event.target.value.replace(/\D/g, "").slice(0, 8), removePin: false })} /></label>
        {editGift.pinProtected && <label className="dashboard-remove-pin"><input type="checkbox" checked={editForm.removePin} onChange={(event) => setEditForm({ ...editForm, removePin: event.target.checked, pin: "" })} /><span>Remove current PIN protection</span></label>}
      </div><div className="dashboard-modal-actions"><button type="button" onClick={() => { setEditGift(null); setEditForm(null); }}>Cancel</button><button className="primary" type="button" onClick={() => void saveEdit()} disabled={busyKey.endsWith(":edit")}>Save changes</button></div></section></div>}

      {previewGift && <div className="dashboard-modal-backdrop dashboard-preview-backdrop"><section className="dashboard-modal dashboard-preview-modal" role="dialog" aria-modal="true" aria-label={`Preview gift for ${previewGift.recipientName}`}><button className="dashboard-modal-close" type="button" onClick={() => setPreviewGift(null)} aria-label="Close preview">×</button><RecipientExperience recipientName={previewGift.recipientName} senderName={previewGift.senderName} occasion={previewGift.occasion} giftType={previewGift.giftType} finalMessage={previewGift.builderData.finalMessage || previewGift.message} preview><GiftFormatExperience gift={previewGift.giftType} recipient={previewGift.recipientName} sender={previewGift.senderName} message={previewGift.message} signature={previewGift.builderData.signature} details={{ ...defaultGiftFormatDetails, ...previewGift.builderData.details }} presentation={previewGift.builderData.presentation} finalMessage={previewGift.builderData.finalMessage} /></RecipientExperience></section></div>}

      {qrGift && <div className="dashboard-modal-backdrop"><section className="dashboard-modal dashboard-qr-modal" role="dialog" aria-modal="true" aria-labelledby="qr-title"><button className="dashboard-modal-close" type="button" onClick={() => setQrGift(null)} aria-label="Close QR code">×</button><span className="mini-label">Recipient QR</span><h2 id="qr-title">For {qrGift.recipientName}</h2>{qrDataUrl ? <Image unoptimized src={qrDataUrl} width={240} height={240} alt={`QR code for ${qrGift.recipientName}'s gift`} /> : <p>Generating QR code…</p>}<small>Scanning opens the recipient gift link.</small></section></div>}

      {deleteGift && <div className="dashboard-modal-backdrop"><section className="dashboard-modal dashboard-confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><span className="mini-label">Permanent action</span><h2 id="delete-title">Delete {deleteGift.recipientName}’s gift?</h2><p>This removes the gift and its stored response. This cannot be undone.</p><div className="dashboard-modal-actions"><button type="button" onClick={() => setDeleteGift(null)}>Keep gift</button><button className="danger" type="button" onClick={() => void confirmDelete()} disabled={busyKey.endsWith(":delete")}>Delete permanently</button></div></section></div>}

      {templateGift && <div className="dashboard-modal-backdrop"><section className="dashboard-modal dashboard-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="template-title"><button className="dashboard-modal-close" type="button" onClick={() => setTemplateGift(null)} aria-label="Close save template">×</button><span className="mini-label">Save template</span><h2 id="template-title">Reuse this gift structure.</h2><label className="dashboard-template-name"><span>Template name</span><input value={templateName} maxLength={80} onChange={(event) => setTemplateName(event.target.value)} /></label><p>The saved template keeps this gift’s format, theme, and builder structure for your account.</p><div className="dashboard-modal-actions"><button type="button" onClick={() => setTemplateGift(null)}>Cancel</button><button className="primary" type="button" onClick={() => void saveTemplate()} disabled={!templateName.trim() || busyKey.endsWith(":template")}>Save template</button></div></section></div>}
    </section>
  );
}
