"use client";

import { FormEvent, useState } from "react";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

interface Props {
  compact?: boolean;
  defaultState?: string;
  sourcePage?: string;
}

export default function LeadCaptureForm({ compact = false, defaultState = "", sourcePage = "unknown" }: Props) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    state: defaultState,
    property_count: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source_page: sourcePage }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">✓</div>
        <p className="font-semibold text-green-700 text-lg">Request received!</p>
        <p className="text-gray-500 text-sm mt-1">
          A verified property manager in your area will be in touch shortly.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {compact ? (
        <>
          <input required type="text" placeholder="Full Name *" value={form.full_name} onChange={update("full_name")} className={inputCls} />
          <input required type="email" placeholder="Email *" value={form.email} onChange={update("email")} className={inputCls} />
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required type="text" placeholder="Full Name *" value={form.full_name} onChange={update("full_name")} className={inputCls} />
          <input required type="email" placeholder="Email *" value={form.email} onChange={update("email")} className={inputCls} />
        </div>
      )}

      {!compact && (
        <input type="tel" placeholder="Phone" value={form.phone} onChange={update("phone")} className={inputCls} />
      )}

      <div className={compact ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 gap-3"}>
        <select value={form.state} onChange={update("state")} className={inputCls}>
          <option value="">Select State</option>
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={form.property_count} onChange={update("property_count")} className={inputCls}>
          <option value="">Number of Properties</option>
          <option value="1">1</option>
          <option value="2-5">2–5</option>
          <option value="6-20">6–20</option>
          <option value="20+">20+</option>
        </select>
      </div>

      {!compact && (
        <textarea
          placeholder="Message (optional)"
          value={form.message}
          onChange={update("message")}
          rows={3}
          className={`${inputCls} resize-none`}
        />
      )}

      {status === "error" && <p className="text-red-600 text-sm">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {status === "loading" ? "Sending…" : "Get Connected Now"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Your info is only shared with verified local managers.
      </p>
    </form>
  );
}
