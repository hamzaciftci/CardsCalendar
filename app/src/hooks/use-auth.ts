import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const CARDS_KEY = "kartpilot.cards.v1";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
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
      // onboarding (user_metadata.onboarded yok) otomatik başlar.
      options: { emailRedirectTo: `${window.location.origin}/uygulama` },
    });

  // Onboarding durumu hesaba bağlı tutulur (cihazdan bağımsız, kalıcı).
  const completeOnboarding = () => supabase!.auth.updateUser({ data: { onboarded: true } });

  const signOut = async () => {
    await supabase!.auth.signOut();
    // Paylaşılan cihazda sonraki kullanıcı öncekinin kart önbelleğini görmesin
    if (typeof window !== "undefined") localStorage.removeItem(CARDS_KEY);
  };

  const enabled = !!supabase;
  const needsOnboarding = enabled && !!session && session.user.user_metadata?.onboarded !== true;

  return {
    session,
    loading,
    enabled,
    needsOnboarding,
    signInWithEmail,
    completeOnboarding,
    signOut,
  };
}
