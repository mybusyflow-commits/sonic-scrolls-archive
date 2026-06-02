import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ArrowRight, Headphones, Instagram, Twitter, Globe } from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import { FeaturedVideoSection } from "@/components/FeaturedVideoSection";
import { PhilosophySection } from "@/components/PhilosophySection";
import { ServicesSection } from "@/components/ServicesSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asme — Free Audiobooks From Around the World" },
      { name: "description", content: "Stream a worldwide library of free audiobooks. Classics, fiction, philosophy and more — narrated and ready to play." },
      { property: "og:title", content: "Asme — Free Audiobooks From Around the World" },
      { property: "og:description", content: "Stream a worldwide library of free audiobooks." },
    ],
  }),
  component: Index,
});

function Index() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const animateOpacity = (from: number, to: number, duration: number) => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        video.style.opacity = String(from + (to - from) * t);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const onCanPlay = () => {
      video.play().catch(() => {});
      animateOpacity(0, 1, 500);
    };
    const onTimeUpdate = () => {
      if (video.duration - video.currentTime <= 0.55) {
        const current = parseFloat(video.style.opacity || "1");
        if (current > 0.05) animateOpacity(current, 0, 500);
      }
    };
    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        animateOpacity(0, 1, 500);
      }, 100);
    };

    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className="bg-black">
      <section className="relative min-h-screen overflow-hidden flex flex-col">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-bottom"
          style={{ opacity: 0 }}
          muted
          autoPlay
          playsInline
          preload="auto"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4"
        />

        <nav className="relative z-20 px-6 py-6">
          <div className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Headphones size={22} className="text-white" />
                <span className="text-white font-semibold text-lg font-instrument">Asme</span>
              </div>
              <div className="hidden md:flex items-center gap-8 ml-8">
                <Link to="/library" className="text-white/80 hover:text-white text-sm font-medium">Library</Link>
                <a href="#about" className="text-white/80 hover:text-white text-sm font-medium">About</a>
                <Link to="/admin" className="text-white/80 hover:text-white text-sm font-medium">Admin</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/library">
                <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">Listen now</button>
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[15%] gap-6">
          <h1 className="font-instrument text-6xl md:text-8xl lg:text-9xl text-white tracking-tight">
            Hear it <em className="italic">all</em>.
          </h1>
          <p className="font-instrument text-white/60 text-xl md:text-2xl italic max-w-xl">
            Free audiobooks from every corner of the world.
          </p>

          <Link to="/library" className="liquid-glass rounded-full max-w-xl w-full pl-6 pr-2 py-2 flex items-center gap-3 hover:bg-white/5 transition-colors">
            <span className="flex-1 text-left text-white/60 text-sm">Open the library</span>
            <span className="bg-white rounded-full p-3 text-black">
              <ArrowRight size={20} />
            </span>
          </Link>

          <p id="about" className="text-white text-sm leading-relaxed px-4 max-w-xl">
            Asme is a worldwide audiobook library. Every title is narrated and streamable for free — no signup, no fees, no ads.
          </p>
        </div>

        <div className="relative z-10 flex justify-center gap-4 pb-12">
          {[Instagram, Twitter, Globe].map((Icon, i) => (
            <button
              key={i}
              className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </section>

      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
    </div>
  );
}
