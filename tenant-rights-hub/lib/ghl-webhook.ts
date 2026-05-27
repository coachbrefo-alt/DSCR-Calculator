interface LeadPayload {
  full_name: string;
  email: string;
  phone?: string;
  state?: string;
  property_count?: string;
  message?: string;
  source_page?: string;
}

export async function sendLeadToGHL(lead: LeadPayload): Promise<boolean> {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("[GHL] GHL_WEBHOOK_URL not configured — skipping webhook");
    return false;
  }

  const parts = lead.full_name.trim().split(" ");
  const first_name = parts[0];
  const last_name = parts.slice(1).join(" ");

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name,
        last_name,
        email: lead.email,
        phone: lead.phone ?? "",
        state: lead.state ?? "",
        property_count: lead.property_count ?? "",
        message: lead.message ?? "",
        source: lead.source_page ?? "tenant-rights-hub",
        tags: ["tenant-rights-hub"],
      }),
    });

    if (!res.ok) {
      console.error("[GHL] Webhook failed:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("[GHL] Webhook error:", err);
    return false;
  }
}
