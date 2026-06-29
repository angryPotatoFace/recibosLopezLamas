import { money } from "./helpers";
import type { ExpenseReceipt } from "./interfaz";

export function parseAccountStatementAmount(value: string | number | "") {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value || "").trim();
  if (!raw) return 0;

  const cleaned = raw
    .replace(/\$/g, "")
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized = cleaned;

  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(",", ".");
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatAccountStatementAmount(value: string | number | "") {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }

  return money(typeof value === "number" ? value : parseAccountStatementAmount(value)) || "$ 0,00";
}

export function isZeroAccountStatementAmount(value: string | number | "") {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed && value !== 0) return true;
  return parseAccountStatementAmount(value) === 0;
}

export function getReceiptStatusView(receipt: ExpenseReceipt) {
  const statement = receipt.accountStatement;

  return {
    monthlyConcepts: statement.monthlyConcepts.filter(
      (item) => item.description.trim() || item.amount.trim(),
    ),
    historicDebt: statement.historicDebt,
    interest: statement.interest,
    totalToPay: statement.totalToPay,
    paymentMade: statement.paymentMade,
    difference: statement.difference,
    debtIsZero: isZeroAccountStatementAmount(statement.historicDebt),
    differenceIsZero: isZeroAccountStatementAmount(statement.difference),
  };
}
