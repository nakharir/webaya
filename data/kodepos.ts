// ============================================================================
// KREZOEMA — Database Kode Pos dan Wilayah Indonesia
// Sumber Data: Permendagri No. 137 Tahun 2017 & PT Pos Indonesia
// Cakupan: Seluruh Provinsi, Kabupaten/Kota, Kecamatan, dan Kelurahan/Desa di Indonesia
// ============================================================================

import kodeposRaw from "./kodepos_data.json";

export interface WilayahEntry {
  provinsi: string;
  kabupatenKota: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
}

const kodeposMap = kodeposRaw as unknown as Record<string, [string, string, string, string][]>;

/**
 * Mencari data wilayah berdasarkan kode pos 5 digit Indonesia.
 * Mengembalikan array WilayahEntry (bisa lebih dari satu jika kode pos mencakup
 * beberapa kelurahan/desa).
 *
 * @param kodePos - Kode pos 5 digit
 * @returns Array of WilayahEntry
 */
export function cariWilayah(kodePos: string): WilayahEntry[] {
  if (!kodePos) return [];
  const cleaned = kodePos.trim();
  if (!/^\d{5}$/.test(cleaned)) return [];

  const items = kodeposMap[cleaned];
  if (!items || !Array.isArray(items)) return [];

  return items.map(([provinsi, kabupatenKota, kecamatan, kelurahan]) => ({
    provinsi,
    kabupatenKota,
    kecamatan,
    kelurahan,
    kodePos: cleaned,
  }));
}
