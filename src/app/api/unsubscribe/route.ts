import createClient from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const supabase = createClient(true);

    const { error } = await supabase.from("user").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    } else {
      return NextResponse.json({ message: "success" }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
