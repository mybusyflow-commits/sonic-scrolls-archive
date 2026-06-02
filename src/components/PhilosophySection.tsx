import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function PhilosophySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-black py-28 md:py-40 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-instrument text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24"
        >
          Stories <em className="italic text-white/40">x</em> Voice
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="rounded-3xl overflow-hidden aspect-[4/3]"
          >
            <video
              className="w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-8"
          >
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Listen anywhere</p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Whether you're on a walk, behind the wheel, or winding down before sleep, every audiobook is one tap away. Stream from any device, no app required.
              </p>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div>
              <p className="text-white/40 text-xs tracking-widest uppercase mb-4">Curated worldwide</p>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                From Tolstoy to Murakami, from public-domain classics to translated gems — we host audiobooks from every corner of the literary world, all free to listen.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
