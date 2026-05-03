export interface CsvPaymentRow {
  address: string;
  amount: string;
  mint: string;
  note?: string;
}

export type PaymentRowStatus =
  | { state: "pending" }
  | { state: "sending" }
  | { state: "sent"; signature: string }
  | { state: "error"; error: string };

export interface PaymentBatchRow extends CsvPaymentRow {
  index: number;
  status: PaymentRowStatus;
}

export interface ComplianceGrant {
  auditorAddress: string;
  treasurerAddress: string;
  nonce: string;
  issuedAt: number;
  label?: string;
}

export interface AuditTransaction {
  signature: string;
  timestamp: number;
  amount: bigint;
  mint: string;
  recipient: string;
  type: "send" | "receive" | "withdraw" | "deposit";
}

export type RegistrationStatus =
  | "unknown"
  | "unregistered"
  | "partial"
  | "registered";
