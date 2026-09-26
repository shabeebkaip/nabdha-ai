import type { ReactNode } from "react";

// Shared liquid-glass container for the signup/login form panes
// (apple-design §12): translucent surface, backdrop blur, hairline border,
// layered shadow, and a top-edge highlight, so the form reads as a floating
// card of depth rather than fields on flat black. `auth-glass-card` only
// carries the prefers-reduced-transparency fallback (see globals.css).
//
// `max-w-md` (~448px) + `mx-auto` keeps the card centered in its column
// with a comfortable content width — not hugging the inline-start edge with
// dead space beside it (client feedback: signup felt too narrow at max-w-sm).
export function AuthGlassCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Ambient glow behind the card — same low-opacity radial-blue recipe
          as the hero background (DESIGN_SPEC §7 "01"), so the glass has
          something to catch instead of floating on flat black. */}
      <div aria-hidden className="pointer-events-none absolute -inset-x-10 -inset-y-14 -z-10 rounded-[3rem] bg-primary/15 blur-[80px]" />

      <div className="auth-glass-card animate-in fade-in-0 zoom-in-95 relative overflow-hidden rounded-[28px] border border-border bg-card/80 p-8 shadow-[0_25px_60px_-24px_rgba(2,6,23,0.18)] backdrop-blur-2xl backdrop-saturate-150 duration-500 ease-nabda focus-within:border-primary/30 sm:p-10 lg:p-12">
        {/* Top-edge highlight — light catching the material's rim (adapts to
            the pane theme via the foreground token). */}
        <span aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
        {/* Interior sheen, biased toward one corner like a light source. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(120% 90% at 0% 0%, hsl(var(--primary) / 0.12), transparent 55%)" }}
        />

        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
