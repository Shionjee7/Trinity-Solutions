import Link from "next/link";

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-6">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#d4af37]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-12 h-12 text-[#d4af37]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Thank You!
        </h1>

        <p className="text-xl text-white/60 mb-6 leading-relaxed">
          An agent will reach out within{" "}
          <span className="text-[#d4af37] font-semibold">24 hours</span> to
          discuss your personalized insurance quote.
        </p>

        <div className="bg-[#0d1530] border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-white font-semibold mb-3">What happens next?</h2>
          <ul className="space-y-2 text-white/50 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#d4af37] mt-0.5">1.</span>
              Our team reviews your submission and current policy
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#d4af37] mt-0.5">2.</span>
              We identify coverage gaps and savings opportunities
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#d4af37] mt-0.5">3.</span>
              An agent contacts you with a customized quote
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-white/20 hover:border-[#d4af37]/50 text-white/70 hover:text-white px-8 py-3 rounded-full transition-all duration-200 text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
