/** Hardcoded demo customers (URL `customer_id` -> display + upstream `subject_id`). */
export type CustomerProfile = {
  id: string;
  displayName: string;
  /** Sent as `subject_id` in the offers POST body */
  subjectId: string;
};

const HARDCODED: Record<string, CustomerProfile> = {
  "1": { id: "1", displayName: "Customer 1", subjectId: "CUST001" },
  "2": { id: "2", displayName: "Customer 2", subjectId: "CUST002" },
  "3": { id: "3", displayName: "Customer 3", subjectId: "CUST003" },
};

export function getCustomerById(customerId: string): CustomerProfile | null {
  return HARDCODED[customerId] ?? null;
}

/** Fixed default when URL has missing/unknown `customer_id`. */
export function getDefaultCustomer(): CustomerProfile {
  return HARDCODED["1"];
}

/** Resolve only from hardcoded set; unknown values fallback to fixed default. */
export function resolveCustomer(customerId: string): CustomerProfile {
  return getCustomerById(customerId) ?? getDefaultCustomer();
}
