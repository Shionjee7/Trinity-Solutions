import PocketBase from "pocketbase";

const PB_URL = process.env.NEXT_PUBLIC_PB_URL || "https://api.taj-biz.com";

// Server-side: new instance per request to avoid shared state
export function createPocketBase() {
  return new PocketBase(PB_URL);
}

// Client-side singleton
let clientPb: PocketBase | null = null;
export function getClientPocketBase() {
  if (!clientPb) {
    clientPb = new PocketBase(PB_URL);
  }
  return clientPb;
}

export type SubmissionRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  insurance_type: "auto" | "home" | "both";
  status: "pending" | "processing" | "complete";
  policy_file: string;
  extracted_data: ExtractedPolicyData | null;
  submitted_at: string;
  created: string;
  updated: string;
  collectionId: string;
  collectionName: string;
};

export type ExtractedPolicyData = {
  carrier?: string;
  policy_number?: string;
  premiums?: {
    total?: string;
    breakdown?: Record<string, string>;
  };
  coverage_limits?: Record<string, string>;
  deductibles?: Record<string, string>;
  vehicles?: Array<{
    year?: string;
    make?: string;
    model?: string;
    vin?: string;
  }>;
  drivers?: Array<{
    name?: string;
    dob?: string;
    license?: string;
  }>;
  mortgagee?: {
    name?: string;
    address?: string;
  };
  discounts?: string[];
  policy_period?: {
    start?: string;
    end?: string;
  };
  raw_notes?: string;
};
