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
  description_raw: string;
  description_structured: Record<string, any>;
  created_at?: string;
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

// Proposal Types — ProposalInput sends the parsed AI object as `parsed`
export interface ProposalInput {
  rfp_id: number;
  vendor_id: number;
  raw_email: string;
  parsed?: ParsedProposal; // matches backend field `parsed`
}

export interface Proposal {
  id: number;
  rfp_id: number;
  vendor_id: number;
  vendor_name?: string;
  vendor_email?: string;
  raw_email: string;
  parsed: ParsedProposal | null;
  created_at?: string;
}

/**
 * Matches the actual AI output from parseProposal.js / parseVendorProposal.js.
 * Field names must match the LLM extraction schema.
 */
export interface ParsedProposal {
  item_prices: Array<{ item: string; price: number }>;
  total_cost: number;
  delivery_time: string;
  terms: string;
  conditions: string;
}

// Email Types
export interface EmailInput {
  rfpId: number;
  vendorIds: number[];
}

// Comparison Type — `scores` (plural) matches backend response
export interface ComparisonResult {
  recommendation?: string;
  ranking?: string[];
  scores?: Record<string, number>;
  summary?: string;
  [key: string]: any;
}
