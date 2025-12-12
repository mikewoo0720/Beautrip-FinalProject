import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 생성
// 환경 변수에서 URL과 API Key를 가져옵니다
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jkvwtdjkylzxjzvgbwud.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprdnd0ZGpreWx6eGp6dmdid3VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NDMwNzgsImV4cCI6MjA4MTAxOTA3OH0.XdyU1XtDFY2Vauj_ddQ1mKqAjxjnNJts5pdW_Ob1TDI";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
