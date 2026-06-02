import { useEffect, useRef, useState } from "react";
import { Play, Pause, X, SkipBack, SkipForward } from "lucide-react";

export interface NowPlaying {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  audio_url: string;
}

interface Props {
  track: NowPlaying | null;
  onClose: () => void;
}

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export function AudioPlayer({ track, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [track]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const seek = (v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = v;
    setCurrent(v);
  };

  const skip = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + delta));
  };

  if (!track) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="liquid-glass rounded-2xl w-full max-w-3xl p-4 flex items-center gap-4 pointer-events-auto bg-black/60">
        {track.cover_url ? (
          <img src={track.cover_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-white/10" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate font-instrument">{track.title}</p>
              <p className="text-white/50 text-xs truncate">{track.author}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => skip(-15)} className="p-2 text-white/70 hover:text-white" aria-label="Back 15s">
                <SkipBack size={16} />
              </button>
              <button onClick={toggle} className="bg-white text-black rounded-full p-2.5" aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={() => skip(15)} className="p-2 text-white/70 hover:text-white" aria-label="Forward 15s">
                <SkipForward size={16} />
              </button>
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white" aria-label="Close player">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white/40 text-[10px] tabular-nums">{fmt(current)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={current}
              step={0.1}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 accent-white h-1"
            />
            <span className="text-white/40 text-[10px] tabular-nums">{fmt(duration)}</span>
          </div>
        </div>
        <audio
          ref={audioRef}
          src={track.audio_url}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setPlaying(false)}
        />
      </div>
    </div>
  );
}
