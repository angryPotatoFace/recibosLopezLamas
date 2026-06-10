import type { Consortium, ExpenseReceipt, Owner, Unit } from "../interfaz";
import { HomeIcon } from "./icons";
import SectionCard from "./SectionCard";

function Cell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-sm font-semibold text-slate-800">{label}</div>
      <div className="mt-2 break-words text-sm text-slate-700 md:text-[15px]">{value || " "}</div>
    </div>
  );
}

export default function UnitInfoCard({
  consortium,
  unit,
  owner,
  receipt,
}: {
  consortium?: Consortium;
  unit?: Unit;
  owner?: Owner;
  receipt: ExpenseReceipt;
}) {
  return (
    <SectionCard
      title="Datos de la Unidad"
      icon={<HomeIcon />}
      accent="gold"
    >
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_1fr]">
        <div className="space-y-4">
          <Cell label="Propietario / Inquilino:" value={owner?.nombre || " "} />
          <Cell label="CUIT / DNI:" value={owner?.cuitDni || " "} />
        </div>

        <div className="grid gap-4 border-y border-slate-200 py-4 lg:border-x lg:border-y-0 lg:px-4 lg:py-0">
          <Cell label="Unidad Funcional:" value={unit?.numeroUF || " "} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Cell label="Piso:" value={unit?.piso || " "} />
            <Cell label="Departamento:" value={unit?.departamento || " "} />
          </div>
        </div>

        <div className="space-y-4">
          <Cell
            label="Direccion de la unidad:"
            value={
              consortium?.direccion
                ? `${consortium.direccion}${consortium.localidad ? `, ${consortium.localidad}` : ""}`
                : " "
            }
          />
          <Cell label="Periodo abonado:" value={receipt.period || " "} />
        </div>
      </div>
    </SectionCard>
  );
}
