import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Globe2,
  QrCode,
  User,
  XCircle,
  Activity,
  ShieldCheck,
  Share2,
  Printer,
  RefreshCw,
  Search,
  BadgeCheck,
  AlertTriangle,
  MapPin,
  Map,
  Tag,
  Briefcase,
  Shield,
  Link as LinkIcon,
  Award,
  CalendarCheck,
  CalendarX,
  CreditCard,
  Hash,
  Phone,
  Mail,
  MapPinned
} from "lucide-react";
import { getCertificateProfile } from "../services/api/directory.api";

export const Route = createFileRoute("/directory/$uuid")({
  component: CertificateProfile,
});

type CertificateProfileData = {
  candidateName?: string;
  organizationName?: string;
  instituteName?: string;
  country?: string;
  countryCode?: string;
  phoneCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  address?: string;
  website?: string;
  credentialId?: string;
  certificateId?: string;
  registrationNumber?: string;
  category?: string;
  applicationType?: string;
  scope?: string;
  issueDate?: string;
  expiryDate?: string;
  status: string;
  standard?: string;
  issuedBy?: string;
  verificationUrl?: string;
  verificationTimestamp?: string;
  qrCode?: string | null;
  hasPdf: boolean;
  certificatePath?: string | null;
};

// --- Helpers ---

const getStatusDetails = (status: string) => {
  const s = (status || "").toUpperCase();
  if (s === "VALID" || s === "ACTIVE") return { color: "bg-green-50 text-green-800 border-[#D1D5DB]", icon: <CheckCircle className="h-4 w-4 mr-1.5 text-green-700" /> };
  if (s === "PENDING") return { color: "bg-orange-50 text-orange-800 border-[#D1D5DB]", icon: <Activity className="h-4 w-4 mr-1.5 text-orange-700" /> };
  if (s === "EXPIRED") return { color: "bg-gray-50 text-gray-800 border-[#D1D5DB]", icon: <AlertTriangle className="h-4 w-4 mr-1.5 text-gray-700" /> };
  if (s === "REVOKED") return { color: "bg-red-50 text-red-800 border-[#D1D5DB]", icon: <XCircle className="h-4 w-4 mr-1.5 text-red-700" /> };
  return { color: "bg-gray-50 text-gray-800 border-[#D1D5DB]", icon: <AlertTriangle className="h-4 w-4 mr-1.5 text-gray-700" /> };
};

// --- Layout Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-[#D1D5DB] rounded-[4px] shadow-sm p-[20px] ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#D1D5DB]">
    <Icon className="h-4 w-4 text-[#C8A04D]" />
    <h3 className="text-[18px] font-bold text-[#123B63]">{title}</h3>
  </div>
);

// --- Sub Components ---

