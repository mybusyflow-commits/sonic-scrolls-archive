import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Headphones, Upload, LogOut, Trash2, Pencil, FolderUp, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Summo" }] }),
  component: AdminPage,
});

interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator: string | null;
  description: string | null;
  language: string | null;
  cover_url: string | null;
  audio_url: string;
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
            <span className="font-semibold text-lg font-instrument">Summo</span>
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
          <p className="text-white/60 text-center py-20">
            Please <Link to="/" className="underline">sign in on the home page</Link> first.
          </p>
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

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9.-]/gi, "_");
}

function stripExt(name: string) {
  const i = name.lastIndexOf(".");
  return i > 0 ? name.slice(0, i) : name;
}

function AdminDashboard() {
  const [books, setBooks] = useState<Audiobook[]>([]);
  const [bulk, setBulk] = useState<File[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [editing, setEditing] = useState<Audiobook | null>(null);

  const loadBooks = () =>
    supabase
      .from("audiobooks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setBooks((data as Audiobook[]) || []));

  useEffect(() => {
    loadBooks();
  }, []);

  const bulkUpload = async () => {
    if (!bulk.length) return;
    setBulkBusy(true);
    let added = 0, failed = 0;
    for (let i = 0; i < bulk.length; i++) {
      const file = bulk[i];
      setBulkStatus(`Uploading ${i + 1}/${bulk.length}: ${file.name}`);
      try {
        const path = `${Date.now()}-${i}-${slugify(file.name)}`;
        const { error: upErr } = await supabase.storage
          .from("audiobook-audio")
          .upload(path, file, { contentType: file.type || "audio/mp4" });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("audiobook-audio").getPublicUrl(path);
        const { error: insErr } = await supabase.from("audiobooks").insert({
          title: stripExt(file.name),
          author: "Unknown",
          audio_url: pub.publicUrl,
        });
        if (insErr) throw insErr;
        added++;
      } catch (e: any) {
        console.error(file.name, e);
        failed++;
      }
    }
    setBulkBusy(false);
    setBulkStatus("");
    setBulk([]);
    (document.getElementById("bulk-input") as HTMLInputElement).value = "";
    toast.success(`Added ${added}${failed ? `, ${failed} failed` : ""}.`);
    loadBooks();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this audiobook?")) return;
    const { error } = await supabase.from("audiobooks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted.");
    loadBooks();
  };

  return (
    <div className="space-y-8">
      <div className="liquid-glass rounded-3xl p-8 md:p-10">
        <h1 className="font-instrument text-4xl mb-2">Bulk upload audio</h1>
        <p className="text-white/50 text-sm mb-6">
          Pick one or many audio files (M4A, MP3, M4B…). The filename becomes the title.
          Add cover art and author later by editing each book.
        </p>

        <label
          htmlFor="bulk-input"
          className="liquid-glass rounded-2xl border border-dashed border-white/20 p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5"
        >
          <FolderUp size={28} className="text-white/70 mb-2" />
          <span className="text-white/80 text-sm">
            {bulk.length ? `${bulk.length} file(s) selected` : "Click to choose audio files"}
          </span>
          <span className="text-white/30 text-xs mt-1">You can select an entire folder of M4As at once</span>
        </label>
        <input
          id="bulk-input"
          type="file"
          accept="audio/*,.m4a,.m4b,.mp3,.wav,.ogg,.aac,.flac"
          multiple
          className="hidden"
          onChange={(e) => setBulk(Array.from(e.target.files || []))}
        />

        {bulk.length > 0 && (
          <ul className="mt-4 max-h-40 overflow-auto text-white/60 text-xs space-y-1">
            {bulk.map((f, i) => <li key={i} className="truncate">• {f.name}</li>)}
          </ul>
        )}

        <button
          onClick={bulkUpload}
          disabled={bulkBusy || !bulk.length}
          className="bg-white text-black rounded-full w-full py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
        >
          <Upload size={16} />
          {bulkBusy ? bulkStatus || "Uploading…" : `Upload ${bulk.length || ""} file(s)`}
        </button>
      </div>

      <div className="liquid-glass rounded-3xl p-8 md:p-10">
        <h2 className="font-instrument text-3xl mb-6">Library ({books.length})</h2>
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
                <button onClick={() => setEditing(b)} className="p-2 text-white/40 hover:text-white" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(b.id)} className="p-2 text-white/40 hover:text-red-400" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditModal
          book={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); loadBooks(); }}
        />
      )}
    </div>
  );
}

function EditModal({ book, onClose, onSaved }: { book: Audiobook; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [narrator, setNarrator] = useState(book.narrator || "");
  const [language, setLanguage] = useState(book.language || "English");
  const [description, setDescription] = useState(book.description || "");
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let cover_url = book.cover_url;
      if (cover) {
        const path = `${Date.now()}-${slugify(cover.name)}`;
        const { error } = await supabase.storage
          .from("audiobook-covers")
          .upload(path, cover, { contentType: cover.type });
        if (error) throw error;
        cover_url = supabase.storage.from("audiobook-covers").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("audiobooks").update({
        title,
        author,
        narrator: narrator || null,
        language,
        description: description || null,
        cover_url,
      }).eq("id", book.id);
      if (error) throw error;
      toast.success("Saved.");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <form onSubmit={save} className="liquid-glass rounded-3xl p-8 max-w-lg w-full bg-black/80 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-instrument text-2xl">Edit audiobook</h3>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
          <input required placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Narrator" value={narrator} onChange={(e) => setNarrator(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
            <input placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm" />
          </div>
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="liquid-glass rounded-xl w-full px-4 py-3 bg-transparent text-white placeholder:text-white/30 outline-none text-sm resize-none" />
          <label className="block text-white/60 text-xs uppercase tracking-widest mt-2">
            Cover image {book.cover_url && "(replace)"}
          </label>
          <input type="file" accept="image/*" onChange={(e) => setCover(e.target.files?.[0] || null)} className="text-white/70 text-sm file:liquid-glass file:rounded-full file:border-0 file:px-4 file:py-2 file:text-white file:text-xs file:mr-4" />
        </div>
        <button type="submit" disabled={saving} className="bg-white text-black rounded-full w-full py-3 text-sm font-medium mt-6 disabled:opacity-50">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
