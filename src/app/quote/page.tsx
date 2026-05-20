"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function QuotePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    insurance_type: "auto" as "auto" | "home" | "both",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
              <span className="text-[#0a0f1e] font-bold text-lg">T</span>
            </div>
            <span className="text-white font-semibold text-xl tracking-wide">
              Trinity Solutions
            </span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <section className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-3">
              Get Your Free Quote
            </h1>
            <p className="text-white/50">
              Fill in your details and upload your current policy for a fast
              comparison.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-[#0d1530] border border-white/10 rounded-2xl p-8 space-y-6"
          >
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  First Name
                </label>
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
                <label className="block text-sm text-white/60 mb-1.5">
                  Last Name
                </label>
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

            {/* Email */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Email Address
              </label>
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

            {/* Phone */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Phone Number
              </label>
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

            {/* Insurance type */}
            <div>
              <label className="block text-sm text-white/60 mb-3">
                Insurance Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["auto", "home", "both"] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex flex-col items-center justify-center gap-2 border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                      form.insurance_type === type
                        ? "border-[#d4af37] bg-[#d4af37]/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="insurance_type"
                      value={type}
                      checked={form.insurance_type === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl">
                      {type === "auto" ? "🚗" : type === "home" ? "🏠" : "🛡️"}
                    </span>
                    <span
                      className={`text-sm font-medium capitalize ${
                        form.insurance_type === type
                          ? "text-[#d4af37]"
                          : "text-white/60"
                      }`}
                    >
                      {type === "both" ? "Auto + Home" : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* PDF upload */}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Current Policy PDF{" "}
                <span className="text-white/30">(optional)</span>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">{fileName}</span>
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-10 h-10 mx-auto text-white/20 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-white/40 text-sm">
                      Click to upload your current policy PDF
                    </p>
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
              className="w-full bg-[#d4af37] hover:bg-[#e5c84a] disabled:opacity-60 disabled:cursor-not-allowed text-[#0a0f1e] font-bold text-lg py-4 rounded-xl transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
            >
              {loading ? "Submitting..." : "Submit Quote Request"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
