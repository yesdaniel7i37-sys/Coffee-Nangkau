// Jumlah meja di kedai. Ubah angka ini kalau jumlah meja berbeda.
export const TABLE_COUNT = 12;

export const SERVICE_TYPES = ["DINE_IN", "TAKEAWAY"];
export const SERVICE_LABEL = {
  DINE_IN: "Makan/Minum di Tempat",
  TAKEAWAY: "Take Away",
};
export const tables = Array.from({ length: TABLE_COUNT }, (_, i) => i + 1);

export const isValidTable = (n) => Number.isInteger(n) && n >= 1 && n <= TABLE_COUNT;
