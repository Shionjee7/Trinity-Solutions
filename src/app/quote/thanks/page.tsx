import Link from "next/link";

export default function ThanksPage() {
  return (
    <div className="ts-thanks">
      <div className="ts-thanks-inner">
        <div className="ts-thanks-mark">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <span className="ts-eyebrow" style={{ color: "var(--gold)", display: "block", marginBottom: 16 }}>Submitted · You&apos;re in good hands</span>

        <h1 className="ts-thanks-title">
          We&apos;ll be in<br />
          <em>touch soon.</em>
        </h1>

        <p className="ts-thanks-sub">
          An agent will reach out within{" "}
          <strong style={{ color: "var(--gold)" }}>24 hours</strong>{" "}
          to go over your personalized quote. We&apos;ll call from{" "}
          <span style={{ fontFamily: "var(--font-mono)" }}>(804) 944-6226</span>.
        </p>

        <div className="ts-thanks-cta">
          <a href="tel:+18049446226" className="ts-btn ts-btn-primary ts-btn-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z" />
            </svg>
            Call us now
          </a>
          <a href="https://wa.me/18049446226" target="_blank" rel="noopener noreferrer" className="ts-btn ts-btn-ghost ts-btn-lg" style={{ borderColor: "rgba(37,211,102,0.4)", color: "var(--whatsapp)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1z" />
            </svg>
            WhatsApp us
          </a>
        </div>

        <div style={{ background: "var(--ink-soft)", border: "1px solid var(--ink-line)", borderRadius: 18, padding: "24px 28px", maxWidth: 480, width: "100%", marginBottom: 32 }}>
          <h2 style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)", marginBottom: 16, marginTop: 0 }}>What happens next</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "We review your submission and current policy details",
              "We identify coverage gaps and savings opportunities across 30+ carriers",
              "Abhi or Nirmit calls you personally with a customized quote",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--gold)", background: "var(--gold-soft)", border: "1px solid var(--gold-glow)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>0{i + 1}</span>
                <span style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="ts-btn ts-btn-ghost">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
