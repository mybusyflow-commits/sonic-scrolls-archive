import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Play, Headphones, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AudioPlayer, type NowPlaying } from "@/components/AudioPlayer";

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

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library — Asme Audiobooks" },
      { name: "description", content: "Browse and stream free audiobooks from around the world." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [books, setBooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<NowPlaying | null>(null);

  useEffect(() => {
    supabase
      .from("audiobooks")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBooks(data as Audiobook[]);
        setLoading(false);
      });
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
          <Link to="/admin" className="text-white/60 hover:text-white text-sm">Admin</Link>
        </div>
      </nav>

      <header className="px-6 pt-10 pb-12 max-w-6xl mx-auto">
        <p className="text-white/40 text-sm tracking-widest uppercase mb-4">The Library</p>
        <h1 className="font-instrument text-5xl md:text-7xl tracking-tight">
          Every <em className="italic text-white/60">title</em>, free to stream.
        </h1>
      </header>

      <main className="px-6 pb-40 max-w-6xl mx-auto">
        {loading ? (
          <div className="text-white/40 text-center py-20">Loading library…</div>
        ) : books.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center">
            <p className="font-instrument text-2xl text-white/80 mb-2">No audiobooks yet.</p>
            <p className="text-white/40 text-sm mb-6">
              The library is just getting started. Check back soon.
            </p>
            <Link to="/admin" className="liquid-glass rounded-full px-6 py-2.5 text-sm inline-block">
              Upload as admin
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((b, i) => (
              <motion.button
                key={b.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                onClick={() =>
                  setTrack({
                    id: b.id,
                    title: b.title,
                    author: b.author,
                    cover_url: b.cover_url,
                    audio_url: b.audio_url,
                  })
                }
                className="group text-left liquid-glass rounded-2xl overflow-hidden"
              >
                <div className="relative aspect-[3/4] bg-white/5">
                  {b.cover_url ? (
                    <img
                      src={b.cover_url}
                      alt={b.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 font-instrument text-4xl">
                      {b.title.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 right-3 bg-white text-black rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={16} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-instrument text-lg leading-tight truncate">{b.title}</p>
                  <p className="text-white/50 text-xs mt-1 truncate">{b.author}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      <AudioPlayer track={track} onClose={() => setTrack(null)} />
    </div>
  );
}
