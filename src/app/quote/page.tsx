"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type InsuranceType = "auto" | "home" | "both";
type MaritalStatus = "single" | "married";

type AutoCoverage = {
  bodily_injury: "$30k/$60k" | "$100k/$300k" | "$250k/$500k";
  property_damage: "$25k" | "$100k" | "$250k";
  collision: boolean;
  collision_deductible: "$250" | "$500" | "$1000";
  comprehensive: boolean;
  comp_deductible: "$250" | "$500" | "$1000";
  uninsured_motorist: boolean;
  medical_payments: boolean;
  medical_amount: "$2,000" | "$5,000" | "$10,000";
  rental_car: boolean;
  roadside_assistance: boolean;
};

type HomeCoverage = {
  dwelling_value: string;
  personal_property: boolean;
  liability_amount: "$100,000" | "$300,000" | "$500,000";
  loss_of_use: boolean;
  water_backup: boolean;
  flood: boolean;
};

type VehicleInfo = { year: string; make: string; model: string; vin: string };
type PropertyInfo = { address: string; year_built: string; sqft: string; type: "single_family" | "condo" | "townhouse" | "mobile" };

const DEFAULT_AUTO: AutoCoverage = {
  bodily_injury: "$100k/$300k", property_damage: "$100k",
  collision: true, collision_deductible: "$500",
  comprehensive: true, comp_deductible: "$500",
  uninsured_motorist: true,
  medical_payments: true, medical_amount: "$5,000",
  rental_car: true, roadside_assistance: true,
};

const DEFAULT_HOME: HomeCoverage = {
  dwelling_value: "", personal_property: true,
  liability_amount: "$300,000", loss_of_use: true,
  water_backup: true, flood: false,
};

type Step =
  | "contact"
  | "type"
  | "has_policy"
  | "upload"
  | "vehicle"
  | "upload_ids"
  | "auto_coverage"
  | "property"
  | "home_coverage"
  | "additional"
  | "review";

// ─── Page export ──────────────────────────────────────────────────────────────

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0f1e]" />}>
      <QuoteWizard />
    </Suspense>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

function QuoteWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File refs
  const policyFileRef = useRef<HTMLInputElement>(null);
  const idFilesRef = useRef<HTMLInputElement>(null);
  const [policyFileName, setPolicyFileName] = useState<string | null>(null);
  const [idFileNames, setIdFileNames] = useState<string[]>([]);

  // Contact
  const [contact, setContact] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    marital_status: "" as MaritalStatus | "",
    family_members: "1",
  });

  // Selections
  const [insuranceType, setInsuranceType] = useState<InsuranceType>("auto");
  const [hasPolicy, setHasPolicy] = useState<boolean | null>(null);

  // Details
  const [vehicle, setVehicle] = useState<VehicleInfo>({ year: "", make: "", model: "", vin: "" });
  const [property, setProperty] = useState<PropertyInfo>({ address: "", year_built: "", sqft: "", type: "single_family" });
  const [autoCoverage, setAutoCoverage] = useState<AutoCoverage>(DEFAULT_AUTO);
  const [homeCoverage, setHomeCoverage] = useState<HomeCoverage>(DEFAULT_HOME);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // ── Step ordering ──────────────────────────────────────────────────────────

  function getSteps(): Step[] {
    if (hasPolicy) {
      return ["contact", "type", "has_policy", "upload", "upload_ids", "additional", "review"];
    }
    if (insuranceType === "auto") {
      return ["contact", "type", "has_policy", "vehicle", "upload_ids", "auto_coverage", "additional", "review"];
    }
    if (insuranceType === "home") {
      return ["contact", "type", "has_policy", "property", "upload_ids", "home_coverage", "additional", "review"];
    }
    return ["contact", "type", "has_policy", "vehicle", "upload_ids", "auto_coverage", "property", "home_coverage", "additional", "review"];
  }

  const steps = getSteps();
  const currentIndex = steps.indexOf(step);
  const progress = Math.round(((currentIndex + 1) / steps.length) * 100);

  function next(override?: Step) {
    if (override) { setStep(override); return; }
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  }
  function back() {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("first_name", contact.first_name);
      fd.append("last_name", contact.last_name);
      fd.append("email", contact.email);
      fd.append("phone", contact.phone);
      fd.append("marital_status", contact.marital_status);
      fd.append("family_members", contact.family_members);
      fd.append("insurance_type", insuranceType);
      fd.append("has_policy", String(hasPolicy));
      fd.append("additional_notes", additionalNotes);

      if (hasPolicy && policyFileRef.current?.files?.[0]) {
        fd.append("policy_file", policyFileRef.current.files[0]);
      } else {
        fd.append("vehicle_info", JSON.stringify(vehicle));
        fd.append("property_info", JSON.stringify(property));
        fd.append("auto_coverage", JSON.stringify(autoCoverage));
        fd.append("home_coverage", JSON.stringify(homeCoverage));
      }

      // Upload all ID files
      if (idFilesRef.current?.files) {
        Array.from(idFilesRef.current.files).forEach((f, i) =>
          fd.append(`id_document_${i}`, f)
        );
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
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#d4af37]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d4af37] flex items-center justify-center">
              <span className="text-[#0a0f1e] font-black">T</span>
            </div>
            <span className="text-white font-bold">Trinity Solutions</span>
          </Link>
          <a href="tel:+18049446226" className="text-white/50 hover:text-[#d4af37] text-sm transition-colors hidden sm:block">
            📞 (804) 944-6226
          </a>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div className="h-full bg-[#d4af37] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Step counter */}
      <div className="text-center pt-4 pb-1">
        <span className="text-xs text-white/30">Step {currentIndex + 1} of {steps.length}</span>
      </div>

      {/* Content */}
      <section className="flex-1 flex items-start justify-center px-4 py-6 pb-16">
        <div className="w-full max-w-xl">

          {/* ── Contact ── */}
          {step === "contact" && (
            <StepShell
              title="Let's get started"
              subtitle="We'll use this to send your quote and follow up."
              onNext={() => {
                if (!contact.first_name || !contact.last_name || !contact.email || !contact.phone || !contact.marital_status) return;
                next();
              }}
              nextLabel="Continue →"
              nextDisabled={!contact.first_name || !contact.last_name || !contact.email || !contact.phone || !contact.marital_status}
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name *">
                  <input type="text" placeholder="Jane" value={contact.first_name}
                    onChange={e => setContact({ ...contact, first_name: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Last Name *">
                  <input type="text" placeholder="Doe" value={contact.last_name}
                    onChange={e => setContact({ ...contact, last_name: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email *">
                  <input type="email" placeholder="jane@example.com" value={contact.email}
                    onChange={e => setContact({ ...contact, email: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Phone *">
                  <input type="tel" placeholder="(555) 000-0000" value={contact.phone}
                    onChange={e => setContact({ ...contact, phone: e.target.value })} className={inputCls} />
                </Field>
              </div>

              {/* Marital status */}
              <Field label="Marital Status *">
                <div className="grid grid-cols-2 gap-3">
                  {([{ id: "single", icon: "🧑", label: "Single" }, { id: "married", icon: "💍", label: "Married" }] as const).map(m => (
                    <button key={m.id} onClick={() => setContact({ ...contact, marital_status: m.id })}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${contact.marital_status === m.id ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                      <span>{m.icon}</span> {m.label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Family members */}
              <Field label="How many people need to be covered? *">
                <p className="text-xs text-white/40 mb-2">Include yourself, spouse, and any family members living in the household.</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setContact({ ...contact, family_members: String(Math.max(1, Number(contact.family_members) - 1)) })}
                    className="w-10 h-10 rounded-full border border-white/20 text-white text-xl hover:border-[#d4af37]/50 transition-colors flex items-center justify-center">−</button>
                  <span className="text-3xl font-black text-[#d4af37] w-12 text-center">{contact.family_members}</span>
                  <button onClick={() => setContact({ ...contact, family_members: String(Number(contact.family_members) + 1) })}
                    className="w-10 h-10 rounded-full border border-white/20 text-white text-xl hover:border-[#d4af37]/50 transition-colors flex items-center justify-center">+</button>
                  <span className="text-white/50 text-sm">{Number(contact.family_members) === 1 ? "person" : "people"}</span>
                </div>
              </Field>
            </StepShell>
          )}

          {/* ── Insurance type ── */}
          {step === "type" && (
            <StepShell title="What are you looking to insure?" onBack={back} onNext={next} nextLabel="Continue →">
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "auto", icon: "🚗", label: "My Car(s)" },
                  { id: "home", icon: "🏠", label: "My Home" },
                  { id: "both", icon: "🛡️", label: "Both" },
                ] as { id: InsuranceType; icon: string; label: string }[]).map(t => (
                  <button key={t.id} onClick={() => setInsuranceType(t.id)}
                    className={`flex flex-col items-center gap-2 border rounded-xl p-5 transition-all ${insuranceType === t.id ? "border-[#d4af37] bg-[#d4af37]/10" : "border-white/10 hover:border-white/30"}`}>
                    <span className="text-4xl">{t.icon}</span>
                    <span className={`text-sm font-semibold ${insuranceType === t.id ? "text-[#d4af37]" : "text-white/70"}`}>{t.label}</span>
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {/* ── Has policy? ── */}
          {step === "has_policy" && (
            <StepShell
              title="Do you have a current insurance policy?"
              subtitle="If yes, you can upload it and we'll compare your exact coverage. If not, we'll walk you through it with simple questions."
              onBack={back}
              onNext={() => {
                if (hasPolicy === null) return;
                if (hasPolicy) next("upload");
                else next(insuranceType === "home" ? "property" : "vehicle");
              }}
              nextLabel="Continue →"
              nextDisabled={hasPolicy === null}
            >
              <div className="grid grid-cols-2 gap-4">
                <ChoiceCard selected={hasPolicy === true} onClick={() => setHasPolicy(true)}
                  icon="📄" title="Yes, I have one" desc="I'll upload my current policy PDF or photo" />
                <ChoiceCard selected={hasPolicy === false} onClick={() => setHasPolicy(false)}
                  icon="🆕" title="No / New policy" desc="I'll answer a few simple questions" />
              </div>
            </StepShell>
          )}

          {/* ── Upload policy ── */}
          {step === "upload" && (
            <StepShell title="Upload your current policy" subtitle="We'll use AI to read it and find you better coverage instantly."
              onBack={back} onNext={next} nextLabel="Continue →">
              <DropZone
                inputRef={policyFileRef}
                fileName={policyFileName}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setPolicyFileName(e.target.files?.[0]?.name || null)}
                label="Click to upload your policy PDF or photo"
                sublabel="Declaration page or full policy"
              />
              <p className="text-center text-sm text-white/40">
                Don't have it?{" "}
                <button className="text-[#d4af37] hover:underline"
                  onClick={() => { setHasPolicy(false); next(insuranceType === "home" ? "property" : "vehicle"); }}>
                  Skip — answer questions instead →
                </button>
              </p>
            </StepShell>
          )}

          {/* ── Vehicle info ── */}
          {step === "vehicle" && (
            <StepShell title="Tell us about your vehicle" onBack={back} onNext={next} nextLabel="Continue →"
              nextDisabled={!vehicle.year || !vehicle.make || !vehicle.model}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Year *">
                  <input type="text" placeholder="2020" maxLength={4} value={vehicle.year}
                    onChange={e => setVehicle({ ...vehicle, year: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Make *">
                  <input type="text" placeholder="Toyota" value={vehicle.make}
                    onChange={e => setVehicle({ ...vehicle, make: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Model *">
                <input type="text" placeholder="Camry" value={vehicle.model}
                  onChange={e => setVehicle({ ...vehicle, model: e.target.value })} className={inputCls} />
              </Field>
              <Field label={<>VIN <span className="text-white/30">(optional — helps us get exact quotes)</span></>}>
                <input type="text" placeholder="1HGCM82633A123456" value={vehicle.vin}
                  onChange={e => setVehicle({ ...vehicle, vin: e.target.value })} className={inputCls} />
              </Field>
            </StepShell>
          )}

          {/* ── Upload IDs ── */}
          {step === "upload_ids" && (
            <StepShell
              title="Upload IDs for everyone to be insured"
              subtitle={
                insuranceType === "home"
                  ? `Upload a photo or scan of your ID (and your spouse's if applicable). This helps us verify the policy.`
                  : `Upload a driver's license for every driver in the household. Include everyone who drives the car${Number(contact.family_members) > 1 ? ` — you listed ${contact.family_members} people` : ""}.`
              }
              onBack={back}
              onNext={next}
              nextLabel="Continue →"
            >
              <div
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#d4af37]/50 transition-colors"
                onClick={() => idFilesRef.current?.click()}
              >
                <input
                  ref={idFilesRef}
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={e => setIdFileNames(Array.from(e.target.files || []).map(f => f.name))}
                />
                {idFileNames.length > 0 ? (
                  <div className="space-y-1">
                    {idFileNames.map((name, i) => (
                      <div key={i} className="flex items-center justify-center gap-2 text-[#d4af37] text-sm">
                        <span>🪪</span> <span>{name}</span>
                      </div>
                    ))}
                    <p className="text-white/40 text-xs mt-3">Click to add more or replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <span className="text-5xl">🪪</span>
                    <p className="font-medium text-white/70">Click to upload ID(s)</p>
                    <p className="text-sm">Driver's license, state ID, or passport</p>
                    <p className="text-xs text-white/30">You can select multiple files at once</p>
                  </div>
                )}
              </div>

              {insuranceType !== "home" && (
                <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-xl p-4 text-sm text-white/60">
                  <span className="text-[#d4af37] font-semibold">Who to include: </span>
                  Everyone who drives this vehicle — including teenage or college-age children living at home.
                  {contact.marital_status === "married" && " Don't forget your spouse."}
                </div>
              )}

              <p className="text-center text-xs text-white/40">
                Don't have them handy?{" "}
                <button className="text-[#d4af37] hover:underline" onClick={() => next()}>Skip for now →</button>
                {" "}Your agent can collect them later.
              </p>
            </StepShell>
          )}

          {/* ── Auto coverage ── */}
          {step === "auto_coverage" && (
            <StepShell
              title="Choose your auto coverage"
              subtitle="We've pre-selected what we recommend. Read each one and adjust if you like — or just leave our picks and we'll explain on the call."
              onBack={back}
              onNext={next}
              nextLabel={insuranceType === "both" ? "Next: Home →" : "Almost done →"}
            >
              <div className="space-y-4">
                <CoverageQuestion
                  title="💥 If you injure someone in an accident you caused"
                  desc="Pays for the other person's medical bills, lost wages, and legal costs. Virginia minimum is $30k/$60k — we recommend much more."
                  options={[
                    { label: "$30k/$60k", sublabel: "State min" },
                    { label: "$100k/$300k", sublabel: "Our pick ⭐", recommended: true },
                    { label: "$250k/$500k", sublabel: "Max protection" },
                  ]}
                  value={autoCoverage.bodily_injury}
                  onChange={v => setAutoCoverage({ ...autoCoverage, bodily_injury: v as AutoCoverage["bodily_injury"] })}
                />
                <CoverageQuestion
                  title="🚧 If you damage someone's car or property"
                  desc="Covers the other person's vehicle, fence, mailbox, etc. if you're at fault."
                  options={[
                    { label: "$25k", sublabel: "State min" },
                    { label: "$100k", sublabel: "Our pick ⭐", recommended: true },
                    { label: "$250k", sublabel: "Max" },
                  ]}
                  value={autoCoverage.property_damage}
                  onChange={v => setAutoCoverage({ ...autoCoverage, property_damage: v as AutoCoverage["property_damage"] })}
                />
                <YesNoQuestion
                  title="🔧 Fix your own car after an accident?"
                  desc="Collision coverage pays to repair or replace YOUR car after an accident — no matter who was at fault."
                  value={autoCoverage.collision}
                  onChange={v => setAutoCoverage({ ...autoCoverage, collision: v })}
                  recommended={true}
                  extraWhenYes={
                    <DeductiblePicker
                      label="How much do you pay first before we cover the rest?"
                      value={autoCoverage.collision_deductible}
                      onChange={v => setAutoCoverage({ ...autoCoverage, collision_deductible: v as AutoCoverage["collision_deductible"] })}
                    />
                  }
                />
                <YesNoQuestion
                  title="🌧️ Cover theft, hail, fire, or hitting an animal?"
                  desc="Comprehensive covers damage to your car from anything other than a collision — hail, flooding, theft, vandalism, deer."
                  value={autoCoverage.comprehensive}
                  onChange={v => setAutoCoverage({ ...autoCoverage, comprehensive: v })}
                  recommended={true}
                  extraWhenYes={
                    <DeductiblePicker
                      label="Deductible:"
                      value={autoCoverage.comp_deductible}
                      onChange={v => setAutoCoverage({ ...autoCoverage, comp_deductible: v as AutoCoverage["comp_deductible"] })}
                    />
                  }
                />
                <YesNoQuestion
                  title="🚫 Protection if an uninsured driver hits you?"
                  desc="1 in 8 drivers has no insurance. This covers YOUR bills when the at-fault driver can't pay."
                  value={autoCoverage.uninsured_motorist}
                  onChange={v => setAutoCoverage({ ...autoCoverage, uninsured_motorist: v })}
                  recommended={true}
                />
                <YesNoQuestion
                  title="🏥 Cover your medical bills after any accident?"
                  desc="Medical Payments (MedPay) covers you and your passengers' medical costs — regardless of fault."
                  value={autoCoverage.medical_payments}
                  onChange={v => setAutoCoverage({ ...autoCoverage, medical_payments: v })}
                  recommended={true}
                  extraWhenYes={
                    <div>
                      <p className="text-xs text-white/50 mb-2">Coverage amount per person:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["$2,000", "$5,000", "$10,000"] as const).map(a => (
                          <button key={a} onClick={() => setAutoCoverage({ ...autoCoverage, medical_amount: a })}
                            className={`text-sm py-2 rounded-lg border transition-all ${autoCoverage.medical_amount === a ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] font-semibold" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                            {a}{a === "$5,000" ? " ⭐" : ""}
                          </button>
                        ))}
                      </div>
                    </div>
                  }
                />
                <YesNoQuestion
                  title="🚗 Free rental car while yours is in the shop?"
                  desc="Rental Reimbursement pays for a rental while your car is being repaired after a covered claim."
                  value={autoCoverage.rental_car}
                  onChange={v => setAutoCoverage({ ...autoCoverage, rental_car: v })}
                  recommended={true}
                />
                <YesNoQuestion
                  title="🛣️ Roadside help if you break down?"
                  desc="Covers towing, jump starts, flat tires, lockouts, and fuel delivery. Only a few dollars a month."
                  value={autoCoverage.roadside_assistance}
                  onChange={v => setAutoCoverage({ ...autoCoverage, roadside_assistance: v })}
                  recommended={true}
                />
              </div>
            </StepShell>
          )}

          {/* ── Property info ── */}
          {step === "property" && (
            <StepShell title="Tell us about your home" onBack={back} onNext={next} nextLabel="Continue →"
              nextDisabled={!property.address}>
              <Field label="Property Address *">
                <input type="text" placeholder="123 Main St, Glen Allen, VA 23059" value={property.address}
                  onChange={e => setProperty({ ...property, address: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Year Built">
                  <input type="text" placeholder="1995" value={property.year_built}
                    onChange={e => setProperty({ ...property, year_built: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Square Footage">
                  <input type="text" placeholder="2,000" value={property.sqft}
                    onChange={e => setProperty({ ...property, sqft: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <Field label="Property Type">
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: "single_family", label: "🏠 Single Family" },
                    { id: "condo", label: "🏢 Condo" },
                    { id: "townhouse", label: "🏘️ Townhouse" },
                    { id: "mobile", label: "🚐 Mobile Home" },
                  ] as { id: PropertyInfo["type"]; label: string }[]).map(t => (
                    <button key={t.id} onClick={() => setProperty({ ...property, type: t.id })}
                      className={`py-3 rounded-xl border text-sm font-medium transition-all ${property.type === t.id ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]" : "border-white/10 text-white/60 hover:border-white/30"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
            </StepShell>
          )}

          {/* ── Home coverage ── */}
          {step === "home_coverage" && (
            <StepShell
              title="Choose your home coverage"
              subtitle="We've pre-selected what we recommend. Adjust anything — your agent will review it with you."
              onBack={back} onNext={next} nextLabel="Almost done →"
            >
              <div className="space-y-4">
                <Field label="💰 How much would it cost to completely rebuild your home?">
                  <p className="text-xs text-white/40 mb-2">This is the rebuild cost — not the market value. If unsure, leave blank and your agent will calculate it.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
                    <input type="text" placeholder="300,000" value={homeCoverage.dwelling_value}
                      onChange={e => setHomeCoverage({ ...homeCoverage, dwelling_value: e.target.value })}
                      className={`${inputCls} pl-7`} />
                  </div>
                  <p className="text-xs text-[#d4af37]/70 mt-1.5">⭐ Not sure? Leave it blank — we'll figure it out together.</p>
                </Field>
                <YesNoQuestion
                  title="🛋️ Cover your furniture, electronics & belongings?"
                  desc="Personal Property covers everything inside your home — furniture, clothes, appliances, electronics — if stolen or damaged."
                  value={homeCoverage.personal_property}
                  onChange={v => setHomeCoverage({ ...homeCoverage, personal_property: v })}
                  recommended={true}
                />
                <CoverageQuestion
                  title="⚖️ If someone gets hurt on your property and sues you"
                  desc="Liability covers their medical bills and your legal defense. The more assets you have, the more you should carry."
                  options={[
                    { label: "$100,000", sublabel: "Basic" },
                    { label: "$300,000", sublabel: "Our pick ⭐", recommended: true },
                    { label: "$500,000", sublabel: "Maximum" },
                  ]}
                  value={homeCoverage.liability_amount}
                  onChange={v => setHomeCoverage({ ...homeCoverage, liability_amount: v as HomeCoverage["liability_amount"] })}
                />
                <YesNoQuestion
                  title="🏨 Hotel & living costs if you're forced to move out?"
                  desc="Loss of Use pays for your hotel, meals, and extra costs if your home becomes uninhabitable after a covered loss."
                  value={homeCoverage.loss_of_use}
                  onChange={v => setHomeCoverage({ ...homeCoverage, loss_of_use: v })}
                  recommended={true}
                />
                <YesNoQuestion
                  title="💧 Water backup & sewer overflow damage?"
                  desc="Standard policies don't cover sewer or drain backup. This affordable add-on covers a surprisingly common claim."
                  value={homeCoverage.water_backup}
                  onChange={v => setHomeCoverage({ ...homeCoverage, water_backup: v })}
                  recommended={true}
                />
                <YesNoQuestion
                  title="🌊 Flood insurance?"
                  desc="Standard home insurance does NOT cover floods. If you're near water or in a flood zone, you may need a separate flood policy."
                  value={homeCoverage.flood}
                  onChange={v => setHomeCoverage({ ...homeCoverage, flood: v })}
                  recommended={false}
                />
              </div>
            </StepShell>
          )}

          {/* ── Additional ── */}
          {step === "additional" && (
            <StepShell
              title="Anything else we should know?"
              subtitle="This is your chance to tell us anything that might affect your quote — past accidents, tickets, special circumstances, questions, etc."
              onBack={back} onNext={next} nextLabel="Review & Submit →"
            >
              <textarea
                rows={6}
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                placeholder={`Examples:\n• Had a fender bender 2 years ago\n• Teen driver turning 16 next month\n• Home has a pool / trampoline\n• Running a business from home\n• Want to bundle for a discount\n• Questions about a specific coverage...`}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#d4af37]/60 transition-colors resize-none text-sm leading-relaxed"
              />
              <p className="text-xs text-white/30 text-center">This is optional — you can also ask your agent directly on the call.</p>
            </StepShell>
          )}

          {/* ── Review ── */}
          {step === "review" && (
            <StepShell
              title="Ready to submit?"
              subtitle="An agent will call you within 24 hours with your personalized quote."
              onBack={back} onNext={submit}
              nextLabel={loading ? "Submitting…" : "Submit My Quote Request ✓"}
              nextDisabled={loading}
            >
              <div className="bg-[#0d1530] border border-white/10 rounded-xl divide-y divide-white/5">
                <ReviewRow label="Name" value={`${contact.first_name} ${contact.last_name}`} />
                <ReviewRow label="Email" value={contact.email} />
                <ReviewRow label="Phone" value={contact.phone} />
                <ReviewRow label="Status" value={contact.marital_status === "married" ? "💍 Married" : "🧑 Single"} />
                <ReviewRow label="People covered" value={`${contact.family_members} ${Number(contact.family_members) === 1 ? "person" : "people"}`} />
                <ReviewRow label="Coverage" value={{ auto: "🚗 Auto", home: "🏠 Home", both: "🛡️ Auto + Home" }[insuranceType]} />
                {hasPolicy
                  ? <ReviewRow label="Policy" value={policyFileName ? `📄 ${policyFileName}` : "No file attached"} />
                  : (insuranceType === "auto" || insuranceType === "both")
                    ? <ReviewRow label="Vehicle" value={[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—"} />
                    : null
                }
                {(insuranceType === "home" || insuranceType === "both") && !hasPolicy && (
                  <ReviewRow label="Property" value={property.address || "—"} />
                )}
                {idFileNames.length > 0 && (
                  <ReviewRow label="IDs uploaded" value={`${idFileNames.length} file${idFileNames.length > 1 ? "s" : ""}`} />
                )}
                {additionalNotes && (
                  <div className="px-5 py-3">
                    <p className="text-xs text-white/40 mb-1">Additional notes</p>
                    <p className="text-sm text-white/70 leading-relaxed">{additionalNotes}</p>
                  </div>
                )}
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
              )}
              <p className="text-center text-xs text-white/40 pt-1">
                Prefer to talk now?{" "}
                <a href="tel:+18049446226" className="text-[#d4af37] hover:underline">(804) 944-6226</a>
                {" "}·{" "}
                <a href="https://wa.me/18049446226" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">WhatsApp</a>
              </p>
            </StepShell>
          )}

        </div>
      </section>
    </main>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-[#0a0f1e] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]/60 transition-colors";

function StepShell({ title, subtitle, children, onBack, onNext, nextLabel = "Continue →", nextDisabled = false }: {
  title: string; subtitle?: string; children: React.ReactNode;
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-black text-white mb-2">{title}</h1>
        {subtitle && <p className="text-white/50 leading-relaxed text-sm">{subtitle}</p>}
      </div>
      <div className="space-y-5">{children}</div>
      <div className={`flex gap-3 mt-8 ${onBack ? "justify-between" : "justify-end"}`}>
        {onBack && (
          <button onClick={onBack} className="px-6 py-3 border border-white/15 text-white/60 hover:text-white rounded-xl transition-colors text-sm">
            ← Back
          </button>
        )}
        {onNext && (
          <button onClick={onNext} disabled={nextDisabled}
            className="flex-1 bg-[#d4af37] hover:bg-[#e5c84a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0f1e] font-black py-3.5 rounded-xl transition-all text-sm">
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ChoiceCard({ selected, onClick, icon, title, desc }: {
  selected: boolean; onClick: () => void; icon: string; title: string; desc: string;
}) {
  return (
    <button onClick={onClick}
      className={`flex flex-col items-start gap-2 border rounded-xl p-5 text-left transition-all w-full ${selected ? "border-[#d4af37] bg-[#d4af37]/10" : "border-white/10 hover:border-white/30"}`}>
      <span className="text-3xl">{icon}</span>
      <span className={`font-semibold text-sm ${selected ? "text-[#d4af37]" : "text-white"}`}>{title}</span>
      <span className="text-xs text-white/50 leading-relaxed">{desc}</span>
    </button>
  );
}

function DropZone({ inputRef, fileName, accept, onChange, label, sublabel }: {
  inputRef: React.RefObject<HTMLInputElement>; fileName: string | null;
  accept: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string; sublabel: string;
}) {
  return (
    <div className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center cursor-pointer hover:border-[#d4af37]/50 transition-colors"
      onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChange} />
      {fileName ? (
        <div className="flex flex-col items-center gap-2 text-[#d4af37]">
          <span className="text-4xl">✅</span>
          <span className="font-semibold text-sm">{fileName}</span>
          <span className="text-white/40 text-xs">Click to change</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-white/40">
          <span className="text-5xl">📤</span>
          <p className="font-medium text-white/70 text-sm">{label}</p>
          <p className="text-xs">{sublabel}</p>
        </div>
      )}
    </div>
  );
}

function CoverageQuestion({ title, desc, options, value, onChange }: {
  title: string; desc: string;
  options: { label: string; sublabel: string; recommended?: boolean }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="bg-[#0d1530] border border-white/10 rounded-xl p-5">
      <p className="font-semibold text-white mb-1 text-sm">{title}</p>
      <p className="text-xs text-white/50 mb-4 leading-relaxed">{desc}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => (
          <button key={opt.label} onClick={() => onChange(opt.label)}
            className={`flex flex-col items-center gap-0.5 py-3 px-2 rounded-lg border transition-all text-center ${value === opt.label ? "border-[#d4af37] bg-[#d4af37]/10" : "border-white/10 hover:border-white/20"}`}>
            <span className={`text-sm font-bold leading-tight ${value === opt.label ? "text-[#d4af37]" : "text-white"}`}>{opt.label}</span>
            <span className="text-xs text-white/40 leading-tight">{opt.sublabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function YesNoQuestion({ title, desc, value, onChange, recommended, extraWhenYes }: {
  title: string; desc: string; value: boolean;
  onChange: (v: boolean) => void; recommended: boolean;
  extraWhenYes?: React.ReactNode;
}) {
  return (
    <div className="bg-[#0d1530] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="font-semibold text-white text-sm flex-1">{title}</p>
        {recommended && <span className="text-xs bg-[#d4af37]/15 text-[#d4af37] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">⭐ Recommended</span>}
      </div>
      <p className="text-xs text-white/50 mb-4 leading-relaxed">{desc}</p>
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map(v => (
          <button key={String(v)} onClick={() => onChange(v)}
            className={`py-2.5 rounded-lg border font-semibold text-sm transition-all ${value === v ? (v ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]" : "border-red-500/40 bg-red-500/10 text-red-400") : "border-white/10 text-white/60 hover:border-white/30"}`}>
            {v ? "✓ Yes, include it" : "✗ No thanks"}
          </button>
        ))}
      </div>
      {value && extraWhenYes && <div className="mt-4 pt-4 border-t border-white/10">{extraWhenYes}</div>}
    </div>
  );
}

function DeductiblePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-xs text-white/50 mb-2">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {(["$250", "$500", "$1000"] as const).map(d => (
          <button key={d} onClick={() => onChange(d)}
            className={`text-sm py-2 rounded-lg border transition-all ${value === d ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] font-semibold" : "border-white/10 text-white/60 hover:border-white/30"}`}>
            {d}{d === "$500" ? " ⭐" : ""}
          </button>
        ))}
      </div>
      <p className="text-xs text-white/30 mt-1.5">Lower deductible = higher premium. $500 is the sweet spot for most people.</p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}
