import type { Consortium } from "../interfaz";
import { InfoRow } from "./InfoRows";
import { BuildingIcon } from "./icons";
import SectionCard from "./SectionCard";

export default function ConsortiumInfoCard({
  consortium,
}: {
  consortium?: Consortium;
}) {
  return (
    <SectionCard title="Datos del Consorcio" icon={<BuildingIcon />}>
      <div className="space-y-4">
        <InfoRow label="Nombre del consorcio:" value={consortium?.nombre || " "} />
        <InfoRow
          label="Direccion:"
          value={
            consortium?.direccion
              ? `${consortium.direccion}${consortium.localidad ? `, ${consortium.localidad}` : ""}`
              : " "
          }
        />
        <InfoRow label="CUIT:" value={consortium?.cuit || " "} />
      </div>
    </SectionCard>
  );
}
