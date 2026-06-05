import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Headphones } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Asme Audiobooks" },
      { name: "description", content: "How Asme collects, uses, and protects your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-white/40 text-sm tracking-widest uppercase mb-4">Legal</p>
        <h1 className="font-instrument text-5xl md:text-6xl tracking-tight mb-2">
          Privacy <em className="italic text-white/60">Policy</em>
        </h1>
        <p className="text-white/40 text-sm mb-12">Last updated: June 5, 2026</p>

        <div className="space-y-10 text-white/80 leading-relaxed">
          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">1. Who we are</h2>
            <p>
              Asme is a free audiobook streaming service. You can browse and stream the entire
              library without creating an account. This policy explains what information we
              collect when you do choose to sign in or otherwise interact with the site.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">2. Information we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Account information.</strong> If you sign in with
                Google or email, we receive your email address and (for Google) basic profile
                details such as your name and avatar.
              </li>
              <li>
                <strong className="text-white">Usage data.</strong> Standard server logs (IP
                address, browser type, pages requested) used to keep the service running and
                secure.
              </li>
              <li>
                <strong className="text-white">Listening activity.</strong> Anonymous playback
                requests to our audio storage. We do not build a personal listening profile.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">3. How we use it</h2>
            <p>
              We use this information to operate Asme, authenticate you, prevent abuse, and
              improve the library. We do not sell your personal information and we do not show
              advertising.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">4. Service providers</h2>
            <p>
              Asme is built on Lovable Cloud (powered by Supabase) for authentication, database,
              and audio storage, and uses Google as an optional sign-in provider. These providers
              process data on our behalf under their own privacy terms.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">5. Cookies</h2>
            <p>
              We use a small number of strictly necessary cookies and local storage entries to
              keep you signed in. We do not use third-party advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">6. Your rights</h2>
            <p>
              You can sign out at any time, request deletion of your account, or ask for a copy
              of the personal data associated with your account by contacting us at the address
              below.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">7. Children</h2>
            <p>
              Asme is not directed at children under 13. If you believe a child has provided us
              with personal information, contact us and we will remove it.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">8. Changes</h2>
            <p>
              We may update this policy from time to time. Material changes will be reflected by
              updating the date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="font-instrument text-2xl text-white mb-3">9. Contact</h2>
            <p>
              Questions about this policy? Email{" "}
              <a href="mailto:privacy@asme.audio" className="text-white underline">
                privacy@asme.audio
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-16">
          <Link
            to="/"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Back home
          </Link>
        </div>
      </main>
    </div>
  );
}
