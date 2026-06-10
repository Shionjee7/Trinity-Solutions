"use client";

import { useState, useRef, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── Types ─────────────────────────────────────────────────────────────── */
type InsuranceType = "auto" | "home" | "both";

type AutoCoverage = {
  bodily_injury: "$30k/$60k" | "$100k/$300k" | "$250k/$500k";
  property_damage: "$25k" | "$100k" | "$250k";
  collision: boolean; collision_deductible: "$250" | "$500" | "$1000";
  comprehensive: boolean; comp_deductible: "$250" | "$500" | "$1000";
  uninsured_motorist: boolean;
  medical_payments: boolean; medical_amount: "$2,000" | "$5,000" | "$10,000";
  rental_car: boolean; roadside_assistance: boolean;
};

type HomeCoverage = {
  dwelling_value: string; personal_property: boolean;
  liability_amount: "$100,000" | "$300,000" | "$500,000";
  loss_of_use: boolean; water_backup: boolean; flood: boolean;
};

type VehicleInfo = { year: string; make: string; model: string; vin: string };
type PropertyInfo = { address: string; year_built: string; sqft: string; type: "single_family" | "condo" | "townhouse" | "mobile" };
type Contact = {
  first_name: string; middle_name: string; last_name: string;
  email: string; phone: string;
  marital_status: "" | "single" | "married";
  spouse_first: string; spouse_middle: string; spouse_last: string;
};

type Step =
  | "contact" | "type" | "upload_ids" | "policies"
  | "vehicle" | "auto_coverage" | "property" | "home_coverage"
  | "additional" | "review";

const DEFAULT_AUTO: AutoCoverage = {
  bodily_injury: "$100k/$300k", property_damage: "$100k",
  collision: true, collision_deductible: "$500",
  comprehensive: true, comp_deductible: "$500",
  uninsured_motorist: true, medical_payments: true, medical_amount: "$5,000",
  rental_car: true, roadside_assistance: true,
};
const DEFAULT_HOME: HomeCoverage = {
  dwelling_value: "", personal_property: true,
  liability_amount: "$300,000", loss_of_use: true, water_backup: true, flood: false,
};

const STEP_LABELS: Record<Step, string> = {
  contact: "About you", type: "Coverage", upload_ids: "ID upload",
  policies: "Policies", vehicle: "Vehicle", auto_coverage: "Auto details",
  property: "Property", home_coverage: "Home details",
  additional: "Notes", review: "Review",
};

/* ── Icon ──────────────────────────────────────────────────────────────── */
function Icon({ name, size = 20, stroke = 1.6 }: { name: string; size?: number; stroke?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "arrow-left":  return <svg {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></svg>;
    case "arrow-right": return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "phone": return <svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A14 14 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>;
    case "x":     return <svg {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>;
    case "upload": return <svg {...p}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 20h16" /></svg>;
    case "doc":   return <svg {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>;
    case "id":    return <svg {...p}><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M14 10h4M14 13h3" /></svg>;
    case "auto":  return <svg {...p}><path d="M3 13l1.6-4.8A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.2L21 13" /><path d="M3 13v5h2v-2h14v2h2v-5H3z" /><circle cx="7" cy="16" r="1.3" /><circle cx="17" cy="16" r="1.3" /></svg>;
    case "home":  return <svg {...p}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></svg>;
    case "shield": return <svg {...p}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "check": return <svg {...p}><path d="M4 12l5 5L20 6" /></svg>;
    case "user":  return <svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>;
    case "rings": return <svg {...p}><circle cx="9" cy="14" r="5" /><circle cx="16" cy="11" r="4" /></svg>;
    default: return null;
  }
}

/* ── Shared components ─────────────────────────────────────────────────── */
function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="ts-field-label">{label}</label>
      {children}
    </div>
  );
}

function StepShell({ kicker, title, subtitle, children, onBack, onNext, nextLabel = "Continue", nextDisabled = false, submitting = false }: {
  kicker?: string; title: string; subtitle?: string; children: React.ReactNode;
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean; submitting?: boolean;
}) {
  return (
    <div className="ts-step ts-fade-up">
      <div className="ts-step-head">
        {kicker && <span className="ts-eyebrow">{kicker}</span>}
        <h1 className="ts-step-title">{title}</h1>
        {subtitle && <p className="ts-step-sub">{subtitle}</p>}
      </div>
      <div className="ts-step-body">{children}</div>
      <div className="ts-step-foot">
        {onBack ? (
          <button className="ts-btn ts-btn-ghost" onClick={onBack}>
            <Icon name="arrow-left" size={14} /> Back
          </button>
        ) : <span />}
        {onNext && (
          <button className="ts-btn ts-btn-primary" onClick={onNext} disabled={nextDisabled || submitting}>
            {submitting ? "Submitting…" : nextLabel}
            {!submitting && <Icon name="arrow-right" size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function DropZone({ files, multi, accept, onChange, label }: {
  files: string[]; multi?: boolean; accept: string;
  onChange: (names: string[]) => void; label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="ts-dropzone" onClick={() => ref.current?.click()}>
      <input
        ref={ref} type="file" accept={accept} multiple={multi} className="hidden"
        style={{ display: "none" }}
        onChange={e => {
          const names = Array.from(e.target.files || []).map(f => f.name);
          onChange(multi ? names : names.slice(0, 1));
        }}
      />
      {files.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "var(--gold)" }}>
          <Icon name="doc" size={28} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
            {files.map((f, i) => (
              <div key={i} className="ts-file-row" style={{ justifyContent: "center" }}>
                <Icon name="doc" size={14} />
                <span style={{ flex: 1 }}>{f}</span>
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Click to change</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "var(--text-muted)" }}>
          <Icon name="upload" size={32} stroke={1.4} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>{label}</div>
            <div className="ts-eyebrow" style={{ textTransform: "uppercase", letterSpacing: "0.10em", color: "var(--text-faint)" }}>
              PDF · JPG · PNG{multi ? " · Multiple files OK" : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoverageQ({ title, desc, options, value, onChange, recommended }: {
  title: string; desc: string;
  options: { label: string; sublabel: string; recommended?: boolean }[];
  value: string; onChange: (v: string) => void; recommended?: string;
}) {
  return (
    <div className="ts-q-card">
      <div className="ts-q-head">
        <p className="ts-q-title">{title}</p>
        {recommended && <span className="ts-rec-badge">★ Our pick</span>}
      </div>
      <p className="ts-q-desc">{desc}</p>
      <div className="ts-q-options">
        {options.map(opt => (
          <button key={opt.label} onClick={() => onChange(opt.label)}
            className={`ts-q-opt${value === opt.label ? " is-selected" : ""}${opt.recommended ? " is-recommended" : ""}`}>
            <span className="v">{opt.label}</span>
            <span className="s">{opt.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNoQ({ title, desc, value, onChange, recommended, extra }: {
  title: string; desc: string; value: boolean;
  onChange: (v: boolean) => void; recommended?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="ts-q-card">
      <div className="ts-q-head">
        <p className="ts-q-title">{title}</p>
        {recommended && <span className="ts-rec-badge">★ Recommended</span>}
      </div>
      <p className="ts-q-desc">{desc}</p>
      <div className="ts-yn">
        <button onClick={() => onChange(true)} className={`ts-yn-opt${value === true ? " is-yes" : ""}`}>
          <Icon name="check" size={14} /> Yes, include it
        </button>
        <button onClick={() => onChange(false)} className={`ts-yn-opt${value === false ? " is-no" : ""}`}>
          <Icon name="x" size={14} /> No thanks
        </button>
      </div>
      {value && extra && <div className="ts-q-extra">{extra}</div>}
    </div>
  );
}

function DeductPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="ts-field-label" style={{ marginBottom: 8 }}>{label}</p>
      <div className="ts-q-options">
        {(["$250", "$500", "$1000"] as const).map(d => (
          <button key={d} onClick={() => onChange(d)}
            className={`ts-q-opt${value === d ? " is-selected" : ""}${d === "$500" ? " is-recommended" : ""}`}>
            <span className="v">{d}</span>
            <span className="s">{d === "$500" ? "sweet spot" : d === "$250" ? "lower" : "higher"}</span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 8 }}>
        Lower deductible = higher premium. $500 is the sweet spot for most people.
      </p>
    </div>
  );
}

function ReviewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="ts-review-row">
      <span className="ts-review-row-k">{k}</span>
      <span className="ts-review-row-v">{v || "—"}</span>
    </div>
  );
}

/* ── Page export ────────────────────────────────────────────────────────── */
export default function QuotePage() {
  return (
    <Suspense fallback={<div className="ts-wiz" />}>
      <QuoteWizard />
    </Suspense>
  );
}

/* ── Wizard ─────────────────────────────────────────────────────────────── */
function QuoteWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("contact");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contact, setContact] = useState<Contact>({
    first_name: "", middle_name: "", last_name: "", email: "", phone: "",
    marital_status: "", spouse_first: "", spouse_middle: "", spouse_last: "",
  });
  const [insuranceType, setInsuranceType] = useState<InsuranceType>("auto");
  const [skipPolicies, setSkipPolicies] = useState(false);
  const [idFiles, setIdFiles] = useState<string[]>([]);
  const [autoPolicyFile, setAutoPolicyFile] = useState<string[]>([]);
  const [homePolicyFile, setHomePolicyFile] = useState<string[]>([]);
  const [vehicle, setVehicle] = useState<VehicleInfo>({ year: "", make: "", model: "", vin: "" });
  const [property, setProperty] = useState<PropertyInfo>({ address: "", year_built: "", sqft: "", type: "single_family" });
  const [autoCoverage, setAutoCoverage] = useState<AutoCoverage>(DEFAULT_AUTO);
  const [homeCoverage, setHomeCoverage] = useState<HomeCoverage>(DEFAULT_HOME);
  const [notes, setNotes] = useState("");

  // File refs for actual submission
  const idFilesRef = useRef<HTMLInputElement>(null);
  const autoPolicyRef = useRef<HTMLInputElement>(null);
  const homePolicyRef = useRef<HTMLInputElement>(null);

  const hasAuto = autoPolicyFile.length > 0;
  const hasHome = homePolicyFile.length > 0;
  const policyUploaded = insuranceType === "auto" ? hasAuto : insuranceType === "home" ? hasHome : (hasAuto || hasHome);

  const steps = useMemo<Step[]>(() => {
    const base: Step[] = ["contact", "type", "upload_ids", "policies"];
    const tail: Step[] = ["additional", "review"];
    if (skipPolicies) {
      if (insuranceType === "auto") return [...base, "vehicle", "auto_coverage", ...tail];
      if (insuranceType === "home") return [...base, "property", "home_coverage", ...tail];
      return [...base, "vehicle", "auto_coverage", "property", "home_coverage", ...tail];
    }
    return [...base, ...tail];
  }, [insuranceType, skipPolicies]);

  const currentIdx = Math.max(0, steps.indexOf(step));
  const progress = Math.round(((currentIdx + 1) / steps.length) * 100);

  function go(s: Step) { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function next(override?: Step) {
    if (override) { go(override); return; }
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) go(steps[idx + 1]);
  }
  function back() {
    const idx = steps.indexOf(step);
    if (idx > 0) go(steps[idx - 1]);
  }

  function handlePoliciesNext() {
    if (policyUploaded) { setSkipPolicies(false); next(); }
    else { setSkipPolicies(true); go(insuranceType === "home" ? "property" : "vehicle"); }
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("first_name", contact.first_name);
      fd.append("last_name", contact.last_name);
      fd.append("email", contact.email);
      fd.append("phone", contact.phone);
      fd.append("marital_status", contact.marital_status);
      fd.append("insurance_type", insuranceType);
      fd.append("has_policy", String(policyUploaded));
      fd.append("additional_notes", notes);

      if (autoPolicyRef.current?.files?.[0]) fd.append("policy_file", autoPolicyRef.current.files[0]);
      if (homePolicyRef.current?.files?.[0]) fd.append("home_policy_file", homePolicyRef.current.files[0]);
      if (idFilesRef.current?.files) {
        Array.from(idFilesRef.current.files).forEach((f, i) => fd.append(`id_document_${i}`, f));
      }

      if (skipPolicies && (insuranceType === "auto" || insuranceType === "both")) {
        fd.append("vehicle_info", JSON.stringify(vehicle));
        fd.append("auto_coverage", JSON.stringify(autoCoverage));
      }
      if (skipPolicies && (insuranceType === "home" || insuranceType === "both")) {
        fd.append("property_info", JSON.stringify(property));
        fd.append("home_coverage", JSON.stringify(homeCoverage));
      }

      const res = await fetch("/api/submit", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }
      router.push("/quote/thanks");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Render ── */
  return (
    <div className="ts-wiz">
      {/* Top bar */}
      <header className="ts-wiz-top">
        <div className="ts-wiz-top-inner">
          <Link href="/" className="ts-wiz-brand">
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, color: "var(--ink)", fontSize: 15, lineHeight: 1 }}>T</span>
            </div>
            <div>
              <div className="ts-wiz-brand-name">Trinity Solutions</div>
              <div className="ts-wiz-brand-tag">Insurance intake</div>
            </div>
          </Link>
          <div className="ts-wiz-top-meta">
            <a href="tel:+18049446226" className="ts-wiz-phone">
              <Icon name="phone" size={14} />
              <span style={{ fontFamily: "var(--font-mono)" }}>(804) 944-6226</span>
            </a>
            <Link href="/" className="ts-wiz-close" aria-label="Back to site">
              <Icon name="x" size={18} />
            </Link>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="ts-wiz-progress">
        <div className="ts-container">
          <div className="ts-wiz-progress-row">
            <span className="ts-eyebrow">
              Step <span className="ts-mono" style={{ color: "var(--gold)" }}>{String(currentIdx + 1).padStart(2, "0")}</span>
              {" "}of <span className="ts-mono">{String(steps.length).padStart(2, "0")}</span>
            </span>
            <span className="ts-eyebrow">{STEP_LABELS[step]}</span>
            <span className="ts-eyebrow ts-mono">{progress}%</span>
          </div>
          <div className="ts-wiz-bar">
            <div className="ts-wiz-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="ts-wiz-body">
        <div className="ts-container">
          <div className="ts-wiz-main">

            {/* ── 1. Contact ── */}
            {step === "contact" && (
              <StepShell
                kicker="01 · About you"
                title="Let's start with the basics."
                subtitle="We'll use this to send your quote and follow up. No spam, ever."
                onNext={() => {
                  const { first_name, last_name, email, phone, marital_status } = contact;
                  if (!first_name || !last_name || !email || !phone || !marital_status) return;
                  if (marital_status === "married" && (!contact.spouse_first || !contact.spouse_last)) return;
                  next();
                }}
                nextDisabled={
                  !contact.first_name || !contact.last_name || !contact.email || !contact.phone || !contact.marital_status ||
                  (contact.marital_status === "married" && (!contact.spouse_first || !contact.spouse_last))
                }
              >
                <div className="ts-grid-3">
                  <Field label="First name *">
                    <input className="ts-input" placeholder="Jane" value={contact.first_name}
                      onChange={e => setContact({ ...contact, first_name: e.target.value })} />
                  </Field>
                  <Field label="Middle name">
                    <input className="ts-input" placeholder="A." value={contact.middle_name}
                      onChange={e => setContact({ ...contact, middle_name: e.target.value })} />
                  </Field>
                  <Field label="Last name *">
                    <input className="ts-input" placeholder="Doe" value={contact.last_name}
                      onChange={e => setContact({ ...contact, last_name: e.target.value })} />
                  </Field>
                </div>
                <div className="ts-grid-2">
                  <Field label="Email *">
                    <input className="ts-input" type="email" placeholder="jane@example.com" value={contact.email}
                      onChange={e => setContact({ ...contact, email: e.target.value })} />
                  </Field>
                  <Field label="Phone *">
                    <input className="ts-input" type="tel" placeholder="(555) 000-0000" value={contact.phone}
                      onChange={e => setContact({ ...contact, phone: e.target.value })} />
                  </Field>
                </div>

                <Field label="Marital status *">
                  <div className="ts-grid-2">
                    {([
                      { id: "single",  icon: "user",  label: "Single" },
                      { id: "married", icon: "rings", label: "Married" },
                    ] as const).map(m => (
                      <button key={m.id} onClick={() => setContact({ ...contact, marital_status: m.id })}
                        className={`ts-tile${contact.marital_status === m.id ? " is-selected" : ""}`}
                        style={{ flexDirection: "row", padding: "14px 18px", gap: 12 }}>
                        <div className="ts-tile-icon"><Icon name={m.icon} size={18} /></div>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </Field>

                {contact.marital_status === "married" && (
                  <div className="ts-spouse-block">
                    <div className="ts-spouse-head">
                      <Icon name="rings" size={16} />
                      <span className="ts-eyebrow" style={{ color: "inherit" }}>Spouse information</span>
                    </div>
                    <div className="ts-grid-3">
                      <Field label="Spouse first *">
                        <input className="ts-input" placeholder="John" value={contact.spouse_first}
                          onChange={e => setContact({ ...contact, spouse_first: e.target.value })} />
                      </Field>
                      <Field label="Middle name">
                        <input className="ts-input" placeholder="B." value={contact.spouse_middle}
                          onChange={e => setContact({ ...contact, spouse_middle: e.target.value })} />
                      </Field>
                      <Field label="Spouse last *">
                        <input className="ts-input" placeholder="Doe" value={contact.spouse_last}
                          onChange={e => setContact({ ...contact, spouse_last: e.target.value })} />
                      </Field>
                    </div>
                  </div>
                )}
              </StepShell>
            )}

            {/* ── 2. Coverage type ── */}
            {step === "type" && (
              <StepShell kicker="02 · Coverage" title="What are you looking to insure?" onBack={back} onNext={() => next()}>
                <div className="ts-grid-3">
                  {([
                    { id: "auto",  icon: "auto",   label: "My Car(s)",  desc: "Auto insurance for 1 or more vehicles" },
                    { id: "home",  icon: "home",   label: "My Home",    desc: "Homeowner or renter's insurance" },
                    { id: "both",  icon: "shield", label: "Both",       desc: "Bundle for the best rate" },
                  ] as { id: InsuranceType; icon: string; label: string; desc: string }[]).map(t => (
                    <button key={t.id} onClick={() => setInsuranceType(t.id)}
                      className={`ts-tile ts-tile-tall${insuranceType === t.id ? " is-selected" : ""}`}>
                      <div className="ts-tile-icon"><Icon name={t.icon} size={22} stroke={1.4} /></div>
                      <div>
                        <div className="ts-tile-title">{t.label}</div>
                        <div className="ts-tile-desc">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </StepShell>
            )}

            {/* ── 3. Upload IDs ── */}
            {step === "upload_ids" && (
              <StepShell
                kicker="03 · ID upload"
                title="Upload IDs for everyone to be insured."
                subtitle={
                  insuranceType === "home"
                    ? "Upload a photo or scan of your ID (and your spouse's if applicable)."
                    : `Upload a driver's license for every driver in the household — including anyone who shares the car.`
                }
                onBack={back} onNext={() => next()}
              >
                <input ref={idFilesRef} type="file" accept="image/*,.pdf" multiple style={{ display: "none" }}
                  onChange={e => setIdFiles(Array.from(e.target.files || []).map(f => f.name))} />
                <DropZone files={idFiles} multi accept="image/*,.pdf"
                  label={insuranceType === "home" ? "Upload ID(s)" : "Upload driver's license(s)"}
                  onChange={names => { setIdFiles(names); }} />
                <div className="ts-callout-inline">
                  <span style={{ fontSize: 14 }}>ℹ️</span>
                  <span>
                    <strong>Who to include:</strong>{" "}
                    {insuranceType === "home"
                      ? "All household members who will be listed on the policy."
                      : `Every driver — including teenage or college-age children. ${contact.marital_status === "married" ? "Don't forget your spouse." : ""}`}
                  </span>
                </div>
                <button className="ts-step-skip" onClick={() => next()}>
                  Skip for now — agent can collect later
                </button>
              </StepShell>
            )}

            {/* ── 4. Upload policies ── */}
            {step === "policies" && (
              <StepShell
                kicker="04 · Policies"
                title="Do you have a current policy to upload?"
                subtitle="If yes, drop the PDF and our AI reads it instantly. If not, we'll walk through a few questions."
                onBack={back}
                onNext={handlePoliciesNext}
                nextLabel={policyUploaded ? "Continue with upload" : "I don't have one — ask me questions"}
              >
                {(insuranceType === "auto" || insuranceType === "both") && (
                  <div className="ts-policy-zone">
                    <div className="ts-policy-zone-head">
                      <Icon name="auto" size={16} />
                      <span className="ts-policy-zone-label">Auto policy</span>
                    </div>
                    <input ref={autoPolicyRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
                      onChange={e => setAutoPolicyFile(e.target.files ? [e.target.files[0].name] : [])} />
                    <DropZone files={autoPolicyFile} accept=".pdf,.jpg,.jpeg,.png"
                      label="Upload auto policy PDF or photo"
                      onChange={names => setAutoPolicyFile(names)} />
                  </div>
                )}
                {(insuranceType === "home" || insuranceType === "both") && (
                  <div className="ts-policy-zone">
                    <div className="ts-policy-zone-head">
                      <Icon name="home" size={16} />
                      <span className="ts-policy-zone-label">Home policy</span>
                    </div>
                    <input ref={homePolicyRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
                      onChange={e => setHomePolicyFile(e.target.files ? [e.target.files[0].name] : [])} />
                    <DropZone files={homePolicyFile} accept=".pdf,.jpg,.jpeg,.png"
                      label="Upload home policy PDF or photo"
                      onChange={names => setHomePolicyFile(names)} />
                  </div>
                )}
                <div className="ts-callout-inline">
                  <span>ℹ️</span>
                  <span>Our AI reads the PDF and extracts your current coverage so we can match or beat it — no manual data entry.</span>
                </div>
              </StepShell>
            )}

            {/* ── 5. Vehicle ── */}
            {step === "vehicle" && (
              <StepShell kicker="05 · Vehicle" title="Tell us about your vehicle."
                onBack={back} onNext={() => next()} nextDisabled={!vehicle.year || !vehicle.make || !vehicle.model}>
                <div className="ts-grid-3">
                  <Field label="Year *">
                    <input className="ts-input" placeholder="2022" maxLength={4} value={vehicle.year}
                      onChange={e => setVehicle({ ...vehicle, year: e.target.value })} />
                  </Field>
                  <Field label="Make *">
                    <input className="ts-input" placeholder="Toyota" value={vehicle.make}
                      onChange={e => setVehicle({ ...vehicle, make: e.target.value })} />
                  </Field>
                  <Field label="Model *">
                    <input className="ts-input" placeholder="Camry" value={vehicle.model}
                      onChange={e => setVehicle({ ...vehicle, model: e.target.value })} />
                  </Field>
                </div>
                <Field label="VIN (optional — helps get exact quotes)">
                  <input className="ts-input" placeholder="1HGCM82633A123456" value={vehicle.vin}
                    onChange={e => setVehicle({ ...vehicle, vin: e.target.value })} />
                </Field>
              </StepShell>
            )}

            {/* ── 6. Auto coverage ── */}
            {step === "auto_coverage" && (
              <StepShell kicker="06 · Auto coverage" title="Choose your auto coverage."
                subtitle="We've pre-selected what we recommend. Read each one and adjust — or leave our picks and we'll explain on the call."
                onBack={back} onNext={() => next()} nextLabel={insuranceType === "both" ? "Next: Home coverage" : "Almost done"}>
                <CoverageQ title="If you injure someone in an accident you caused"
                  desc="Pays for the other person's medical bills, lost wages, and legal costs. Virginia minimum is $30k/$60k — we recommend much more."
                  options={[{ label: "$30k/$60k", sublabel: "State min" }, { label: "$100k/$300k", sublabel: "Our pick ⭐", recommended: true }, { label: "$250k/$500k", sublabel: "Max protection" }]}
                  value={autoCoverage.bodily_injury} onChange={v => setAutoCoverage({ ...autoCoverage, bodily_injury: v as AutoCoverage["bodily_injury"] })}
                  recommended="$100k/$300k" />
                <CoverageQ title="If you damage someone's car or property"
                  desc="Covers the other person's vehicle, fence, mailbox, etc. if you're at fault."
                  options={[{ label: "$25k", sublabel: "State min" }, { label: "$100k", sublabel: "Our pick ⭐", recommended: true }, { label: "$250k", sublabel: "Max" }]}
                  value={autoCoverage.property_damage} onChange={v => setAutoCoverage({ ...autoCoverage, property_damage: v as AutoCoverage["property_damage"] })}
                  recommended="$100k" />
                <YesNoQ title="Fix your own car after an accident?"
                  desc="Collision coverage pays to repair or replace YOUR car after an accident — no matter who was at fault."
                  value={autoCoverage.collision} onChange={v => setAutoCoverage({ ...autoCoverage, collision: v })}
                  recommended extra={<DeductPicker label="How much do you pay first?" value={autoCoverage.collision_deductible} onChange={v => setAutoCoverage({ ...autoCoverage, collision_deductible: v as AutoCoverage["collision_deductible"] })} />} />
                <YesNoQ title="Cover theft, hail, fire, or hitting an animal?"
                  desc="Comprehensive covers damage to your car from anything other than a collision — hail, flooding, theft, vandalism, deer."
                  value={autoCoverage.comprehensive} onChange={v => setAutoCoverage({ ...autoCoverage, comprehensive: v })}
                  recommended extra={<DeductPicker label="Deductible:" value={autoCoverage.comp_deductible} onChange={v => setAutoCoverage({ ...autoCoverage, comp_deductible: v as AutoCoverage["comp_deductible"] })} />} />
                <YesNoQ title="Protection if an uninsured driver hits you?"
                  desc="1 in 8 drivers has no insurance. This covers YOUR bills when the at-fault driver can't pay."
                  value={autoCoverage.uninsured_motorist} onChange={v => setAutoCoverage({ ...autoCoverage, uninsured_motorist: v })} recommended />
                <YesNoQ title="Cover your medical bills after any accident?"
                  desc="MedPay covers you and your passengers' medical costs — regardless of fault."
                  value={autoCoverage.medical_payments} onChange={v => setAutoCoverage({ ...autoCoverage, medical_payments: v })}
                  recommended extra={
                    <div>
                      <p className="ts-field-label">Coverage amount per person</p>
                      <div className="ts-q-options">
                        {(["$2,000", "$5,000", "$10,000"] as const).map(a => (
                          <button key={a} className={`ts-q-opt${autoCoverage.medical_amount === a ? " is-selected" : ""}${a === "$5,000" ? " is-recommended" : ""}`}
                            onClick={() => setAutoCoverage({ ...autoCoverage, medical_amount: a })}>
                            <span className="v">{a}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  } />
                <YesNoQ title="Free rental car while yours is in the shop?"
                  desc="Rental Reimbursement pays for a rental while your car is being repaired after a covered claim."
                  value={autoCoverage.rental_car} onChange={v => setAutoCoverage({ ...autoCoverage, rental_car: v })} recommended />
                <YesNoQ title="Roadside help if you break down?"
                  desc="Covers towing, jump starts, flat tires, lockouts, and fuel delivery. Only a few dollars a month."
                  value={autoCoverage.roadside_assistance} onChange={v => setAutoCoverage({ ...autoCoverage, roadside_assistance: v })} recommended />
              </StepShell>
            )}

            {/* ── 7. Property ── */}
            {step === "property" && (
              <StepShell kicker="07 · Property" title="Tell us about your home."
                onBack={back} onNext={() => next()} nextDisabled={!property.address}>
                <Field label="Property address *">
                  <input className="ts-input" placeholder="123 Main St, Glen Allen, VA 23059" value={property.address}
                    onChange={e => setProperty({ ...property, address: e.target.value })} />
                </Field>
                <div className="ts-grid-2">
                  <Field label="Year built">
                    <input className="ts-input" placeholder="1995" value={property.year_built}
                      onChange={e => setProperty({ ...property, year_built: e.target.value })} />
                  </Field>
                  <Field label="Square footage">
                    <input className="ts-input" placeholder="2,000" value={property.sqft}
                      onChange={e => setProperty({ ...property, sqft: e.target.value })} />
                  </Field>
                </div>
                <Field label="Property type">
                  <div className="ts-grid-2">
                    {([
                      { id: "single_family", label: "Single Family" },
                      { id: "condo",         label: "Condo" },
                      { id: "townhouse",     label: "Townhouse" },
                      { id: "mobile",        label: "Mobile Home" },
                    ] as { id: PropertyInfo["type"]; label: string }[]).map(t => (
                      <button key={t.id} onClick={() => setProperty({ ...property, type: t.id })}
                        className={`ts-tile${property.type === t.id ? " is-selected" : ""}`}
                        style={{ padding: "12px 16px", flexDirection: "row" }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              </StepShell>
            )}

            {/* ── 8. Home coverage ── */}
            {step === "home_coverage" && (
              <StepShell kicker="08 · Home coverage" title="Choose your home coverage."
                subtitle="We've pre-selected what we recommend. Your agent will review everything with you."
                onBack={back} onNext={() => next()} nextLabel="Almost done">
                <Field label="Cost to rebuild your home?">
                  <div className="ts-input-money">
                    <span className="ts-input-money-sign">$</span>
                    <input className="ts-input" style={{ paddingLeft: 28 }} placeholder="300,000" value={homeCoverage.dwelling_value}
                      onChange={e => setHomeCoverage({ ...homeCoverage, dwelling_value: e.target.value })} />
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 6 }}>
                    ★ Not sure? Leave it blank — we&apos;ll figure it out together.
                  </p>
                </Field>
                <YesNoQ title="Cover your furniture, electronics & belongings?"
                  desc="Personal Property covers everything inside your home — furniture, clothes, appliances, electronics — if stolen or damaged."
                  value={homeCoverage.personal_property} onChange={v => setHomeCoverage({ ...homeCoverage, personal_property: v })} recommended />
                <CoverageQ title="If someone gets hurt on your property and sues you"
                  desc="Liability covers their medical bills and your legal defense. The more assets you have, the more you should carry."
                  options={[{ label: "$100,000", sublabel: "Basic" }, { label: "$300,000", sublabel: "Our pick ⭐", recommended: true }, { label: "$500,000", sublabel: "Maximum" }]}
                  value={homeCoverage.liability_amount} onChange={v => setHomeCoverage({ ...homeCoverage, liability_amount: v as HomeCoverage["liability_amount"] })}
                  recommended="$300,000" />
                <YesNoQ title="Hotel & living costs if you're forced to move out?"
                  desc="Loss of Use pays for your hotel, meals, and extra costs if your home becomes uninhabitable after a covered loss."
                  value={homeCoverage.loss_of_use} onChange={v => setHomeCoverage({ ...homeCoverage, loss_of_use: v })} recommended />
                <YesNoQ title="Water backup & sewer overflow damage?"
                  desc="Standard policies don't cover sewer or drain backup. This affordable add-on covers a surprisingly common claim."
                  value={homeCoverage.water_backup} onChange={v => setHomeCoverage({ ...homeCoverage, water_backup: v })} recommended />
                <YesNoQ title="Flood insurance?"
                  desc="Standard home insurance does NOT cover floods. If you're near water or in a flood zone, you may need a separate flood policy."
                  value={homeCoverage.flood} onChange={v => setHomeCoverage({ ...homeCoverage, flood: v })} />
              </StepShell>
            )}

            {/* ── 9. Notes ── */}
            {step === "additional" && (
              <StepShell kicker="09 · Notes" title="Anything else we should know?"
                subtitle="This is your chance to mention past accidents, special circumstances, questions — or anything that might affect your quote."
                onBack={back} onNext={() => next()} nextLabel="Review & submit">
                <textarea className="ts-input" rows={6} value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder={`Examples:\n• Had a fender bender 2 years ago\n• Teen driver turning 16 next month\n• Home has a pool / trampoline\n• Running a business from home\n• Want to bundle for a discount\n• Questions about a specific coverage...`} />
                <p style={{ fontSize: 13, color: "var(--text-faint)", textAlign: "center" }}>
                  This is optional — you can also ask your agent directly on the call.
                </p>
              </StepShell>
            )}

            {/* ── 10. Review ── */}
            {step === "review" && (
              <StepShell kicker="10 · Review" title="Ready to submit?"
                subtitle="An agent will call you within 24 hours with your personalized quote."
                onBack={back} onNext={handleSubmit}
                nextLabel={submitting ? "Submitting…" : "Submit my quote request"}
                nextDisabled={submitting} submitting={submitting}>
                <div className="ts-review">
                  <div className="ts-review-section">
                    <div className="ts-review-section-head">
                      <span className="ts-eyebrow">Contact</span>
                    </div>
                    <ReviewRow k="Name" v={[contact.first_name, contact.middle_name, contact.last_name].filter(Boolean).join(" ")} />
                    <ReviewRow k="Email" v={contact.email} />
                    <ReviewRow k="Phone" v={contact.phone} />
                    <ReviewRow k="Status" v={contact.marital_status === "married" ? "Married" : "Single"} />
                    {contact.marital_status === "married" && (
                      <ReviewRow k="Spouse" v={[contact.spouse_first, contact.spouse_middle, contact.spouse_last].filter(Boolean).join(" ")} />
                    )}
                  </div>

                  <div className="ts-review-section">
                    <div className="ts-review-section-head">
                      <span className="ts-eyebrow">Coverage</span>
                    </div>
                    <ReviewRow k="Insurance type" v={{ auto: "Auto", home: "Home", both: "Auto + Home" }[insuranceType]} />
                    {autoPolicyFile.length > 0 && <ReviewRow k="Auto policy" v={autoPolicyFile[0]} />}
                    {homePolicyFile.length > 0 && <ReviewRow k="Home policy" v={homePolicyFile[0]} />}
                    {idFiles.length > 0 && <ReviewRow k="IDs uploaded" v={`${idFiles.length} file${idFiles.length > 1 ? "s" : ""}`} />}
                    {skipPolicies && (insuranceType === "auto" || insuranceType === "both") && (
                      <ReviewRow k="Vehicle" v={[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ")} />
                    )}
                    {skipPolicies && (insuranceType === "home" || insuranceType === "both") && (
                      <ReviewRow k="Property" v={property.address} />
                    )}
                  </div>

                  {notes && (
                    <div className="ts-review-section">
                      <div className="ts-review-section-head"><span className="ts-eyebrow">Notes</span></div>
                      <p className="ts-review-notes">{notes}</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div style={{ padding: "12px 16px", background: "rgba(200,50,50,0.08)", border: "1px solid rgba(200,50,50,0.25)", borderRadius: 12, color: "rgba(200,50,50,0.9)", fontSize: 14 }}>
                    {error}
                  </div>
                )}

                <div className="ts-review-foot">
                  <span style={{ color: "var(--text-faint)" }}>Prefer to talk now?</span>
                  <a href="tel:+18049446226" style={{ color: "var(--gold)", fontFamily: "var(--font-mono)" }}>(804) 944-6226</a>
                  <span style={{ color: "var(--text-faint)" }}>·</span>
                  <a href="https://wa.me/18049446226" target="_blank" rel="noopener noreferrer" style={{ color: "var(--whatsapp)" }}>WhatsApp</a>
                </div>
              </StepShell>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
