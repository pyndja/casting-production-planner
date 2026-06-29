import type { Product, Routing, Som } from "@/lib/types";
import { PRODUCTS } from "./products";
import { ROUTINGS } from "./routings";
import { SOMS } from "./soms";

export { PRODUCTS, ROUTINGS, SOMS };

export const PRODUCT_MAP: Map<string, Product> = new Map(
  PRODUCTS.map((p) => [p.id, p]),
);

export function getProduct(id: string): Product | undefined {
  return PRODUCT_MAP.get(id);
}

export function getRouting(id: string): Routing | undefined {
  return ROUTINGS.find((r) => r.id === id);
}

export function getRoutingForProduct(product: Product): Routing | undefined {
  return getRouting(product.routingId);
}

export function getSom(id: string): Som | undefined {
  return SOMS.find((s) => s.id === id);
}
