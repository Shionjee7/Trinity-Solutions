import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] flex flex-col">

      {/* ── TOP BAR ── */}
      <div className="bg-[#d4af37] text-[#0a0f1e] text-sm font-semibold text-center py-2 px-4">
        📞 For Tax Preparation & Health Insurance — Call&nbsp;
        <a href="tel:+14135792769" className="underline hover:no-underline">(413) 579-2769</a>
      </div>

      {/* ── HEADER ── */}
      <header className="border-b border-[#d4af37]/20 px-6 py-4 sticky top-0 bg-[#0a0f1e]/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center">
              <span className="text-[#0a0f1e] font-black text-lg">T</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">Trinity Solutions</div>
              <div className="text-[#d4af37]/70 text-xs">Financial Consulting, with a Personal Touch</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#services" className="hover:text-[#d4af37] transition-colors">Services</a>
            <a href="#about" className="hover:text-[#d4af37] transition-colors">About</a>
            <a href="#contact" className="hover:text-[#d4af37] transition-colors">Contact</a>
            <Link
              href="/quote"
              className="bg-[#d4af37] text-[#0a0f1e] font-bold px-5 py-2 rounded-full hover:bg-[#e5c84a] transition-colors"
            >
              Free Quote
            </Link>
          </nav>
          {/* Mobile CTA */}
          <Link
            href="/quote"
            className="md:hidden bg-[#d4af37] text-[#0a0f1e] font-bold px-4 py-2 rounded-full text-sm"
          >
            Free Quote
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden px-6 py-24 flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full px-4 py-2 text-sm text-[#d4af37] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            Serving Clients Since 2009 · Glen Allen, Virginia
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4">
            Your ONE STOP SHOP
            <span className="block text-[#d4af37] mt-2">for ALL Insurance Needs</span>
          </h1>

          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Auto · Home · Health · Life · Business · Workers Comp · Travel · Bonds.
            Upload your current policy and we'll find you better coverage — for less.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#e5c84a] text-[#0a0f1e] font-black text-lg px-10 py-4 rounded-full transition-all duration-200 shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40 hover:scale-105"
            >
              Get a Free Quote
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/18049446226"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 hover:bg-[#25D366]/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
            <a
              href="tel:+18049446226"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-[#d4af37]/50 text-white/70 hover:text-white font-medium text-lg px-10 py-4 rounded-full transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (804) 944-6226
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {[
              { value: "15+", label: "Years Experience" },
              { value: "10+", label: "Insurance Carriers" },
              { value: "24hr", label: "Response Time" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-[#d4af37]">{s.value}</div>
                <div className="text-xs text-white/50 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="px-6 py-20 bg-[#0d1530]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center text-white mb-2">What We Cover</h2>
          <p className="text-center text-white/50 mb-12">Personal, business, and specialty insurance — all in one place</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: "🚗",
                title: "Auto & Home",
                desc: "Protect your vehicles and property with comprehensive personal lines coverage.",
                cta: "Get Auto/Home Quote",
              },
              {
                icon: "❤️",
                title: "Health Insurance",
                desc: "Anthem BCBS of VA, short-term, student, and out-of-USA travel health plans.",
                cta: "Get Health Quote",
              },
              {
                icon: "🌿",
                title: "Life Insurance",
                desc: "Instant life coverage via ETHOS — get approved in minutes, not days.",
                cta: "Get Life Quote",
              },
              {
                icon: "🏨",
                title: "Business Insurance",
                desc: "Gas stations, convenience stores, hotels, motels, restaurants — we cover them all.",
                cta: "Get Business Quote",
              },
              {
                icon: "👷",
                title: "Workers Comp",
                desc: "Make sure your employees are covered. Fast quotes for businesses of all sizes.",
                cta: "Get Workers Comp Quote",
              },
              {
                icon: "✈️",
                title: "Travel Insurance",
                desc: "Cover yourself when visiting or hosting family from abroad. Out-of-USA plans available.",
                cta: "Get Travel Quote",
              },
            ].map((s) => (
              <Link
                key={s.title}
                href="/quote"
                className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-7 hover:border-[#d4af37]/50 hover:bg-[#0a0f1e] transition-all duration-200 group cursor-pointer"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="text-xs text-[#d4af37] font-semibold group-hover:underline">{s.cta} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-2">How It Works</h2>
          <p className="text-white/50 mb-14">Get a better rate in 3 simple steps</p>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: "1", title: "Fill the Form", desc: "Enter your name, contact info, and the type of insurance you need. Takes 2 minutes." },
              { step: "2", title: "Upload Your Policy", desc: "Snap a photo or upload your current policy PDF. Our AI reads it automatically." },
              { step: "3", title: "Agent Calls You", desc: "Within 24 hours, Abhi or Nirmit will call you with better options and pricing." },
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#d4af37] text-[#0a0f1e] font-black text-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#d4af37]/20">
                  {step.step}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 mt-12 bg-[#d4af37] hover:bg-[#e5c84a] text-[#0a0f1e] font-black text-lg px-10 py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#d4af37]/20"
          >
            Start Now — It's Free
          </Link>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="px-6 py-20 bg-[#0d1530]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center text-white mb-2">Meet Your Agents</h2>
          <p className="text-center text-white/50 mb-14">Real people, real relationships — not a call center</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-2xl mb-5">A</div>
              <h3 className="text-white font-bold text-xl mb-1">Abhi Thakar</h3>
              <p className="text-[#d4af37] text-sm font-semibold mb-4">Agency Principal · PMP® · LSSmBB · SAFe® · Notary Public · Tax Preparer</p>
              <p className="text-white/60 text-sm leading-relaxed">
                "Since 2009, I've been helping businesses and individuals safeguard their assets and plan for the retirement they want. I love leading people and processes — 10+ years of experience managing people and finances."
              </p>
            </div>
            <div className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-2xl mb-5">N</div>
              <h3 className="text-white font-bold text-xl mb-1">Nirmit Patel</h3>
              <p className="text-[#d4af37] text-sm font-semibold mb-4">Senior Partner</p>
              <p className="text-white/60 text-sm leading-relaxed">
                Passionate about helping companies and individuals diversify portfolios, manage assets, analyze market trends, and reduce financial risk. Committed to personalized service for you and your family.
              </p>
            </div>
          </div>
          <p className="text-center text-white/40 text-sm mt-8 italic">"The Finest IRON Comes From the Hottest Fire"</p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center text-white mb-2">Contact Us</h2>
          <p className="text-center text-white/50 mb-12">We're here Monday–Friday 9am–5pm · Saturday by appointment</p>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Contact info */}
            <div className="bg-[#0d1530] border border-white/10 rounded-2xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">📍</div>
                <div>
                  <div className="text-white font-semibold mb-1">Office</div>
                  <div className="text-white/60 text-sm">5348 Twin Hickory Road<br/>Glen Allen, Virginia 23059</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">📞</div>
                <div>
                  <div className="text-white font-semibold mb-1">Phone</div>
                  <a href="tel:+18049446226" className="text-[#d4af37] hover:underline text-sm block">(804) 944-6226</a>
                  <a href="tel:+14135792769" className="text-[#d4af37] hover:underline text-sm block">(413) 579-2769</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">✉️</div>
                <div>
                  <div className="text-white font-semibold mb-1">Email</div>
                  <a href="mailto:info@taj-biz.com" className="text-[#d4af37] hover:underline text-sm block">info@taj-biz.com</a>
                  <a href="mailto:tajbizllc@gmail.com" className="text-[#d4af37] hover:underline text-sm block">tajbizllc@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-2xl">⏰</div>
                <div>
                  <div className="text-white font-semibold mb-1">Hours</div>
                  <div className="text-white/60 text-sm">Mon–Fri: 9:00am – 5:00pm<br/>Saturday: By appointment<br/>Sunday: Closed</div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-4">
              <Link
                href="/quote"
                className="flex items-center gap-4 bg-[#d4af37] hover:bg-[#e5c84a] text-[#0a0f1e] font-black rounded-2xl px-8 py-6 transition-all hover:scale-[1.02]"
              >
                <span className="text-3xl">📋</span>
                <div>
                  <div className="text-lg">Get a Free Quote</div>
                  <div className="text-sm font-normal opacity-70">Upload your policy · AI-powered comparison</div>
                </div>
              </Link>
              <a
                href="https://wa.me/18049446226"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/40 hover:border-[#25D366] hover:bg-[#25D366]/20 text-white font-bold rounded-2xl px-8 py-6 transition-all"
              >
                <span className="text-3xl">💬</span>
                <div>
                  <div className="text-lg text-[#25D366]">WhatsApp Us</div>
                  <div className="text-sm font-normal text-white/50">Message us directly — fast response</div>
                </div>
              </a>
              <a
                href="tel:+18049446226"
                className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-[#d4af37]/40 text-white font-bold rounded-2xl px-8 py-6 transition-all"
              >
                <span className="text-3xl">📞</span>
                <div>
                  <div className="text-lg">(804) 944-6226</div>
                  <div className="text-sm font-normal text-white/50">Call during business hours</div>
                </div>
              </a>
              <div className="flex gap-4 pt-2">
                <a href="https://facebook.com/TrinitySolutions99" target="_blank" rel="noopener noreferrer" className="flex-1 text-center border border-white/10 hover:border-[#d4af37]/40 rounded-xl py-3 text-white/50 hover:text-[#d4af37] text-sm transition-all">Facebook</a>
                <a href="https://instagram.com/TrinitySolutions99" target="_blank" rel="noopener noreferrer" className="flex-1 text-center border border-white/10 hover:border-[#d4af37]/40 rounded-xl py-3 text-white/50 hover:text-[#d4af37] text-sm transition-all">Instagram</a>
                <a href="https://linkedin.com/in/abhi-thakar" target="_blank" rel="noopener noreferrer" className="flex-1 text-center border border-white/10 hover:border-[#d4af37]/40 rounded-xl py-3 text-white/50 hover:text-[#d4af37] text-sm transition-all">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#080c18] border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#d4af37] flex items-center justify-center">
              <span className="text-[#0a0f1e] font-black text-xs">T</span>
            </div>
            <span>© 2024 Trinity Solutions LLC. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <span>Glen Allen, Virginia</span>
            <span>·</span>
            <a href="mailto:info@taj-biz.com" className="hover:text-[#d4af37] transition-colors">info@taj-biz.com</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
