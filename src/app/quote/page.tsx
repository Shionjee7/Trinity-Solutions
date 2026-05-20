"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const INSURANCE_TYPES = [
  { id: "auto", label: "Auto", icon: "🚗" },
  { id: "home", label: "Home", icon: "🏠" },
  { id: "both", label: "Auto + Home", icon: "🛡️" },
  { id: "health", label: "Health", icon: "❤️" },
  { id: "life", label: "Life", icon: "🌿" },
  { id: "business", label: "Business", icon: "🏨" },
  { id: "workers_comp", label: "Workers Comp", icon: "👷" },
  { id: "travel", label: "Travel", icon: "✈️" },
] as const;

type InsuranceType = (typeof INSURANCE_TYPES)[number]["id"];

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f1e]" />}>
      <QuoteForm />
    </Suspense>
  );
}

function QuoteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const initialType = (searchParams.get("type") as InsuranceType) || "auto";

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    insurance_type: INSURANCE_TYPES.some((t) => t.id === initialType) ? initialType : "auto",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const file = fileInputRef.current?.files?.[0];
      const formData = new FormData();
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("insurance_type", form.insurance_type);
      formData.append("notes", form.notes);
      if (file) formData.append("policy_file", file);

      const res = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      router.push("/quote/thanks");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center">
              <span className="text-[#0a0f1e] font-black text-lg">T</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-tight">Trinity Solutions</div>
              <div className="text-[#d4af37]/70 text-xs hidden sm:block">Financial Consulting, with a Personal Touch</div>
            </div>
          </Link>
          <a
            href="tel:+18049446226"
            className="hidden sm:inline-flex items-center gap-2 text-white/70 hover:text-[#d4af37] text-sm transition-colors"
          >
            📞 (804) 944-6226
          </a>
        </div>
      </header>

      {/* Form */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
              Get Your <span className="text-[#d4af37]">Free Quote</span>
            </h1>
            <p className="text-white/50">
              Fill in your details — an agent calls back within 24 hours.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-[#0d1530] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  required
                  value={form.first_name}
                  onChange={handleChange}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition-colors"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition-colors"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition-colors"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>

            {/* Insurance type — all 8 options */}
            <div>
              <label className="block text-sm text-white/60 mb-3">What do you need a quote for? *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {INSURANCE_TYPES.map((t) => (
                  <label
                    key={t.id}
                    className={`flex flex-col items-center justify-center gap-1.5 border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
                      form.insurance_type === t.id
                        ? "border-[#d4af37] bg-[#d4af37]/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="insurance_type"
                      value={t.id}
                      checked={form.insurance_type === t.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl">{t.icon}</span>
                    <span
                      className={`text-xs font-medium ${
                        form.insurance_type === t.id ? "text-[#d4af37]" : "text-white/60"
                      }`}
                    >
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Anything else we should know? <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition-colors resize-none"
                placeholder="e.g. 2 cars, 1 home, looking to bundle…"
              />
            </div>

            {/* PDF upload */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Current Policy PDF <span className="text-white/30">(optional — speeds up your quote)</span>
              </label>
              <div
                className="border border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-[#d4af37]/40 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFile}
                />
                {fileName ? (
                  <div className="flex items-center justify-center gap-2 text-[#d4af37]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{fileName}</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 mx-auto text-white/20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-white/40 text-sm">Click to upload your current policy PDF</p>
                    <p className="text-white/20 text-xs mt-1">We use AI to read it and find you savings</p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4af37] hover:bg-[#e5c84a] disabled:opacity-60 disabled:cursor-not-allowed text-[#0a0f1e] font-black text-lg py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
            >
              {loading ? "Submitting…" : "Submit My Quote Request"}
            </button>

            <p className="text-center text-xs text-white/40">
              Prefer to talk now?&nbsp;
              <a href="tel:+18049446226" className="text-[#d4af37] hover:underline">Call (804) 944-6226</a>
              &nbsp;or&nbsp;
              <a href="https://wa.me/18049446226" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">WhatsApp</a>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
