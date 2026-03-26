/** Hardcoded demo customers: URL `customer_id` -> `id` + `displayName`. `id` is sent as `subject_id` in API requests. */
export type CustomerProfile = {
  id: string;
  displayName: string;
};

const HARDCODED: Record<string, CustomerProfile> = {
  "1": { id: "cust001", displayName: "Customer 1" },
  "2": { id: "2", displayName: "Customer 2" },
  "3": { id: "cust003", displayName: "Customer 3" },
  "4": { id: "cust004", displayName: "Customer 4" },
  "5": { id: "cust005", displayName: "Customer 5" },
  "6": { id: "cust006", displayName: "Customer 6" },
  "7": { id: "cust007", displayName: "Customer 7" },
  "8": { id: "cust008", displayName: "Customer 8" },
  "9": { id: "cust009", displayName: "Customer 9" },
  "10": { id: "cust010", displayName: "Customer 10" },
  CUST020: { id: "CUST020", displayName: "Tiago Oliveira" },
  CUST022: { id: "CUST022", displayName: "Camila Ferrari" },
  CUST024: { id: "CUST024", displayName: "Letícia Barbosa" },
  CUST026: { id: "CUST026", displayName: "Ben King" },
  CUST028: { id: "CUST028", displayName: "Rafael Santos" },
  CUST030: { id: "CUST030", displayName: "Chris Adams" },
  CUST031: { id: "CUST031", displayName: "Matt Hill" },
  CUST032: { id: "CUST032", displayName: "Alex Turner" },
};

export function getCustomerById(customerId: string): CustomerProfile | null {
  const key = customerId.trim();
  const direct = HARDCODED[key];
  if (direct) return direct;
  for (const profile of Object.values(HARDCODED)) {
    if (profile.id === key) return profile;
  }
  return null;
}

/** Fixed default when URL has missing/unknown `customer_id`. */
export function getDefaultCustomer(): CustomerProfile {
  return HARDCODED["1"];
}

/** Resolve only from hardcoded set; unknown values fallback to fixed default. */
export function resolveCustomer(customerId: string): CustomerProfile {
  return getCustomerById(customerId) ?? getDefaultCustomer();
}
