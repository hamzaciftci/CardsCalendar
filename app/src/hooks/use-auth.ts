import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(!!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithEmail = (email: string) =>
    supabase!.auth.signInWithOtp({
      email,
      // Giriş bağlantısı doğrudan uygulamaya düşürür; yeni kullanıcıda
      // onboarding otomatik başlar (isOnboarded bayrağı henüz yoktur)
      options: { emailRedirectTo: `${window.location.origin}/uygulama` },
    });

  const signOut = () => supabase!.auth.signOut();

  return { session, loading, signInWithEmail, signOut, enabled: !!supabase };
}
