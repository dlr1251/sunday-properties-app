import { SUNNY_PRIVATE_COLUMNS } from '../../src/lib/sunny/listing-columns';
import {
  assertNoPrivateListingFields,
  publicSunnyListingHits,
  type SunnyListingHit,
} from '../../src/lib/sunny/listing-hit';

const PRIVATE_KEY_SET = new Set<string>(SUNNY_PRIVATE_COLUMNS);

export function leakedPrivateKeys(value: unknown, found: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) leakedPrivateKeys(item, found);
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (PRIVATE_KEY_SET.has(key) && nested != null) found.push(key);
    leakedPrivateKeys(nested, found);
  }
  return found;
}

export function assertPublicToolPayload(value: unknown): void {
  const leaked = leakedPrivateKeys(value);
  if (leaked.length) {
    throw new Error(`Refusing to return private listing fields: ${[...new Set(leaked)].join(', ')}`);
  }
}

export function publicListings(raw: unknown): SunnyListingHit[] {
  const hits = publicSunnyListingHits(raw);
  for (const hit of hits) {
    const leaked = assertNoPrivateListingFields(hit as unknown as Record<string, unknown>);
    if (leaked.length) {
      throw new Error(`Listing ${hit.id} still carries private fields: ${leaked.join(', ')}`);
    }
  }
  assertPublicToolPayload(hits);
  return hits;
}
