// ============================================================================
// KREZOEMA — Helper Kode Pos dan Wilayah Indonesia
// ============================================================================

import { cariWilayah, type WilayahEntry } from "@/data/kodepos";

export type { WilayahEntry };
export { cariWilayah };

/**
 * Format string gabungan wilayah untuk tampilan ringkas
 */
export function formatWilayah(entry: WilayahEntry): string {
  return `${entry.kelurahan}, Kec. ${entry.kecamatan}, ${entry.kabupatenKota}, ${entry.provinsi}`;
}

/**
 * Validasi apakah kode pos merupakan 5 digit angka Indonesia
 */
export function isValidKodePos(kodePos: string): boolean {
  return /^\d{5}$/.test(kodePos.trim());
}
