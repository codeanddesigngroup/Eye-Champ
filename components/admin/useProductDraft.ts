"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Payload = Record<string, unknown>;
type Snapshot = { payload: Payload; draftKey: string; draftRevision: number };
const prefix = "eye-champ-product-draft:";

async function send(snapshot: Snapshot, keepalive = false) {
  const response = await fetch("/api/admin/products", {
    method: "POST", headers: { "Content-Type": "application/json" }, keepalive,
    body: JSON.stringify({ ...snapshot.payload, status: "Draft", draftKey: snapshot.draftKey, draftRevision: snapshot.draftRevision }),
  });
  const result = await response.json() as { product?: { id: string }; error?: string };
  if (!response.ok || !result.product) throw new Error(result.error || "Could not save draft.");
  return result.product.id;
}

function remember(snapshot: Snapshot) {
  try { sessionStorage.setItem(prefix + snapshot.draftKey, JSON.stringify(snapshot)); } catch { /* Storage can be unavailable; server saving still works. */ }
}

function forget(snapshot: Snapshot) {
  try {
    const stored = sessionStorage.getItem(prefix + snapshot.draftKey);
    if (stored && (JSON.parse(stored) as Snapshot).draftRevision <= snapshot.draftRevision) sessionStorage.removeItem(prefix + snapshot.draftKey);
  } catch { /* No cached draft to remove. */ }
}

export default function useProductDraft(enabled: boolean, read: () => Payload | null) {
  const [message, setMessage] = useState("");
  const reader = useRef(read);
  const state = useRef({ key: "", revision: 0, baseline: "", fingerprint: "", snapshot: null as Snapshot | null, savedRevision: 0, id: "", finished: false, mounted: false, timer: undefined as ReturnType<typeof setTimeout> | undefined, pending: Promise.resolve("") });

  function capture(force = false) {
    const current = state.current;
    if (!enabled || current.finished) return null;
    const payload = reader.current();
    if (!payload) return current.snapshot;
    const fingerprint = JSON.stringify({ ...payload, status: "Draft" });
    if (!current.baseline) { current.baseline = fingerprint; current.fingerprint = fingerprint; }
    if (!force && fingerprint === current.fingerprint) return current.snapshot;
    current.key ||= crypto.randomUUID();
    current.fingerprint = fingerprint;
    current.snapshot = { payload, draftKey: current.key, draftRevision: ++current.revision };
    remember(current.snapshot);
    return current.snapshot;
  }

  async function flush(keepalive = false, force = false) {
    const current = state.current;
    clearTimeout(current.timer);
    const snapshot = capture(force) ?? current.snapshot;
    if (!snapshot || current.finished) return current.id;
    if (snapshot.draftRevision <= current.savedRevision) return current.id;
    const operation = async () => {
      if (snapshot.draftRevision <= current.savedRevision) return current.id;
      if (current.mounted) setMessage("Saving draft…");
      try {
        current.id = await send(snapshot, keepalive);
        current.savedRevision = Math.max(current.savedRevision, snapshot.draftRevision);
        forget(snapshot);
        if (current.mounted) setMessage("Draft saved");
        return current.id;
      } catch (error) {
        if (current.mounted) setMessage("Draft not saved to server. A local backup is kept in this tab; retry saving before closing.");
        throw error;
      }
    };
    // During page exit dispatch immediately: a pending response may never run its callbacks.
    const request = keepalive ? operation() : current.pending.catch(() => "").then(operation);
    current.pending = request;
    return request;
  }

  function schedule() {
    const snapshot = capture();
    const current = state.current;
    if (!snapshot || snapshot.draftRevision <= current.savedRevision) return;
    clearTimeout(current.timer);
    current.timer = setTimeout(() => { void flush().catch(() => {}); }, 800);
  }

  // Update controlled state snapshots after every commit, including variant/media changes.
  useLayoutEffect(() => { reader.current = read; if (enabled) schedule(); });

  const actions = useRef({ schedule, flush });
  useLayoutEffect(() => { actions.current = { schedule, flush }; });

  useEffect(() => {
    if (!enabled) return;
    const current = state.current;
    current.mounted = true;
    // Retry interrupted requests with their original identity, never creating duplicates.
    try {
      Object.keys(sessionStorage).filter(key => key.startsWith(prefix)).forEach(key => {
        const snapshot = JSON.parse(sessionStorage.getItem(key)!) as Snapshot;
        if (snapshot.draftKey !== current.key) void send(snapshot).then(() => forget(snapshot)).catch(() => {
          if (current.mounted) setMessage("An earlier draft could not be recovered yet. Check your connection and reload to retry.");
        });
      });
    } catch { /* Ignore inaccessible browser storage. */ }
    const form = document.getElementById("new-product-form");
    const changed = () => actions.current.schedule();
    const leaving = () => { void actions.current.flush(true).catch(() => {}); };
    const hidden = () => { if (document.visibilityState === "hidden") leaving(); };
    form?.addEventListener("input", changed);
    form?.addEventListener("change", changed);
    window.addEventListener("pagehide", leaving);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      current.mounted = false;
      form?.removeEventListener("input", changed);
      form?.removeEventListener("change", changed);
      window.removeEventListener("pagehide", leaving);
      document.removeEventListener("visibilitychange", hidden);
      leaving();
    };
  }, [enabled]);

  return {
    message,
    flush: () => flush(false, true),
    finish: () => {
      state.current.finished = true;
      clearTimeout(state.current.timer);
      if (state.current.snapshot) forget(state.current.snapshot);
    },
  };
}
