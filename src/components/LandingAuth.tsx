import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export function LandingAuth() {
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const google = async () => {
    setBusy(true);
    try {
      const r = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (r.error) throw r.error;
    } catch (e: any) {
      toast.error(e.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — you're signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      setEmail(""); setPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <section id="account" className="px-6 py-20 bg-black text-white">
        <div className="liquid-glass rounded-3xl max-w-md mx-auto p-8 text-center">
          <div className="liquid-glass rounded-full w-14 h-14 mx-auto mb-4 flex items-center justify-center">
            <User size={22} />
          </div>
          <p className="font-instrument text-2xl mb-1">You're signed in</p>
          <p className="text-white/50 text-sm mb-6 truncate">{user.email}</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="liquid-glass rounded-full px-5 py-2 text-sm flex items-center gap-2 mx-auto"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="account" className="px-6 py-20 bg-black text-white">
      <div className="liquid-glass rounded-3xl max-w-md mx-auto p-8">
        <h2 className="font-instrument text-3xl text-center mb-2">
          {mode === "signin" ? "Sign in" : "Create account"}
        </h2>
        <p className="text-white/50 text-sm text-center mb-6">
          Optional — listening stays free without an account.
        </p>

        <button
          onClick={google}
          disabled={busy}
          className="bg-white text-black rounded-full w-full py-3 text-sm font-medium flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="flex items-center gap-3 my-5 text-white/30 text-xs">
          <div className="flex-1 h-px bg-white/10" /> or email <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={submitEmail} className="space-y-3">
          <input
            type="email" required placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="liquid-glass rounded-full w-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
          />
          <input
            type="password" required minLength={6} placeholder="Password (min. 6 chars)"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="liquid-glass rounded-full w-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
          />
          <button type="submit" disabled={busy} className="liquid-glass rounded-full w-full py-3 text-sm font-medium disabled:opacity-50">
            {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-white/50 hover:text-white text-xs mt-5 block mx-auto"
        >
          {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 009 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 013.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.05l3.01-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  );
}
