import { money } from "../helpers";
import type { ExpenseReceipt } from "../interfaz";
import { getReceiptStatusView } from "../consortiumReceiptView";
import { MetricRow } from "./InfoRows";
import { WalletIcon } from "./icons";
import SectionCard from "./SectionCard";
import ConceptsTable from "./ConceptsTable";

export default function AccountStatusCard({
  receipt,
}: {
  receipt: ExpenseReceipt;
}) {
  const statusView = getReceiptStatusView(receipt);

  return (
    <SectionCard title="Estado de Cuenta" icon={<WalletIcon />} className="h-full">
      <div className="space-y-1">
        <MetricRow label="Saldo anterior" value={money(receipt.accountStatus.saldoAnterior)} />
        <MetricRow
          label="Deuda"
          value={money(statusView.debt)}
          tone={statusView.debt > 0 ? "negative" : "default"}
        />
        <MetricRow label="Intereses" value={money(statusView.interests)} />
      </div>

      <div className="my-4 border-t border-slate-200 pt-4">
        <MetricRow label="Pago realizado" value={money(statusView.paidTotal)} />
        <MetricRow
          label="Diferencia"
          value={money(statusView.difference)}
          tone={statusView.difference > 0 ? "negative" : "positive"}
        />
      </div>

      <ConceptsTable concepts={receipt.concepts} />

    </SectionCard>
  );
}
