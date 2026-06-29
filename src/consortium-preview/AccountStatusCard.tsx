import type { ExpenseReceipt } from "../interfaz";
import {
  formatAccountStatementAmount,
  getReceiptStatusView,
} from "../consortiumReceiptView";
import { MetricRow } from "./InfoRows";
import { WalletIcon } from "./icons";
import SectionCard from "./SectionCard";

function StatementDivider() {
  return <div className="my-4 border-t border-slate-200 pt-4 print:my-3 print:pt-3" />;
}

export default function AccountStatusCard({
  receipt,
}: {
  receipt: ExpenseReceipt;
}) {
  const statusView = getReceiptStatusView(receipt);

  return (
    <SectionCard title="Estado de Cuenta" icon={<WalletIcon />} className="h-full">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#083d55]">
          Conceptos del mes
        </div>
        {statusView.monthlyConcepts.length > 0 ? (
          statusView.monthlyConcepts.map((concept) => (
            <MetricRow
              key={concept.id}
              label={concept.description || "Concepto"}
              value={formatAccountStatementAmount(concept.amount)}
            />
          ))
        ) : (
          <MetricRow label="Sin conceptos cargados" value="$ 0,00" />
        )}
      </div>

      <StatementDivider />

      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#083d55]">
          Historico
        </div>
        <MetricRow
          label="Deuda"
          value={formatAccountStatementAmount(statusView.historicDebt)}
          tone={statusView.debtIsZero ? "default" : "negative"}
        />
        <MetricRow
          label="Intereses"
          value={formatAccountStatementAmount(statusView.interest)}
        />
      </div>

      <StatementDivider />

      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#083d55]">
          Total a pagar
        </div>
        <MetricRow
          label="Total a pagar"
          value={formatAccountStatementAmount(statusView.totalToPay)}
        />
      </div>

      <StatementDivider />

      <div className="space-y-1">
        <MetricRow
          label="Pago realizado"
          value={formatAccountStatementAmount(statusView.paymentMade)}
        />
        <MetricRow
          label="Diferencia"
          value={formatAccountStatementAmount(statusView.difference)}
          tone={statusView.differenceIsZero ? "positive" : "negative"}
        />
      </div>
    </SectionCard>
  );
}
