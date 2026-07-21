import React from "react";
import { Globe, Map, Building2, Mail, MapPinned, Phone, BadgeCheck, MapPin } from "lucide-react";
import { DataGrid } from "./SectionCard";

export interface LocationData {
  country?: string | null;
  countryCode?: string | null;
  phoneCode?: string | null;
  state?: string | null;
  city?: string | null;
  postalCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  address?: string | null;
}

const getCountryFlag = (countryCode: string | null | undefined) => {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  if (code.length !== 2) return null;
  const flagOffset = 0x1F1E6;
  const asciiOffset = 0x41;
  return String.fromCodePoint(
    code.charCodeAt(0) - asciiOffset + flagOffset,
    code.charCodeAt(1) - asciiOffset + flagOffset
  );
};

function LocationField({ icon: Icon, label, value, fullWidth = false }: { icon: any, label: string, value?: React.ReactNode, fullWidth?: boolean }) {
  const displayValue = !value || value === "" ? "Not Provided" : value;
  return (
    <div className={fullWidth ? "md:col-span-full" : ""}>
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="font-medium text-slate-900 flex items-center gap-2">{displayValue}</p>
    </div>
  );
}

export function LocationSection({ location, className = "" }: { location: LocationData, className?: string }) {
  const address = location.address || [
    location.addressLine1,
    location.addressLine2,
    location.city,
    location.state,
    location.postalCode,
    location.country
  ].filter(Boolean).join(", ");

  return (
    <div className={`md:col-span-full pt-6 mt-6 border-t border-slate-100 ${className}`}>
      <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-slate-400" /> Location Information
      </h4>
      <DataGrid>
        <LocationField icon={Globe} label="Country" value={location.country ? <>{getCountryFlag(location.countryCode)} {location.country}</> : null} />
        <LocationField icon={BadgeCheck} label="ISO Code" value={location.countryCode} />
        <LocationField icon={Phone} label="Phone Code" value={location.phoneCode} />
        <LocationField icon={Map} label="State" value={location.state} />
        <LocationField icon={Building2} label="City" value={location.city} />
        <LocationField icon={Mail} label="Postal Code" value={location.postalCode} />
        <LocationField icon={MapPinned} label="Address" value={address} fullWidth />
      </DataGrid>
    </div>
  );
}
