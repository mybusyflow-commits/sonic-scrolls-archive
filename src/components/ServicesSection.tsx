import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Headphones, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";

const cards = [
  {
    tag: "Listen",
    title: "Stream the Library",
    desc: "Press play on any title — no signup, no paywall, no ads. Just press play and let the story unfold.",
    video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4",
    icon: Headphones,
    to: "/library",
  },
  {
    tag: "Discover",
    title: "Every Genre",
    desc: "Fiction, non-fiction, philosophy, poetry, memoirs, classics. New titles added every week from books written across the world.",
    video: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4",
    icon: BookOpen,
    to: "/library",
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="bg-black py-28 md:py-40 px-6 overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-end justify-between mb-12 md:mb-16"
        >
          <h2 className="font-instrument text-3xl md:text-5xl text-white tracking-tight">What you can do</h2>
          <p className="text-white/40 text-sm hidden md:block">For listeners</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="liquid-glass rounded-3xl overflow-hidden group"
            >
              <Link to={c.to} className="block">
                <div className="relative aspect-video overflow-hidden">
                  <video
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="auto"
                    src={c.video}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <p className="uppercase tracking-widest text-white/40 text-xs flex items-center gap-2">
                      <c.icon size={14} /> {c.tag}
                    </p>
                    <div className="liquid-glass rounded-full p-2">
                      <ArrowUpRight size={16} className="text-white" />
                    </div>
                  </div>
                  <h3 className="font-instrument text-white text-xl md:text-2xl mb-3 tracking-tight">{c.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
