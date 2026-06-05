import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Asme" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/library", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/library", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signInGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/library",
      });
      if (result.error) throw result.error;
    } catch (e: any) {
      toast.error(e.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="px-6 py-6">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <ArrowLeft size={18} />
            <Headphones size={22} />
            <span className="font-semibold text-lg font-instrument">Asme</span>
          </Link>
        </div>
      </nav>

      <main className="px-6 max-w-md mx-auto pt-16">
        <div className="liquid-glass rounded-3xl p-10 text-center">
          <h1 className="font-instrument text-4xl mb-3">Welcome</h1>
          <p className="text-white/50 text-sm mb-8">
            Sign in to save your place and access the library.
          </p>
          <button
            onClick={signInGoogle}
            disabled={loading}
            className="bg-white text-black rounded-full w-full py-3 text-sm font-medium flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <GoogleIcon /> {loading ? "Redirecting…" : "Continue with Google"}
          </button>
          <p className="text-white/30 text-xs mt-6">
            More sign-in options coming soon.
          </p>
        </div>
      </main>
    </div>
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
