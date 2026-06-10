import type { ReactNode } from "react";
import type { AdministrationSettings } from "../interfaz";
import { GlobeIcon, MailIcon, MapPinIcon, PhoneIcon } from "./icons";

function ContactLine({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[15px] text-slate-700">
      <span className="text-[#083d55]">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function ContactFooter({
  administration,
}: {
  administration: AdministrationSettings;
}) {
  return (
    <footer className="footer-section receipt-section grid gap-5 rounded-[24px] bg-gradient-to-r from-[#073b53] via-[#0d4960] to-[#083d55] px-5 py-5 text-white print:break-inside-avoid print:rounded-[14px] print:px-4 print:py-3 print:shadow-none lg:grid-cols-[1fr_auto_1fr]">
      <div className="flex items-end text-base italic text-[#d8b468] print:text-sm md:text-lg">
        Gestion profesional, consorcios en armonia.
      </div>

      <div className="flex items-center justify-center">
        {administration.website ? (
          <div className="text-lg font-semibold print:text-base md:text-xl">{administration.website}</div>
        ) : null}
      </div>

      <div>
        <div className="text-base font-semibold uppercase tracking-wide print:text-sm md:text-lg">Canales de contacto</div>
        <div className="mt-4 space-y-3">
          <ContactLine icon={<PhoneIcon />} text={administration.telefono || " "} />
          <ContactLine icon={<MailIcon />} text={administration.email || " "} />
          <ContactLine icon={<MapPinIcon />} text={administration.direccion || " "} />
          {administration.website ? (
            <ContactLine icon={<GlobeIcon />} text={administration.website} />
          ) : null}
        </div>
      </div>
    </footer>
  );
}
