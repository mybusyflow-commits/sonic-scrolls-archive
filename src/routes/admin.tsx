import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Headphones, Upload, LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Asme" }],
  }),
  component: AdminPage,
});

interface Audiobook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
}

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", s.user.id)
          .eq("role", "admin")
          .maybeSingle()
          .then(({ data }) => {
            setIsAdmin(!!data);
            setChecking(false);
          });
      } else {
        setIsAdmin(false);
        setChecking(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="px-6 py-6">
        <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white">
            <ArrowLeft size={18} />
            <Headphones size={22} />
            <span className="font-semibold text-lg font-instrument">Asme</span>
          </Link>
          {session && (
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </nav>

      <main className="px-6 pb-20 max-w-3xl mx-auto pt-10">
        {checking ? (
          <p className="text-white/40 text-center py-20">Checking access…</p>
        ) : !session ? (
          <AuthForm />
        ) : !isAdmin ? (
          <div className="liquid-glass rounded-3xl p-10 text-center">
            <p className="font-instrument text-2xl mb-2">Not an admin</p>
            <p className="text-white/50 text-sm">
              This account doesn't have admin access. The first account that signs up
              is automatically promoted to admin.
            </p>
          </div>
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="liquid-glass rounded-3xl p-8 md:p-10">
      <h1 className="font-instrument text-4xl mb-2">
        {mode === "login" ? "Admin login" : "Create admin account"}
      </h1>
      <p className="text-white/50 text-sm mb-8">
        {mode === "login"
          ? "Sign in to upload and manage audiobooks."
          : "The first account becomes the site admin automatically."}
      </p>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="liquid-glass rounded-full w-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min. 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="liquid-glass rounded-full w-full px-5 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black rounded-full w-full py-3 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "…" : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="text-white/50 hover:text-white text-sm mt-6 block mx-auto"
      >
        {mode === "login" ? "No account? Sign up" : "Have an account? Log in"}
      </button>
    </div>
  );
}

function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [narrator, setNarrator] = useState("");
  const [language, setLanguage] = useState("English");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [books, setBooks] = useState<Audiobook[]>([]);

  const loadBooks = () =>
    supabase
      .from("audiobooks")
      .select("id, title, author, cover_url")
      .order("created_at", { ascending: false })
      .then(({ data }) => setBooks((data as Audiobook[]) || []));

  useEffect(() => {
    loadBooks();
  }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audio) return toast.error("Please select an audio file.");
    setUploading(true);
    try {
      const slug = `${Date.now()}-${audio.name.replace(/[^a-z0-9.-]/gi, "_")}`;
      setProgress("Uploading audio…");
      const { error: audErr } = await supabase.storage
        .from("audiobook-audio")
        .upload(slug, audio, { contentType: audio.type });
      if (audErr) throw audErr;
      const { data: audPub } = supabase.storage.from("audiobook-audio").getPublicUrl(slug);

      let coverUrl: string | null = null;
      if (cover) {
        setProgress("Uploading cover…");
        const cslug = `${Date.now()}-${cover.name.replace(/[^a-z0-9.-]/gi, "_")}`;
        const { error: covErr } = await supabase.storage
          .from("audiobook-covers")
          .upload(cslug, cover, { contentType: cover.type });
        if (covErr) throw covErr;
        coverUrl = supabase.storage.from("audiobook-covers").getPublicUrl(cslug).data.publicUrl;
      }

      setProgress("Saving…");
      const { error: insErr } = await supabase.from("audiobooks").insert({
        title,
        author,
        narrator: narrator || null,
        language,
        description: description || null,
        cover_url: coverUrl,
        audio_url: audPub.publicUrl,
      });
      if (insErr) throw insErr;

      toast.success("Audiobook published.");
      setTitle(""); setAuthor(""); setNarrator(""); setDescription("");
      setCover(null); setAudio(null);
      (document.getElementById("cover-input") as HTMLInputElement).value = "";
      (document.getElementById("audio-input") as HTMLInputElement).value = "";
      loadBooks();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this audiobook?")) return;
    const { error } = await supabase.from("audiobooks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted.");
    loadBooks();
  };

  return (
    <div className="space-y-10">
      <div className="liquid-glass rounded-3xl p-8 md:p-10">
        <h1 className="font-instrument text-4xl mb-2">Upload audiobook</h1>
        <p className="text-white/50 text-sm mb-8">Add a new title to the library.</p>
        <form onSubmit={upload} className="space-y-4">
          <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
          <input required placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Narrator (optional)" value={narrator} onChange={(e) => setNarrator(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
            <input placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
          </div>
          <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm resize-none" />

          <label className="block text-white/60 text-xs uppercase tracking-widest mt-6">Cover image (optional)</label>
          <input id="cover-input" type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} className="text-white/70 text-sm file:liquid-glass file:rounded-full file:border-0 file:px-4 file:py-2 file:text-white file:text-xs file:mr-4" />

          <label className="block text-white/60 text-xs uppercase tracking-widest mt-4">Audio file (mp3, m4a, m4b)</label>
          <input id="audio-input" type="file" accept="audio/*" required onChange={(e) => setAudio(e.target.files?.[0] || null)} className="text-white/70 text-sm file:liquid-glass file:rounded-full file:border-0 file:px-4 file:py-2 file:text-white file:text-xs file:mr-4" />

          <button type="submit" disabled={uploading} className="bg-white text-black rounded-full w-full py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
            <Upload size={16} />
            {uploading ? progress || "Uploading…" : "Publish"}
          </button>
        </form>
      </div>

      <div className="liquid-glass rounded-3xl p-8 md:p-10">
        <h2 className="font-instrument text-3xl mb-6">Your library ({books.length})</h2>
        {books.length === 0 ? (
          <p className="text-white/40 text-sm">No audiobooks yet.</p>
        ) : (
          <div className="space-y-3">
            {books.map((b) => (
              <div key={b.id} className="flex items-center gap-4 liquid-glass rounded-xl p-3">
                {b.cover_url ? (
                  <img src={b.cover_url} alt="" className="w-12 h-12 rounded-md object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-white/10" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-instrument text-base truncate">{b.title}</p>
                  <p className="text-white/40 text-xs truncate">{b.author}</p>
                </div>
                <button onClick={() => remove(b.id)} className="p-2 text-white/40 hover:text-red-400" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
