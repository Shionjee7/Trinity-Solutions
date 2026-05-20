# CLAUDE.md — Trinity Solutions Project Context

> This file is read by Claude Code at the start of every session.
> It captures **what we're building, why, and how**, so a fresh agent has
> full context without re-asking the user.

---

## 1. Who this is for

**Trinity Solutions LLC** (DBA: TAJBIZ LLC) — an independent insurance agency
based in **Glen Allen, Virginia** serving clients since 2009.

- **Owner / Agency Principal:** Abhi Thakar (PMP®, LSSmBB, SAFe®, Notary Public, Tax Preparer)
- **Senior Partner:** Nirmit Patel
- **Office:** 5348 Twin Hickory Road, Glen Allen, VA 23059
- **Phones:** (804) 944-6226 · (413) 579-2769
- **Email:** info@taj-biz.com · tajbizllc@gmail.com
- **WhatsApp:** +1 (804) 944-6226
- **Current website:** https://taj-biz.com (built on GoDaddy — being replaced)
- **Existing intake form (Vercel):** https://trinity-intake-olive.vercel.app
- **Socials:** facebook.com/TrinitySolutions99, instagram.com/TrinitySolutions99, linkedin.com/in/abhi-thakar

---

## 2. The goal

Replace the GoDaddy site with a **modern, fast, self-hosted Next.js site** that:

1. **Looks professional** (current site is dated and cluttered)
2. **Makes it dead-simple for clients to get a quote** — no insurance jargon
3. **Captures leads better** via an AI-powered intake wizard that reads
   uploaded policies automatically
4. **Gives the agents a clean dashboard** to see all submissions
5. **Costs nothing to run** — everything on the owner's Proxmox server.
   The only paid external service is the Anthropic Claude API for PDF
   extraction (estimated $5–20/month at expected volume).

---

## 3. Architecture — fully self-hosted on Proxmox

```
Owner's Proxmox box (in their home/office)
│
├── LXC Container 1 — PocketBase
│   • SQLite database
│   • File storage (policy PDFs, driver's license uploads)
│   • Admin UI at :8090/_/
│   • Exposed publicly as api.taj-biz.com via Caddy + Cloudflare
│
├── LXC Container 2 — Next.js app
│   • `npm start` on :3000
│   • Caddy reverse proxy → taj-biz.com (auto-HTTPS via Cloudflare)
│   • Talks to PocketBase over local network
│   • Talks to Anthropic Claude API for PDF reading
│
└── Cloudflare (free tier) in front for HTTPS + DDoS

External:
└── Anthropic Claude API (claude-haiku-4-5-20251001) for policy extraction
```

**Why this stack:**
- **PocketBase** instead of Supabase — runs locally, no monthly cost, one
  binary, includes auth/files/realtime/admin UI out of the box.
- **Self-hosted Next.js** instead of Vercel — Vercel is free at low volume
  but the owner wants total control and zero cloud dependencies.
- **Claude Haiku** (NOT Sonnet/Opus) — fastest + cheapest model that can
  read PDFs reliably. Important: extraction route uses
  `claude-haiku-4-5-20251001`.

Full deployment steps are in `DEPLOY.md`. PocketBase collection schema
is in `pocketbase-setup.md`.

---

## 4. The site (what users see)

### Public pages

| Route | Purpose |
|---|---|
| `/` | Landing page — hero, services grid (6 cards + Will & Trust), how it works, agent bios, contact section |
| `/quote` | Multi-step intake wizard (the heart of the lead funnel) |
| `/quote/thanks` | Confirmation + direct call/WhatsApp buttons |

### Agent dashboard (password-protected)

| Route | Purpose |
|---|---|
| `/admin` | Login (single password from `ADMIN_PASSWORD` env var) |
| `/admin/dashboard` | List of all submissions, search by name/phone, status filter, auto-refresh every 10s |
| `/admin/submissions/[id]` | Full client info + AI-extracted policy data + PDF link + WhatsApp button |

### API routes

| Route | Purpose |
|---|---|
| `POST /api/submit` | Receives form data + files, saves to PocketBase, triggers extraction |
| `POST /api/extract` | Sends uploaded PDF to Claude Haiku, parses JSON, saves to record |
| `POST /api/admin/login` | Validates password, sets `admin_session` cookie |
| `GET /api/admin/submissions` | Lists submissions (cookie-auth) |
| `GET /api/admin/submissions/[id]` | Single submission (cookie-auth) |

---

## 5. Landing page — service cards strategy

Each of the 6 service cards on the landing page has **two buttons**:

