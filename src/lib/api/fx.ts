import { z } from "zod";
import { apiClient } from "./client";

export const FxRatesSchema = z.object({
  creditsPerUsd: z.number(),
  usdPerCredit: z.number().nullable(),
});

export type FxRates = z.infer<typeof FxRatesSchema>;

/**
 * Current credit ↔ USD conversion (gateway caches the rate for 3 hours).
 * 1 Cr = ₹1, so creditsPerUsd ≈ the live INR per USD.
 */
export async function getFxRates(): Promise<FxRates> {
  const response = await apiClient.get<unknown>("/v1/fx/rates");
  return FxRatesSchema.parse(response.data);
}
