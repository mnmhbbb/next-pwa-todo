import createClient from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pushSubscription } = await req.json();
    const supabase = createClient();

    const { error } = await supabase.from("info").insert({
      created_at: new Date().toISOString(),
      subscription_data: pushSubscription,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ message: "success" }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
