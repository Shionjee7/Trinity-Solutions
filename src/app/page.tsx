"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ── SVG icon helper ─────────────────────────────────────────────────────── */
function Icon({ name, size = 20, stroke = 1.6 }: { name: string; size?: number; stroke?: number }) {
  const props = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none" as const, stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "auto": return <svg {...props}><path d="M3 13l1.6-4.8A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.2L21 13" /><path d="M3 13v5h2v-2h14v2h2v-5H3z" /><circle cx="7" cy="16" r="1.3" /><circle cx="17" cy="16" r="1.3" /></svg>;
    case "health": return <svg {...props}><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" /><path d="M9 11h2v-2h2v2h2v2h-2v2h-2v-2H9z" /></svg>;
    case "life": return <svg {...props}><path d="M12 21c-4.5-3-7-6.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 3.5-2.5 7-7 10z" /></svg>;
    case "business": return <svg {...props}><rect x="3" y="8" width="18" height="12" rx="1.5" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></svg>;
    case "workers": return <svg {...props}><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><circle cx="12" cy="8" r="3.2" /><path d="M7 9a5 5 0 0 1 10 0" /></svg>;
    case "travel": return <svg {...props}><path d="M2 16l20-7-7 13-2-6-6-2 5-5z" /></svg>;
    case "scroll": return <svg {...props}><path d="M6 4h11a2 2 0 0 1 2 2v11a3 3 0 0 0 3 3H8a2 2 0 0 1-2-2V4z" /><path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2" /><path d="M10 9h6M10 13h6" /></svg>;
    case "doc": return <svg {...props}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></svg>;
    case "spark": return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></svg>;
    case "users": return <svg {...props}><circle cx="9" cy="9" r="3.2" /><path d="M3 19a6 6 0 0 1 12 0" /><path d="M16 4a3.5 3.5 0 0 1 0 7M21 19a5 5 0 0 0-4-4.9" /></svg>;
    case "id": return <svg {...props}><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M14 10h4M14 13h3" /></svg>;
    case "shield": return <svg {...props}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "phone": return <svg {...props}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>;
    case "mail": return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></svg>;
    case "pin": return <svg {...props}><path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>;
    case "clock": return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "chat": return <svg {...props}><path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1z" /></svg>;
    case "arrow-right": return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    default: return null;
  }
}

