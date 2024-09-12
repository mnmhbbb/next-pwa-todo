import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next();
          cookiesToSet.forEach(({ name, value }) => {
            supabaseResponse.cookies.set(name, value);
          });
        },
      },
    },
  );

  // 세션 갱신을 위한 토큰 확인 (토큰이 만료되었을 경우 갱신)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 유저가 없으면 로그인 페이지로 리다이렉트
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 세션을 갱신한 후 페이지를 계속해서 처리
  return supabaseResponse;
}
