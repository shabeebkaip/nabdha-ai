"use client";

import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { t, type Locale } from "@/lib/i18n";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Isolated client leaf: cursor-follow spotlight on the panel + a magnetic
// primary button. Uses direct DOM style writes (no React state) so pointer
// moves never re-render — and everything degrades to static under
// prefers-reduced-motion. No third-party motion lib (keeps the marketing
// surface dependency-free).
export function ClosingCta({ locale }: { locale: Locale }) {
  const panelRef = useRef<HTMLDivElement>(null);

  function onPanelMove(e: PointerEvent<HTMLDivElement>) {
    const el = panelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <section className="relative py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <div
          ref={panelRef}
          onPointerMove={onPanelMove}
          className="group relative overflow-hidden rounded-3xl border border-primary/25 px-6 py-16 text-center md:px-12 md:py-20"
          style={{
            backgroundImage:
              "radial-gradient(90% 120% at 80% 10%, rgba(37,71,168,0.38), transparent 55%), radial-gradient(80% 120% at 10% 100%, rgba(26,44,102,0.40), transparent 60%), linear-gradient(180deg, hsl(var(--nabda-brand-void)), hsl(var(--nabda-brand-ink)))",
          }}
        >
          {/* Faint grid + top-edge refraction highlight (material). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(120% 100% at 50% 0%, black, transparent 75%)",
            }}
          />
          <span aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          {/* Cursor-follow spotlight — fades in on hover, tracks --mx/--my. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "radial-gradient(480px circle at var(--mx, 50%) var(--my, 0%), rgba(255,255,255,0.10), transparent 45%)" }}
          />

          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-balance text-foreground sm:text-4xl">
              {t(locale, "ctaBand.heading")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{t(locale, "ctaBand.body")}</p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic>
                <Button
                  render={<Link href="/signup" />}
                  size="lg"
                  className="shadow-[0_18px_40px_-16px_rgba(2,6,23,0.6)] transition-transform active:translate-y-px"
                >
                  {t(locale, "ctaBand.startTrial")}
                </Button>
              </Magnetic>
              <Button
                render={<Link href="/consultation" />}
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-foreground backdrop-blur-sm transition-transform hover:bg-white/10 active:translate-y-px"
              >
                {t(locale, "ctaBand.bookConsultation")}
              </Button>
              <Button
                render={<Link href="/enterprise" />}
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-foreground backdrop-blur-sm transition-transform hover:bg-white/10 active:translate-y-px"
              >
                {t(locale, "ctaBand.requestEnterprise")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Pulls its child slightly toward the cursor; snaps back on leave. Skipped
// entirely under reduced-motion.
function Magnetic({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  function onMove(e: PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * 0.2}px, ${dy * 0.35}px)`;
  }
  function reset() {
    if (ref.current) ref.current.style.transform = "translate(0px, 0px)";
  }

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="inline-block transition-transform duration-300 ease-out will-change-transform"
    >
      {children}
    </span>
  );
}