1. **Gold "Instant Quote" button** → goes directly to the agent's real
   partner platform (Bestow, Ethos, Anthem, etc.) so the client gets an
   immediate quote without waiting for a callback
2. **Outline "Talk to Agent" button** → goes to our internal `/quote` form
   for a personalized callback

### Real partner links currently wired in

| Service | Partner | URL |
|---|---|---|
| Auto/Home | Propeller Insure | `trinitysolutionsins.propeller.insure/axelerator-public/` |
| Health | Anthem BCBS (agency code TrinitySolutions99) | `agentsite.anthem.com/agentsite/ac/TrinitySolutions99` |
| Health (alt) | UnitedHealthcare One (broker AA5274750) | `shop.uhone.com/en/quote/census?brokerid=AA5274750` |
| Life | Ethos (invite 3d18) | `agents.ethoslife.com/invite/3d18` |
| Life (alt) | Bestow (agent 716e1720) | `bestow.com/agents/hgi/?u=716e1720` |
| Business | Bold Penguin | `app.boldpenguin.com/start/tajbizllcdbatrinitysolutions` |
| Workers Comp | SolePro | `app.solepro.com/AgencyProfile/TAJBIZLLCDBATrinitySolutions/...` |
| Travel | GeoBlue (link_id 169813) | `geobluetravelinsurance.com/...` |
| Visitors USA | IMGlobal (imgac 540029) | `producer.imglobal.com/...imgac=540029` |
| Will & Trust | NetLaw | `i.netlaw.com/hze-mbxc` |

**Do not change these without checking with the owner** — they are the
agency's actual referral/affiliate links and account IDs.

---

## 6. The quote wizard (`/quote`) — every step

This is **the most important page on the site**. The owner specifically
asked for a guided experience that handles every scenario and uses
plain English (no insurance jargon).

### Flow

```
1. Contact info
   ├─ First name, last name, email, phone (required)
   ├─ Marital status: Single / Married
   └─ Family members to cover (+/− counter, default 1)

2. Insurance type: Car / Home / Both

3. "Do you have a current policy?"
   ├─ YES → upload PDF/photo (AI reads it)
   └─ NO  → answer simple coverage questions

4a. (if NO + auto) Vehicle info — year/make/model/VIN
4b. (if NO + home) Property info — address, year built, sqft, type

5. Upload IDs — multi-file uploader for ALL drivers/insured.
   Copy adapts based on insurance type (drivers vs. household members).
   Skippable — agent can collect later.

6a. (if NO + auto) Auto coverage questions — see section 7
6b. (if NO + home) Home coverage questions — see section 7

7. Additional notes — free-text textarea for anything the agent
   should know (past accidents, teen driver, pool, business at home,
   bundling questions, etc.)

8. Review screen — full summary + submit button
```

Progress bar across the top + "Step X of N" counter.

### Owner's intent (do NOT change without asking)

- Plain English everywhere: "If you hit somebody…" not "Bodily Injury Liability"
- Every coverage question has a one-line explanation in plain words
- **Our pick is always pre-selected** — the client just confirms or adjusts
- Recommended options have a ⭐ badge
- "Not sure? Leave it blank, your agent will help" wherever a number is asked
- Always show a call/WhatsApp fallback at the bottom

---

## 7. Coverage questions — what they actually ask

These were carefully chosen with plain-English framing. Don't replace
them with technical insurance language.

### Auto (`auto_coverage` step)