function VerificationHero({ isActive, status }: { isActive: boolean, status: string }) {
  return (
    <div className="relative overflow-hidden bg-[#123B63] border border-[#D1D5DB] rounded-[4px] h-[240px] flex flex-col items-center justify-center text-center p-[24px]">
      {/* Background Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
        <Shield className="w-[200px] h-[200px] text-white" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <Award className="h-10 w-10 text-[#C8A04D] mb-4" />
        
        <h1 className="text-[36px] font-bold text-white tracking-tight mb-2">
          VERIFIED CERTIFICATE
        </h1>
        
        <p className="text-[15px] text-[#F5F7FA] font-medium max-w-2xl mx-auto mb-5 opacity-90">
          This credential has been officially verified and registered with IUCB.
        </p>
        
        <div className="flex justify-center w-full">
          {(() => {
            const { color, icon } = getStatusDetails(status);
            return (
              <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-[4px] text-[13px] font-bold uppercase tracking-wider border ${color} bg-white h-[32px]`}>
                {icon}
                {status}
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
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

function InfoRow({ icon: Icon, label, value, mono, link, isLast, className = "" }: { icon?: any, label: string; value: React.ReactNode; mono?: boolean, link?: boolean, isLast?: boolean, className?: string }) {
  const isStringValue = typeof value === 'string';
  const displayValue = !value || value === "" ? "Not Provided" : value;
  
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center py-3 min-h-[48px] ${!isLast ? 'border-b border-[#D1D5DB]/60' : ''} ${className}`}>
      <div className="flex items-center gap-2 w-full sm:w-[160px] shrink-0 text-gray-500">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-[12px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      {link && isStringValue ? (
        <a href={value as string} target="_blank" rel="noreferrer" className="text-[#123B63] font-medium text-[15px] hover:text-[#C8A04D] hover:underline truncate w-full">
          {displayValue}
        </a>
      ) : (
        <span className={`text-[#123B63] font-medium text-[15px] w-full flex items-center gap-2 ${mono ? "font-mono text-[14px]" : ""}`}>
          {displayValue}
        </span>
      )}
    </div>
  );
}

// --- Main Page Component ---

export default function CertificateProfile() {
  const { uuid } = Route.useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<CertificateProfileData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificateProfile(uuid)
      .then((data) => setProfile(data))
      .catch((err: any) => {
        const status = err?.response?.status;
        setError(
          status === 404
            ? "Certificate Not Found"
            : err?.response?.data?.message || err?.message || "Failed to load certificate.",
        );
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] py-[24px]">
        <div className="max-w-[1200px] mx-auto w-full px-[24px] flex flex-col gap-[24px]">
          <div className="h-[240px] bg-white rounded-[4px] border border-[#D1D5DB] animate-pulse w-full"></div>
          <div className="grid lg:grid-cols-2 gap-[20px] items-start">
            <div className="bg-white rounded-[4px] h-[400px] border border-[#D1D5DB] animate-pulse"></div>
            <div className="bg-white rounded-[4px] h-[400px] border border-[#D1D5DB] animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-[24px]">
        <Card className="max-w-lg w-full text-center">
          <div className="bg-red-50 p-3 rounded-[4px] inline-block mb-4 border border-[#D1D5DB]">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-[24px] font-bold text-[#123B63] mb-3">Certificate Not Found</h2>
          <p className="text-gray-600 text-[15px] mb-6 font-medium">
            {error || "The requested certificate could not be found or may be invalid. Please verify the ID and try again."}
          </p>
          <Link
            to="/directory"
            className="w-full inline-flex items-center justify-center gap-2 px-6 h-[40px] rounded-[4px] bg-[#123B63] text-white text-[14px] font-semibold hover:bg-opacity-90 transition"
          >
            <Search className="h-4 w-4" /> Search Again
          </Link>
        </Card>
      </div>
    );
  }

  const rawStatus = profile.status.toUpperCase();
  const isActive = rawStatus === "ACTIVE" || rawStatus === "VALID";

  const handleDownload = () => window.open(`http://localhost:5000/api/v1/directory/${uuid}/download`, "_blank");
  const handleView    = () => window.open(`http://localhost:5000/api/v1/directory/${uuid}/view`, "_blank");
  const handlePrint   = () => window.print();
  const handleVerify  = () => window.location.reload();
  const handleShare   = () => {
    if (navigator.share) {
      navigator.share({
        title: 'IUCB Verified Certificate',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Verification URL copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#123B63]">
      
      {/* Main Content Container */}
      <div className="max-w-[1200px] mx-auto w-full p-[24px] flex flex-col gap-[24px]">
        
        {/* 1. Hero Section */}
        <VerificationHero isActive={isActive} status={rawStatus} />

        {/* 2. Certificate and Holder Cards (Two Column Grid) */}
        <div className="grid lg:grid-cols-2 gap-[20px]">
          
          {/* InfoCard */}
          <Card className="flex flex-col h-auto self-start">
            <CardHeader icon={FileText} title="Certificate Information" />
            <div className="flex flex-col">
              <InfoRow label="Certificate ID" value={profile.certificateId || "—"} mono />
              <InfoRow label="Credential ID" value={profile.credentialId || "—"} mono />
              <InfoRow label="Registration" value={profile.registrationNumber || "—"} mono />
              <InfoRow label="Issue Date" value={profile.issueDate ? new Date(profile.issueDate).toLocaleDateString() : "—"} />
              <InfoRow label="Expiry Date" value={profile.expiryDate ? new Date(profile.expiryDate).toLocaleDateString() : "—"} />
              {profile.verificationUrl && (
                <InfoRow label="Verification URL" value={profile.verificationUrl} link />
              )}
              {profile.qrCode && (
                <div className="flex flex-col sm:flex-row sm:items-center py-3 min-h-[48px] border-b border-[#D1D5DB]/60">
                   <span className="text-[12px] font-bold uppercase tracking-wider text-gray-500 w-full sm:w-[160px] shrink-0">Scan to Verify</span>
                   <img src={profile.qrCode} alt="Verification QR Code" className="h-[52px] w-[52px] object-contain rounded-[2px] border border-[#D1D5DB] p-1 bg-white" />
                </div>
              )}
            </div>
          </Card>

          {/* HolderCard */}
          <Card className="flex flex-col h-auto self-start">
            <CardHeader icon={User} title="Holder Information" />
            <div className="flex flex-col">
              <InfoRow label="Holder Name" value={profile.candidateName} />
              <InfoRow label="Organization" value={profile.organizationName || profile.instituteName} />
              <InfoRow label="Organization Type" value={profile.category} />
              <InfoRow label="Standard" value={profile.standard} />
              <InfoRow label="Website" value={profile.website} link={!!profile.website} isLast={!profile.scope} />
              {profile.scope && (
                <InfoRow label="Scope" value={profile.scope} isLast />
              )}
            </div>
          </Card>
          
        </div>

        {/* 2.5 Location Card */}
        <Card className="flex flex-col">
          <CardHeader icon={MapPinned} title="Location Information" />
          <div className="grid lg:grid-cols-2 gap-x-[40px] gap-y-0">
            <div className="flex flex-col">
              <InfoRow icon={Globe2} label="Country" value={profile.country ? <>{getCountryFlag(profile.countryCode)} {profile.country}</> : null} />
              <InfoRow icon={BadgeCheck} label="ISO Code" value={profile.countryCode} />
              <InfoRow icon={Phone} label="Phone Code" value={profile.phoneCode} />
              <InfoRow icon={Map} label="State" value={profile.state} isLast className="lg:border-b-0" />
            </div>
            <div className="flex flex-col">
              <InfoRow icon={Building2} label="City" value={profile.city} />
              <InfoRow icon={Mail} label="Postal Code" value={profile.postalCode} />
              <InfoRow icon={MapPinned} label="Address" value={profile.address} isLast />
            </div>
          </div>
        </Card>

        {/* 3. ActionCard */}
        <Card className="flex flex-col">
          <CardHeader icon={Activity} title="Certificate Actions" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[12px] pt-1">
            <button
              onClick={handleView}
              disabled={!profile.hasPdf}
              className="w-full inline-flex items-center justify-center gap-2 h-[40px] rounded-[4px] bg-[#123B63] text-white text-[13px] font-semibold hover:bg-opacity-90 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="h-4 w-4" /> View
            </button>
            <button
              onClick={handleDownload}
              disabled={!profile.hasPdf}
              className="w-full inline-flex items-center justify-center gap-2 h-[40px] rounded-[4px] bg-white border border-[#D1D5DB] text-[#123B63] text-[13px] font-semibold hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" /> Download
            </button>
            <button onClick={handleShare} className="w-full inline-flex items-center justify-center gap-2 h-[40px] rounded-[4px] bg-white border border-[#D1D5DB] text-[#123B63] text-[13px] font-semibold hover:bg-gray-50 transition shadow-sm">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <button onClick={handlePrint} className="w-full inline-flex items-center justify-center gap-2 h-[40px] rounded-[4px] bg-white border border-[#D1D5DB] text-[#123B63] text-[13px] font-semibold hover:bg-gray-50 transition shadow-sm">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={handleVerify} className="w-full inline-flex items-center justify-center gap-2 h-[40px] rounded-[4px] bg-white border border-[#D1D5DB] text-[#123B63] text-[13px] font-semibold hover:bg-gray-50 transition shadow-sm">
              <RefreshCw className="h-4 w-4" /> Verify Again
            </button>
          </div>
          
          {!profile.hasPdf && (
            <div className="w-full text-[13px] font-medium text-[#123B63] bg-[#F5F7FA] px-4 py-3 rounded-[4px] border border-[#D1D5DB] flex items-center justify-center gap-2 mt-[16px]">
              <AlertTriangle className="h-4 w-4 text-[#C8A04D]" /> Certificate PDF currently unavailable.
            </div>
          )}
        </Card>

        {/* 4. SecurityCard */}
        <Card className="flex flex-col sm:flex-row items-center gap-[20px] bg-white">
          <div className="shrink-0 flex items-center justify-center h-[40px] w-[40px] border border-[#D1D5DB] rounded-[4px] bg-[#F5F7FA]">
            <ShieldCheck className="h-5 w-5 text-[#123B63]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h4 className="text-[#123B63] font-bold text-[15px] mb-1">Secure & Verified</h4>
            <p className="text-gray-600 font-medium text-[13px]">
              This certificate has been electronically verified and is securely registered in the global IUCB ledger.
            </p>
          </div>
        </Card>

        {/* 5. FooterCard */}
        <Card className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-[60px] p-[16px] sm:px-[20px] bg-[#F5F7FA]">
          <div className="flex-1 text-center sm:text-left order-2 sm:order-1 mt-3 sm:mt-0">
             <p className="text-[12px] font-medium text-gray-500">
              The International Union of Certification Bodies (IUCB) is committed to maintaining the highest standards of certification and global trust.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 order-1 sm:order-2">
            <Award className="h-6 w-6 text-[#C8A04D]" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-[#123B63] font-bold text-[14px]">IUCB</span>
              <span className="text-[8px] font-bold text-gray-500 tracking-widest uppercase">Trusted. Global.</span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
