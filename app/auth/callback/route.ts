import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jkvwtdjkylzxjzvgbwud.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprdnd0ZGpreWx6eGp6dmdid3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDMwNzgsImV4cCI6MjA4MTAxOTA3OH0.XdyU1XtDFY2Vauj_ddQ1mKqAjxjnNJts5pdW_Ob1TDI";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인 성공 후 마이페이지로 리다이렉트
  return NextResponse.redirect(new URL("/mypage", request.url));
}
