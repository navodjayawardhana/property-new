import type { Property } from '@/lib/api';

const KEY = 'gb_saved_props';

function load(): Property[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); }
  catch { return []; }
}

export function getSaved(): Property[] { return load(); }

export function isSaved(id: number): boolean {
  return load().some((p) => p.id === id);
}

export function toggleSaved(property: Property): boolean {
  const list = load();
  const idx = list.findIndex((p) => p.id === property.id);
  if (idx >= 0) {
    list.splice(idx, 1);
    localStorage.setItem(KEY, JSON.stringify(list));
    return false;
  }
  list.push(property);
  localStorage.setItem(KEY, JSON.stringify(list));
  return true;
}