/* ── Data ────────────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    icon: "auto",     title: "Auto & Home",        kicker: "Personal Lines",
    desc: "Protect your vehicles and property. Bundle for the best rate across 30+ carriers.",
    primaryLabel: "Instant Quote",  primaryHref: "https://trinitysolutionsins.propeller.insure/axelerator-public/", primaryExternal: true,
    secondaryLabel: "Talk to Agent", secondaryIsQuote: true,
  },
  {
    icon: "health",   title: "Health Insurance",   kicker: "Anthem · UHC",
    desc: "Anthem BCBS of VA, short-term plans, student & travel health coverage, plans for parents visiting the USA.",
    primaryLabel: "Anthem Quote",   primaryHref: "https://agentsite.anthem.com/agentsite/ac/TrinitySolutions99", primaryExternal: true,
    secondaryLabel: "UHC Option",   secondaryHref: "https://shop.uhone.com/en/quote/census?brokerid=AA5274750", secondaryExternal: true,
  },
  {
    icon: "life",     title: "Life Insurance",     kicker: "Ethos · Bestow",
    desc: "Instant life insurance via Ethos — approved in minutes. Term, whole, and final expense plans available.",
    primaryLabel: "Ethos · Apply",  primaryHref: "https://agents.ethoslife.com/invite/3d18", primaryExternal: true,
    secondaryLabel: "Bestow Option", secondaryHref: "https://www.bestow.com/agents/hgi/?u=716e1720", secondaryExternal: true,
  },
  {
    icon: "business", title: "Business Insurance", kicker: "Commercial",
    desc: "Gas stations & convenience stores, hotels & motels, restaurants — coverage built for owners. BONDS available.",
    primaryLabel: "Get Quote",      primaryHref: "https://app.boldpenguin.com/start/tajbizllcdbatrinitysolutions", primaryExternal: true,
    secondaryLabel: "Talk to Agent", secondaryIsQuote: true,
  },
  {
    icon: "workers",  title: "Workers Comp",       kicker: "SolePro",
    desc: "Fast quotes for small to mid-sized businesses. Stay compliant, protect your team.",
    primaryLabel: "SolePro Quote",  primaryHref: "https://app.solepro.com/AgencyProfile/TAJBIZLLCDBATrinitySolutions/f5686c4f-0acc-48da-bfc2-43f97737e716", primaryExternal: true,
    secondaryLabel: "Talk to Agent", secondaryIsQuote: true,
  },
  {
    icon: "travel",   title: "Travel & Visitors",  kicker: "GeoBlue · IMGlobal",
    desc: "Coverage for travel abroad and for family visiting the United States.",
    primaryLabel: "GeoBlue Travel", primaryHref: "https://www.geobluetravelinsurance.com/product_overview.cfm?link_id=169813", primaryExternal: true,
    secondaryLabel: "Visitors USA", secondaryHref: "https://producer.imglobal.com/international-insurance-plans.aspx?imgac=540029", secondaryExternal: true,
  },
];

const APPOINTMENTS = [
  { icon: "doc",    title: "Tax Preparation",               duration: "1 hour",  price: "$99",          desc: "Personal and business returns. Year-round filing support." },
  { icon: "shield", title: "Finances & Policy Review",      duration: "1 hour",  price: "Free",         desc: "Sit down with us to review your existing policies and financial picture." },
  { icon: "spark",  title: "Project Management & Process",  duration: "1 hour",  price: "Free",         desc: "PMP-certified consultation on operations, processes, and team workflow." },
  { icon: "users",  title: "Change Management",             duration: "1 hour",  price: "Free",         desc: "The people side of change — new orgs, new processes, new technology rollouts." },
  { icon: "id",     title: "Passport & OCI Services",       duration: "1 hour",  price: "$250",         desc: "Visa assistance, passport renewal, OCI applications, and value-added travel services." },
  { icon: "scroll", title: "Notary Services",               duration: "30 mins", price: "Price varies", desc: "Documents notarized at our office — appointment recommended." },
];

const CARRIERS = [
  { name: "Progressive",  src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/progressive_20logo.png/_/rs_h_100_cg_true_m" },
  { name: "Allstate",     src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/allstate.jpg/_/rs_h_100_cg_true_m" },
  { name: "Nationwide",   src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/nationwide.jpg/_/rs_h_100_cg_true_m" },
  { name: "The Hartford", src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/the_20hartford.png/_/rs_h_100_cg_true_m" },
  { name: "Liberty Mutual",src:"https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/liberty_20mutual.jpg/_/rs_h_100_cg_true_m" },
  { name: "Travelers",    src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/travellers.jpg/_/rs_h_100_cg_true_m" },
  { name: "Chubb",        src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/chubb.jpg/_/rs_h_100_cg_true_m" },
  { name: "AIG",          src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/aig.jpg/_/rs_h_100_cg_true_m" },
  { name: "Cigna",        src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/cigna.jpg/_/rs_h_100_cg_true_m" },
  { name: "Anthem",       src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/anthem_20bcbs_20va.jpg/_/rs_h_100_cg_true_m" },
  { name: "Safeco",       src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/safeco.jpg/_/rs_h_100_cg_true_m" },
  { name: "Foremost",     src: "https://img1.wsimg.com/isteam/ip/b8cb52fe_c39d_4111_a8ce_3a2dba74e251/foremost.jpg/_/rs_h_100_cg_true_m" },
];

const STATS = [
  { value: "15+", label: "Years serving Virginia" },
  { value: "30+", label: "Insurance carriers" },
  { value: "24h", label: "Quote turnaround" },
  { value: "A+",  label: "Better Business Bureau" },
];

/* ── Components ──────────────────────────────────────────────────────────── */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`ts-hdr${scrolled ? " is-scrolled" : ""}`}>
      <div className="ts-hdr-inner">
        <a href="#" className="ts-hdr-brand" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, color: "var(--ink)", fontSize: 18, lineHeight: 1 }}>T</span>
          </div>
          <div>
            <div className="ts-hdr-name">Trinity Solutions</div>
            <div className="ts-hdr-tag">Financial consulting · since 2009</div>
          </div>
        </a>
        <nav className="ts-hdr-nav">
          <a href="#services">Services</a>
          <a href="#bookings">Bookings</a>
          <a href="#about">Agents</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="ts-hdr-cta">
          <a className="ts-hdr-phone" href="tel:+18049446226">
            <Icon name="phone" size={14} />
            <span style={{ fontFamily: "var(--font-mono)" }}>(804) 944-6226</span>
          </a>
          <Link href="/quote" className="ts-btn ts-btn-primary ts-btn-sm">
            Free quote
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function ServiceCard({ service, onQuote }: { service: typeof SERVICES[0]; onQuote: () => void }) {
  return (
    <article className="ts-service-card">
      <div className="ts-service-num ts-mono">0{SERVICES.indexOf(service) + 1}</div>
      <div className="ts-service-icon">
        <Icon name={service.icon} size={26} stroke={1.5} />
      </div>
      <div className="ts-service-body">
        <span className="ts-eyebrow" style={{ display: "block", marginBottom: 8 }}>{service.kicker}</span>
        <h3 className="ts-service-title">{service.title}</h3>
        <p className="ts-service-desc">{service.desc}</p>
      </div>
      <div className="ts-service-ctas">
        <a href={service.primaryHref} {...(service.primaryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="ts-service-cta-primary">
          {service.primaryLabel}
          <Icon name="arrow-right" size={12} />
        </a>
        {service.secondaryIsQuote ? (
          <button onClick={onQuote} className="ts-service-cta-secondary">
            {service.secondaryLabel}
          </button>
        ) : (
          <a href={service.secondaryHref} {...(service.secondaryExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="ts-service-cta-secondary">
            {service.secondaryLabel}
          </a>
        )}
      </div>
    </article>
  );
}

function AgentCard({ name, role, creds, quote }: { name: string; role: string; creds: string[]; quote: string }) {
  const initial = name.split(" ").map(s => s[0]).join("");
  return (
    <article className="ts-agent-card">
      <div className="ts-agent-avatar">
        <span className="ts-agent-avatar-text">{initial}</span>
      </div>
      <div className="ts-agent-body">
        <span className="ts-eyebrow">{role}</span>
        <h3 className="ts-agent-name">{name}</h3>
        <p className="ts-agent-quote">"{quote}"</p>
        <div className="ts-agent-creds">
          {creds.map(c => <span key={c} className="ts-agent-cred">{c}</span>)}
        </div>
      </div>
    </article>
  );
}

function ContactRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="ts-contact-row">
      <div className="ts-contact-row-icon"><Icon name={icon} size={18} /></div>
      <div>
        <div className="ts-contact-row-label">{label}</div>
        <div className="ts-contact-row-value">{value}</div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  const handleQuote = () => window.location.href = "/quote";

  return (
    <div className="ts-shell">

      {/* Announce bar */}
      <div className="ts-announce">
        <div className="ts-announce-inner">
          <span className="ts-eyebrow" style={{ color: "var(--ink)", opacity: 0.7 }}>Tax Prep & Health Insurance</span>
          <span className="ts-announce-divider" />
          <a href="tel:+14135792769" className="ts-announce-phone">
            <Icon name="phone" size={13} />
            (413) 579-2769
          </a>
        </div>
      </div>

      {/* Header */}
      <Header />

      {/* Hero */}
      <section className="ts-hero">
        <div className="ts-container">
          <div className="ts-hero-inner">
            <div className="ts-hero-eyebrow ts-pill">
              <span className="dot" />
              <span>Independent agency · Glen Allen, Virginia · Since 2009</span>
            </div>

            <h1 className="ts-hero-title">
              Insurance that<br />
              <em className="ts-hero-italic">actually fits</em><br />
              your life.
            </h1>

            <p className="ts-hero-sub">
              Upload your current policy, or answer a few plain-English questions.
              We compare across 30+ carriers and send you a better quote within 24 hours.
              No call center. Real agents. Same family agency since 2009.
            </p>

            <div className="ts-hero-cta">
              <Link href="/quote" className="ts-btn ts-btn-primary ts-btn-lg">
                Start your quote
                <Icon name="arrow-right" size={16} />
              </Link>
              <a href="https://wa.me/18049446226" target="_blank" rel="noopener noreferrer" className="ts-btn ts-btn-ghost ts-btn-lg">
                <Icon name="chat" size={16} />
                WhatsApp us
              </a>
              <div className="ts-hero-call">
                <span className="ts-eyebrow">or call</span>
                <span className="ts-hero-call-num">(804) 944-6226</span>
              </div>
            </div>

            <div className="ts-hero-stats">
              {STATS.map(s => (
                <div key={s.label} className="ts-hero-stat">
                  <div className="ts-hero-stat-v">{s.value}</div>
                  <div className="ts-hero-stat-l">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="ts-hero-aside" aria-hidden="true">
            <div className="ts-hero-aside-inner">
              <span className="ts-eyebrow">A note from your agent</span>
              <p className="ts-hero-aside-quote">
                "The finest iron comes from the hottest fire."
              </p>
              <p className="ts-hero-aside-attr">— Abhi Thakar, Agency Principal · PMP® · SAFe® · Notary</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Carrier strip */}
      <section className="ts-carriers">
        <div className="ts-container">
          <p className="ts-carriers-label">We shop these carriers for you</p>
        </div>
        <div className="ts-marquee">
          <div className="ts-marquee-track">
            {[...CARRIERS, ...CARRIERS].map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={c.src} alt={c.name} />
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="ts-section ts-services">
        <div className="ts-container">
          <div className="ts-section-head">
            <span className="ts-eyebrow">What we cover · 01</span>
            <h2 className="ts-section-title">
              Everything your household,<br />
              your business, your people need.
            </h2>
            <p className="ts-section-sub">
              Personal, commercial, health, life, travel. One agency, one relationship,
              30+ carriers. We do the comparison shopping so you don&apos;t have to.
            </p>
          </div>

          <div className="ts-services-grid">
            {SERVICES.map(s => (
              <ServiceCard key={s.title} service={s} onQuote={handleQuote} />
            ))}
          </div>

          {/* Will & Trust callout */}
          <div className="ts-callout">
            <div className="ts-callout-icon"><Icon name="scroll" size={24} /></div>
            <div className="ts-callout-body">
              <span className="ts-eyebrow">Beyond insurance</span>
              <h3 className="ts-callout-title">Wills, trusts, and estate planning</h3>
              <p className="ts-callout-desc">
                We also help you protect your legacy. NetLaw estate planning — affordable,
                attorney-reviewed documents, set up in under an hour.
              </p>
            </div>
            <a href="https://i.netlaw.com/hze-mbxc" target="_blank" rel="noopener noreferrer" className="ts-btn ts-btn-ghost">
              Start estate plan
              <Icon name="arrow-right" size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* Bookings */}
      <section id="bookings" className="ts-section ts-bookings">
        <div className="ts-container">
          <div className="ts-section-head">
            <span className="ts-eyebrow">Book a consultation · 02</span>
            <h2 className="ts-section-title">
              Sit down with us.<br />
              <em>Tax, notary, planning, and more.</em>
            </h2>
            <p className="ts-section-sub">
              We&apos;re more than insurance. Book a consultation for tax preparation, notary
              services, passport &amp; OCI, project &amp; change management, or a full
              review of your existing policies.
            </p>
          </div>

          <div className="ts-bookings-grid">
            {APPOINTMENTS.map(b => (
              <article key={b.title} className="ts-booking-card">
                <div className="ts-booking-head">
                  <div className="ts-booking-icon">
                    <Icon name={b.icon} size={20} stroke={1.5} />
                  </div>
                  <div className="ts-booking-meta">
                    <span className="ts-booking-duration">{b.duration}</span>
                    <span className="ts-booking-price">{b.price}</span>
                  </div>
                </div>
                <h3 className="ts-booking-title">{b.title}</h3>
                <p className="ts-booking-desc">{b.desc}</p>
                <a className="ts-booking-cta" href="#contact">
                  Book appointment
                  <Icon name="arrow-right" size={14} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="ts-section ts-how">
        <div className="ts-container">
          <div className="ts-section-head">
            <span className="ts-eyebrow">How it works · 03</span>
            <h2 className="ts-section-title">
              Three steps. <em>Twenty-four hours.</em>
            </h2>
          </div>

          <div className="ts-how-grid">
            {[
              { n: "01", t: "Tell us about you",  d: "First name, last name, who's in the household, what you need to cover. Takes about two minutes. No sales pressure." },
              { n: "02", t: "Upload or answer",   d: "Have a current policy? Drop the PDF in — our AI reads it and we match or beat your coverage. No PDF? We'll walk through it in plain English." },
              { n: "03", t: "Real agent calls",   d: "Within 24 hours, one of our agents personally calls you with better options, real pricing, and answers to every question." },
            ].map(step => (
              <div key={step.n} className="ts-how-step">
                <div className="ts-how-num ts-mono">{step.n}</div>
                <div className="ts-how-line" aria-hidden="true" />
                <h3 className="ts-how-title">{step.t}</h3>
                <p className="ts-how-desc">{step.d}</p>
              </div>
            ))}
          </div>

          <div className="ts-how-cta">
            <Link href="/quote" className="ts-btn ts-btn-primary ts-btn-lg">
              Start your quote — it&apos;s free
              <Icon name="arrow-right" size={16} />
            </Link>
            <span className="ts-how-cta-note">No credit card. No commitment.</span>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="about" className="ts-section ts-agents">
        <div className="ts-container">
          <div className="ts-section-head">
            <span className="ts-eyebrow">Meet your agents · 04</span>
            <h2 className="ts-section-title">
              Real people. Real relationships.<br />
              <em>Not a call center.</em>
            </h2>
          </div>

          <div className="ts-agents-grid">
            <AgentCard
              name="Abhi Thakar"
              role="Agency Principal"
              creds={["PMP®", "LSSmBB", "SAFe® Advanced Scrum Master", "Notary Public", "Tax Preparer"]}
              quote="Since 2009, I've been helping families and businesses safeguard their assets and plan for the retirement they want. I love leading people and processes."
            />
            <AgentCard
              name="Nirmit Patel"
              role="Senior Partner"
              creds={["Portfolio Strategy", "Asset Management", "Risk Analysis"]}
              quote="Passionate about helping companies and individuals diversify portfolios, manage assets, analyze market trends, and reduce financial risk."
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="ts-section ts-contact">
        <div className="ts-container">
          <div className="ts-contact-grid">
            <div className="ts-contact-side">
              <span className="ts-eyebrow" style={{ display: "block", marginBottom: 16 }}>Get in touch · 05</span>
              <h2 className="ts-contact-title">
                Talk to us.<br />
                <em>Any way you&apos;d like.</em>
              </h2>
              <p className="ts-contact-sub">
                Monday–Friday, 9am to 5pm Eastern. Saturday by appointment.
                We respond to WhatsApp messages within the hour during business days.
              </p>

              <div className="ts-contact-list">
                <ContactRow icon="pin" label="Office" value={<>5348 Twin Hickory Road<br />Glen Allen, Virginia 23059</>} />
                <ContactRow icon="phone" label="Phone" value={<>
                  <a href="tel:+18049446226" className="ts-contact-link">(804) 944-6226</a><br />
                  <a href="tel:+14135792769" className="ts-contact-link">(413) 579-2769</a>
                </>} />
                <ContactRow icon="mail" label="Email" value={<>
                  <a href="mailto:info@taj-biz.com" className="ts-contact-link">info@taj-biz.com</a><br />
                  <a href="mailto:tajbizllc@gmail.com" className="ts-contact-link">tajbizllc@gmail.com</a>
                </>} />
                <ContactRow icon="clock" label="Hours" value={<>
                  Mon–Fri · 9:00am – 5:00pm<br />
                  Saturday · By appointment<br />
                  Sunday · Closed
                </>} />
              </div>
            </div>

            <div className="ts-contact-actions">
              <Link href="/quote" className="ts-contact-action ts-contact-action-primary">
                <div className="ts-contact-action-icon"><Icon name="doc" size={22} /></div>
                <div className="ts-contact-action-body">
                  <span className="ts-contact-action-title">Get a free quote</span>
                  <span className="ts-contact-action-sub">Upload your policy · AI comparison</span>
                </div>
                <Icon name="arrow-right" size={18} />
              </Link>
              <a href="https://wa.me/18049446226" target="_blank" rel="noopener noreferrer" className="ts-contact-action ts-contact-action-whatsapp">
                <div className="ts-contact-action-icon" style={{ color: "var(--whatsapp)" }}><Icon name="chat" size={22} /></div>
                <div className="ts-contact-action-body">
                  <span className="ts-contact-action-title" style={{ color: "var(--whatsapp)" }}>WhatsApp us</span>
                  <span className="ts-contact-action-sub">Fast response · message us anytime</span>
                </div>
                <Icon name="arrow-right" size={18} />
              </a>
              <a href="tel:+18049446226" className="ts-contact-action">
                <div className="ts-contact-action-icon"><Icon name="phone" size={22} /></div>
                <div className="ts-contact-action-body">
                  <span className="ts-contact-action-title">(804) 944-6226</span>
                  <span className="ts-contact-action-sub">Call during business hours</span>
                </div>
                <Icon name="arrow-right" size={18} />
              </a>

              <div className="ts-contact-social">
                <a href="https://facebook.com/TrinitySolutions99" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="https://instagram.com/TrinitySolutions99" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://linkedin.com/in/abhi-thakar" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ts-footer">
        <div className="ts-container ts-footer-inner">
          <div className="ts-footer-brand">
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, color: "var(--ink)", fontSize: 15, lineHeight: 1 }}>T</span>
            </div>
            <div>
              <div className="ts-footer-name">Trinity Solutions</div>
              <div className="ts-footer-tag">Financial consulting, with a personal touch</div>
            </div>
          </div>
          <div className="ts-footer-meta">
            <span>© 2026 Trinity Solutions LLC (DBA: TAJBIZ LLC)</span>
            <span>·</span>
            <span>Glen Allen, Virginia</span>
            <span>·</span>
            <a href="mailto:info@taj-biz.com" className="ts-contact-link">info@taj-biz.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
