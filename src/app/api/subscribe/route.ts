import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json();
    const supabase = createClient(true);

    const { data, error } = await supabase
      .from("user")
      .insert([
        {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          subscription,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ message: "success", userId: data[0].id }, { status: 200 });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
