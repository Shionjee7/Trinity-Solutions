import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center">
              <span className="text-[#0a0f1e] font-bold text-lg">T</span>
            </div>
            <span className="text-white font-semibold text-xl tracking-wide">
              Trinity Solutions
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#services" className="hover:text-[#d4af37] transition-colors">
              Services
            </a>
            <a href="#about" className="hover:text-[#d4af37] transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-[#d4af37] transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full px-4 py-2 text-sm text-[#d4af37] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            Trusted Insurance Solutions Since 2018
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Trinity Solutions
            <span className="block text-[#d4af37] mt-2">Insurance Quotes</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get a free, personalized insurance quote in minutes. Upload your
            current policy and let us find you better coverage at a better
            price.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#e5c84a] text-[#0a0f1e] font-bold text-lg px-10 py-4 rounded-full transition-all duration-200 shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40 hover:scale-105"
            >
              Get a Free Quote
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <a
              href="tel:+1-800-555-0100"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-[#d4af37]/50 text-white/80 hover:text-white font-medium text-lg px-10 py-4 rounded-full transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call Us Today
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "2,500+", label: "Clients Served" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "24hr", label: "Response Time" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-[#d4af37]">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="px-6 py-20 bg-[#0d1530]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-4">
            Our Coverage Options
          </h2>
          <p className="text-center text-white/50 mb-12">
            Comprehensive protection for what matters most
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🚗",
                title: "Auto Insurance",
                desc: "Full coverage, liability, collision, and comprehensive plans tailored to your driving needs.",
              },
              {
                icon: "🏠",
                title: "Home Insurance",
                desc: "Protect your home and belongings with dwelling, liability, and personal property coverage.",
              },
              {
                icon: "🛡️",
                title: "Bundle & Save",
                desc: "Combine auto and home insurance for maximum savings and simplified billing.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-8 hover:border-[#d4af37]/40 transition-all duration-200 group"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                  {service.title}
                </h3>
                <p className="text-white/50 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-16 bg-[#d4af37]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0a0f1e] mb-4">
            Ready to Save on Your Insurance?
          </h2>
          <p className="text-[#0a0f1e]/70 mb-8 text-lg">
            Upload your current policy and get a free comparison in under 24
            hours.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 bg-[#0a0f1e] hover:bg-[#111d3f] text-white font-bold text-lg px-10 py-4 rounded-full transition-all duration-200"
          >
            Start Your Free Quote
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0f1e] border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <span>© 2026 Trinity Solutions. All rights reserved.</span>
          <span>Licensed Insurance Agency · All States</span>
        </div>
      </footer>
    </main>
  );
}
