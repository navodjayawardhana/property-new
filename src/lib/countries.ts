import { countries, getEmojiFlag } from "countries-list";

export type CountryEntry = { code: string; name: string; dial: string; flag: string };

export const COUNTRY_CODES: CountryEntry[] = Object.entries(countries)
  .map(([code, c]) => ({
    code,
    name: c.name,
    dial: `+${c.phone[0]}`,
    flag: getEmojiFlag(code as Parameters<typeof getEmojiFlag>[0]),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Match the dial code prefix in a full phone string (longest match first to avoid +1 eating +12x)
export function parsePhone(phone: string): { dialCode: string; number: string } {
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
  const match = sorted.find((c) => phone.startsWith(c.dial));
  return match
    ? { dialCode: match.dial, number: phone.slice(match.dial.length) }
    : { dialCode: "+61", number: phone };
}
