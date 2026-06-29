import type {
  AdministrationSettings,
  Consortium,
  ExpenseReceipt,
  Owner,
  Unit,
} from "./interfaz";
import AccountStatusCard from "./consortium-preview/AccountStatusCard";
import AdministrationInfoCard from "./consortium-preview/AdministrationInfoCard";
import ConsortiumInfoCard from "./consortium-preview/ConsortiumInfoCard";
import ContactFooter from "./consortium-preview/ContactFooter";
import FinalStatusCard from "./consortium-preview/FinalStatusCard";
import QRSection from "./consortium-preview/QRSection";
import ReceiptHeader from "./consortium-preview/ReceiptHeader";
import SignatureSection from "./consortium-preview/SignatureSection";
import UnitInfoCard from "./consortium-preview/UnitInfoCard";
import ValidationBadge from "./consortium-preview/ValidationBadge";

function ReceiptPage({
  administration,
  consortium,
  unit,
  owner,
  receipt,
}: {
  administration: AdministrationSettings;
  consortium?: Consortium;
  unit?: Unit;
  owner?: Owner;
  receipt: ExpenseReceipt;
}) {
  return (
    <div className="receipt-print-container mx-auto w-full max-w-[860px] space-y-4 rounded-[28px] bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_26%,#f8fafc_100%)] p-4 text-slate-900 shadow-[0_18px_60px_rgba(7,59,83,0.08)] print:min-h-[297mm] print:max-w-[190mm] print:space-y-3 print:rounded-none print:bg-white print:p-0 print:shadow-none">
      <ReceiptHeader
        administration={administration}
        consortium={consortium}
        receipt={receipt}
      />

      <div className="grid gap-4 print:gap-3 md:grid-cols-2">
        <ConsortiumInfoCard consortium={consortium} />
        <AdministrationInfoCard administration={administration} />
      </div>

      <UnitInfoCard
        consortium={consortium}
        unit={unit}
        owner={owner}
        receipt={receipt}
      />

      <div className="grid gap-4 print:gap-3 lg:grid-cols-[1.45fr_0.82fr] lg:items-stretch">
        <AccountStatusCard receipt={receipt} />
        <FinalStatusCard hasDebt={receipt.poseeDeuda} />
      </div>

      <QRSection consortium={consortium} />

      <div className="grid gap-4 print:gap-3 lg:grid-cols-[1fr_0.86fr_1.18fr] lg:items-stretch">
        <SignatureSection administration={administration} />
        <ValidationBadge />
        <ContactFooter administration={administration} />
      </div>
    </div>
  );
}

export default function ConsortiumReceiptPreview({
  administration,
  consortium,
  unit,
  owner,
  receipt,
}: {
  administration: AdministrationSettings;
  consortium?: Consortium;
  unit?: Unit;
  owner?: Owner;
  receipt: ExpenseReceipt;
}) {
  return (
    <div className="mx-auto w-full max-w-[880px]">
      <ReceiptPage
        administration={administration}
        consortium={consortium}
        unit={unit}
        owner={owner}
        receipt={receipt}
      />
    </div>
  );
}
