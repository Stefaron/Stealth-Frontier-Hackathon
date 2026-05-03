import Papa from "papaparse";
import type { CsvPaymentRow } from "./types";

export function parseCsvPayments(file: File): Promise<CsvPaymentRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvPaymentRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const rows = results.data.filter(
          (r) => r.address?.trim() && r.amount?.trim()
        );
        resolve(rows);
      },
      error: (err) => reject(err),
    });
  });
}

export function generateCsvTemplate(): string {
  const headers = ["address", "amount", "mint", "note"];
  const example = [
    "8xH3kJLmV9aQ2WNrYz4XUPD...",
    "100.00",
    "USDC",
    "Q1 2025 salary",
  ];
  return [headers.join(","), example.join(",")].join("\n");
}

export function exportAuditCsv(
  rows: Array<{
    signature: string;
    timestamp: number;
    amount: string;
    mint: string;
    recipient: string;
    type: string;
  }>
): string {
  const headers = ["signature", "timestamp", "amount", "mint", "recipient", "type"];
  const lines = rows.map((r) =>
    [
      r.signature,
      new Date(r.timestamp).toISOString(),
      r.amount,
      r.mint,
      r.recipient,
      r.type,
    ].join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}
