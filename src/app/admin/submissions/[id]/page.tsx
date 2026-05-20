import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { SubmissionRecord, ExtractedPolicyData } from "@/lib/pocketbase";
import { createPocketBase } from "@/lib/pocketbase";

async function getSubmission(id: string): Promise<SubmissionRecord | null> {
  try {
    const pb = createPocketBase();
    const record = await pb
      .collection("submissions")
      .getOne<SubmissionRecord>(id);
    return record;
  } catch {
    return null;
  }
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0d1530] border border-white/10 rounded-2xl p-6">
      <h3 className="text-[#d4af37] font-semibold text-sm uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-white/40 text-xs">{label}</span>
      <span className="text-white text-sm">{value || "—"}</span>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  complete: "bg-green-500/10 text-green-400 border-green-500/30",
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // Auth check
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  if (!session || session.value !== "1") {
    redirect("/admin");
  }

  const submission = await getSubmission(params.id);
  if (!submission) notFound();

  const pb = createPocketBase();
  const pdfUrl = submission.policy_file
    ? pb.files.getURL(submission as Parameters<typeof pb.files.getURL>[0], submission.policy_file)
    : null;

  const ext: ExtractedPolicyData | null =
    typeof submission.extracted_data === "string"
      ? JSON.parse(submission.extracted_data)
      : submission.extracted_data;

  const whatsappPhone = submission.phone.replace(/\D/g, "");
  const whatsappMsg = encodeURIComponent(
    `Hi ${submission.first_name}, I'm reaching out from Trinity Solutions regarding your insurance quote request. When would be a good time to chat?`
  );

  function formatDate(d: string) {
    return new Date(d).toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e]">
      {/* Header */}
      <header className="border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="text-white/40 hover:text-white transition-colors"
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <span className="text-white font-semibold">Submission Detail</span>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${
              STATUS_COLORS[submission.status] || ""
            }`}
          >
            {submission.status}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Name + actions row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {submission.first_name} {submission.last_name}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Submitted {formatDate(submission.created)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0d1530] border border-white/10 hover:border-[#d4af37]/40 text-white/70 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View PDF
              </a>
            )}
            <a
              href={`https://wa.me/${whatsappPhone}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Client Info */}
        <Section title="Client Information">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="First Name" value={submission.first_name} />
            <Field label="Last Name" value={submission.last_name} />
            <Field label="Email" value={submission.email} />
            <Field label="Phone" value={submission.phone} />
            <Field
              label="Insurance Type"
              value={
                submission.insurance_type === "both"
                  ? "Auto + Home"
                  : submission.insurance_type === "auto"
                  ? "Auto"
                  : "Home"
              }
            />
            <Field label="Status" value={submission.status} />
          </div>
        </Section>

        {/* Extracted Policy Data */}
        {ext ? (
          <>
            <Section title="Policy Overview">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <Field label="Carrier" value={ext.carrier} />
                <Field label="Policy Number" value={ext.policy_number} />
                <Field
                  label="Policy Period"
                  value={
                    ext.policy_period?.start && ext.policy_period?.end
                      ? `${ext.policy_period.start} – ${ext.policy_period.end}`
                      : ext.policy_period?.start || ext.policy_period?.end
                  }
                />
                <Field label="Total Premium" value={ext.premiums?.total} />
              </div>
              {ext.premiums?.breakdown &&
                Object.keys(ext.premiums.breakdown).length > 0 && (
                  <div className="mt-4">
                    <p className="text-white/40 text-xs mb-2">
                      Premium Breakdown
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(ext.premiums.breakdown).map(
                        ([k, v]) => (
                          <Field key={k} label={k} value={v} />
                        )
                      )}
                    </div>
                  </div>
                )}
            </Section>

            {ext.coverage_limits &&
              Object.keys(ext.coverage_limits).length > 0 && (
                <Section title="Coverage Limits">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    {Object.entries(ext.coverage_limits).map(([k, v]) => (
                      <Field key={k} label={k} value={v} />
                    ))}
                  </div>
                </Section>
              )}

            {ext.deductibles && Object.keys(ext.deductibles).length > 0 && (
              <Section title="Deductibles">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {Object.entries(ext.deductibles).map(([k, v]) => (
                    <Field key={k} label={k} value={v} />
                  ))}
                </div>
              </Section>
            )}

            {ext.vehicles && ext.vehicles.length > 0 && (
              <Section title="Vehicles">
                <div className="space-y-4">
                  {ext.vehicles.map((v, i) => (
                    <div
                      key={i}
                      className="border border-white/5 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <Field label="Year" value={v.year} />
                      <Field label="Make" value={v.make} />
                      <Field label="Model" value={v.model} />
                      <Field label="VIN" value={v.vin} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {ext.drivers && ext.drivers.length > 0 && (
              <Section title="Drivers">
                <div className="space-y-3">
                  {ext.drivers.map((d, i) => (
                    <div
                      key={i}
                      className="border border-white/5 rounded-xl p-4 grid grid-cols-3 gap-4"
                    >
                      <Field label="Name" value={d.name} />
                      <Field label="Date of Birth" value={d.dob} />
                      <Field label="License #" value={d.license} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {ext.mortgagee && (ext.mortgagee.name || ext.mortgagee.address) && (
              <Section title="Mortgagee">
                <div className="grid grid-cols-2 gap-5">
                  <Field label="Name" value={ext.mortgagee.name} />
                  <Field label="Address" value={ext.mortgagee.address} />
                </div>
              </Section>
            )}

            {ext.discounts && ext.discounts.length > 0 && (
              <Section title="Discounts Applied">
                <div className="flex flex-wrap gap-2">
                  {ext.discounts.map((d) => (
                    <span
                      key={d}
                      className="bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-xs px-3 py-1 rounded-full"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {ext.raw_notes && (
              <Section title="Additional Notes">
                <p className="text-white/60 text-sm whitespace-pre-wrap leading-relaxed">
                  {ext.raw_notes}
                </p>
              </Section>
            )}
          </>
        ) : (
          <div className="bg-[#0d1530] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-white/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-white/30 text-sm">
              {submission.policy_file
                ? "Policy data is being extracted..."
                : "No policy PDF was uploaded."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