| Plain question | Insurance term (don't show this) | Recommended |
|---|---|---|
| If you injure someone in an accident you caused | Bodily Injury Liability | $100k/$300k ⭐ |
| If you damage someone's car or property | Property Damage Liability | $100k ⭐ |
| Fix your own car after an accident? | Collision | Yes + $500 deductible ⭐ |
| Cover theft, hail, fire, hitting an animal? | Comprehensive | Yes + $500 deductible ⭐ |
| Protection if uninsured driver hits you? | Uninsured/Underinsured Motorist | Yes ⭐ |
| Cover your medical bills after any accident? | MedPay | Yes + $5,000 ⭐ |
| Free rental car while yours is in shop? | Rental Reimbursement | Yes ⭐ |
| Roadside help if you break down? | Roadside Assistance | Yes ⭐ |

### Home (`home_coverage` step)

| Plain question | Insurance term | Recommended |
|---|---|---|
| Cost to rebuild your home? | Dwelling (Coverage A) | (blank — agent calculates) |
| Cover furniture, electronics, belongings? | Personal Property (Coverage C) | Yes ⭐ |
| If someone gets hurt on your property and sues | Liability (Coverage E) | $300,000 ⭐ |
| Hotel costs if you have to move out? | Loss of Use (Coverage D) | Yes ⭐ |
| Water backup & sewer overflow damage? | Water Backup endorsement | Yes ⭐ |
| Flood insurance? | NFIP / private flood | No (separate policy, only if needed) |

---

## 8. Tech stack & file layout

- **Framework:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database:** PocketBase (`pocketbase` npm SDK)
- **AI:** `@anthropic-ai/sdk` ≥ 0.30 (needs `document` content type)
- **Model:** `claude-haiku-4-5-20251001` (PDF extraction)
- **Branding:**
  - Navy `#0a0f1e` (background)
  - Gold `#d4af37` (accents/CTAs)
  - White text on navy
  - Font: Inter (Google Fonts)

### Repo structure

```
Trinity-Solutions/
├── CLAUDE.md                       ← you are here
├── DEPLOY.md                       ← full Proxmox deployment guide
├── pocketbase-setup.md             ← PocketBase collection schema
├── .env.local.example              ← required env vars
├── next.config.mjs                 ← NOT .ts (Next 14 doesn't support TS config)
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← root, dark navy bg, Inter font
│   │   ├── globals.css
│   │   ├── page.tsx                ← landing
│   │   ├── quote/
│   │   │   ├── page.tsx            ← the multi-step wizard
│   │   │   └── thanks/page.tsx
│   │   ├── admin/
│   │   │   ├── page.tsx            ← login
│   │   │   ├── dashboard/page.tsx
│   │   │   └── submissions/[id]/page.tsx
│   │   └── api/
│   │       ├── submit/route.ts     ← form handler
│   │       ├── extract/route.ts    ← Claude PDF extraction
│   │       └── admin/...
│   └── lib/
│       └── pocketbase.ts           ← PB client helper
```

### Required env vars

```
NEXT_PUBLIC_PB_URL=https://api.taj-biz.com
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_PASSWORD=...
PB_ADMIN_EMAIL=admin@trinity.local       # PB admin login (server-side)
PB_ADMIN_PASSWORD=...                    # PB admin password (server-side)
```

---

## 9. PocketBase `submissions` collection schema

| Field | Type | Notes |
|---|---|---|
| first_name | text | required |
| last_name | text | required |
| email | email | required |
| phone | text | required |
| marital_status | text | "single" \| "married" |
| family_members | number | how many people to cover |
| insurance_type | text | "auto" \| "home" \| "both" |
| has_policy | bool | did they upload an existing policy? |
| status | text | "pending" \| "processing" \| "complete" |
| policy_file | file | uploaded PDF (if has_policy) |
| id_documents | file (multiple) | driver's licenses / IDs |
| vehicle_info | json | year/make/model/VIN |
| property_info | json | address/year/sqft/type |
| auto_coverage | json | selections from the wizard |
| home_coverage | json | selections from the wizard |
| additional_notes | text | open client comments |
| extracted_data | json | Claude's parsed policy data |
| submitted_at | date | auto |

---

## 10. Branch & deployment

- **Working branch:** `claude/build-landing-page-nwMrg`
- **Repo:** `Shionjee7/Trinity-Solutions`
- **Always commit and push** changes to the working branch
- **Never push to main without explicit permission**
- **Production target:** Proxmox containers (see `DEPLOY.md`).
  No Vercel, no AWS, no cloud DB. Anthropic API is the only external
  dependency.

---

## 11. Things to NOT do

- ❌ Don't add Supabase, Firebase, Vercel-specific code, or any other
  cloud-locked dependencies. Everything must run on Proxmox.
- ❌ Don't replace plain-English coverage questions with insurance jargon.
- ❌ Don't change the real partner URLs / account IDs / referral codes
  in section 5 without asking.
- ❌ Don't use Claude Opus or Sonnet for extraction — Haiku is plenty
  and the owner is cost-sensitive.
- ❌ Don't add analytics, tracking pixels, or third-party scripts without
  asking. Privacy matters for an insurance client.
- ❌ Don't generate planning docs or "design notes" files unless asked.
  Work from this CLAUDE.md and conversation context.

---

## 12. Things to DO

- ✅ When adding features, keep the navy/gold theme consistent.
- ✅ Test that `npm run build` passes before pushing.
- ✅ Keep the wizard short and skippable — every extra required field
  loses leads.
- ✅ Always show a phone + WhatsApp fallback near the bottom of any
  form/page. Some clients prefer talking to a human.
- ✅ For new insurance products (e.g. if the owner adds another line
  later), follow the same pattern: instant-quote partner link + agent
  callback option.
