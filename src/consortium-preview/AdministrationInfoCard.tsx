import type { AdministrationSettings } from "../interfaz";
import { InfoRow } from "./InfoRows";
import { UserIcon } from "./icons";
import SectionCard from "./SectionCard";

export default function AdministrationInfoCard({
  administration,
}: {
  administration: AdministrationSettings;
}) {
  return (
    <SectionCard title="Datos de la Administracion" icon={<UserIcon />}>
      <div className="space-y-4">
        <InfoRow label="Administracion:" value={administration.razonSocial || " "} />
        <InfoRow label="CUIT:" value={administration.cuit || " "} />
        <InfoRow label="RPA:" value={administration.rpa || " "} />
      </div>
    </SectionCard>
  );
}
