import type { ExpenseReceipt } from "./interfaz";

export function getReceiptInterests(receipt: ExpenseReceipt) {
  return receipt.concepts
    .filter((item) => item.description.toLowerCase().includes("interes"))
    .reduce((total, item) => total + Number(item.amount || 0), 0);
}

export function getReceiptConceptsSubtotal(receipt: ExpenseReceipt) {
  return receipt.concepts.reduce(
    (total, concept) => total + Number(concept.amount || 0),
    0,
  );
}

export function getReceiptGrossTotal(receipt: ExpenseReceipt) {
  return (
    getReceiptConceptsSubtotal(receipt) +
    Number(receipt.accountStatus.saldoAnterior || 0)
  );
}

export function getReceiptPaidTotal(receipt: ExpenseReceipt) {
  return Number(receipt.accountStatus.pagoRealizado || 0);
}

export function getReceiptDifference(receipt: ExpenseReceipt) {
  return Number(receipt.totalAmount || 0);
}

export function getReceiptStatusView(receipt: ExpenseReceipt) {
  const difference = getReceiptDifference(receipt);

  return {
    clear: difference <= 0,
    difference,
    debt: getReceiptGrossTotal(receipt),
    interests: getReceiptInterests(receipt),
    paidTotal: getReceiptPaidTotal(receipt),
  };
}
