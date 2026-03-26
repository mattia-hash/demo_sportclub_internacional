import { resolveCustomer } from "@/data/customers";

export function buildOffersRequestBody(customerId: string) {
  const customer = resolveCustomer(customerId);
  return {
    channel: "Web" as const,
    subject_id: customer.id,
  };
}
