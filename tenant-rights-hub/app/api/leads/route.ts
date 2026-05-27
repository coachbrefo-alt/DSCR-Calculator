import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendLeadToGHL } from "@/lib/ghl-webhook";

// Use service-role key so the API can bypass RLS for the insert
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { full_name, email, phone, state, property_count, message, source_page } = body;

    if (!full_name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        state: state || null,
        property_count: property_count || null,
        message: message?.trim() || null,
        source_page: source_page || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[API/leads] Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save your request. Please try again." }, { status: 500 });
    }

    // Fire GHL webhook (non-blocking — failure doesn't affect the response)
    const ghlOk = await sendLeadToGHL({ full_name, email, phone, state, property_count, message, source_page });

    if (ghlOk && data?.id) {
      await supabase.from("leads").update({ sent_to_ghl: true }).eq("id", data.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API/leads] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
