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
      // Web: e-postadaki bağlantı doğrudan uygulamaya düşürür.
      // Mobil (WebView): bağlantı yerine e-postadaki 6 haneli kod verifyOtp ile
      // uygulama içinde doğrulanır (link Chrome'da açıldığı için WebView'a dönmez).
      options: { emailRedirectTo: `${window.location.origin}/uygulama` },
    });

  // E-postadaki 6 haneli kodu doğrula (web + mobil ortak yol)
  const verifyOtp = (email: string, token: string) =>
    supabase!.auth.verifyOtp({ email, token, type: "email" });

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
    verifyOtp,
    completeOnboarding,
    signOut,
  };
}
