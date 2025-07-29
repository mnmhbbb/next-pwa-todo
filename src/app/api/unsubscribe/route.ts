import createServerSupabaseClient from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { subscriptionData } = await req.json();
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("info")
      .update({
        created_at: new Date().toISOString(),
        subscription_data: null,
      })
      .eq("subscription_data", subscriptionData);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ message: "success" }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
