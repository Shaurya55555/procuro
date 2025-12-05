// RFP Types
export interface RfpInput {
  title: string;
  budget: string;
  items: string[];
  delivery_timeline: string;
  payment_terms: string;
  warranty: string;
}

export interface Rfp extends RfpInput {
  id: number;
}

export interface StructuredRfp extends RfpInput {}

// Vendor Types
export interface Vendor {
  id: number;
  name: string;
  email: string;
  contact_person?: string;
}

export interface VendorInput {
  name: string;
  email: string;
  contact_person?: string;
}

// Proposal Types
export interface ProposalInput {
  rfp_id: number;
  vendor_id: number;
  raw_email: string;
  parsed_data?: ParsedProposal; // Optional because API might parse internally or we pass it
}

export interface Proposal {
  id: number;
  rfp_id: number;
  vendor_id: number;
  raw_email: string;
  parsed: ParsedProposal;
}

export interface ParsedProposal {
  items: string[];
  price: string;
  delivery_timeline: string;
  warranty: string;
  payment_terms: string;
}

// Email Types
export interface EmailInput {
  rfpId: number;
  vendorIds: number[];
}

// Comparison Type (Generic object as per swagger, but we structure it for UI)
export interface ComparisonResult {
  recommendation?: string;
  score?: Record<string, number>;
  summary?: string;
  [key: string]: any;
}
