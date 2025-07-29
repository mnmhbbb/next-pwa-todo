import createServerSupabaseClient from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { subscriptionData } = await req.json();
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from("info")
      .delete()
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
