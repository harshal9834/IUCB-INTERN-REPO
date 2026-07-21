import { Link } from "@tanstack/react-router";
import { ShieldCheck, Mail, ArrowUp } from "lucide-react";

const cols = [
  {
    title: "Accreditation",
    links: [
      { to: "/services", label: "Certification Bodies" },
      { to: "/services", label: "Auditors" },
      { to: "/services", label: "Training Providers" },
      { to: "/process", label: "Process" },
    ],
  },
  {
    title: "Trust & Governance",
    links: [
      { to: "/resources/governance", label: "Governance" },
      { to: "/resources/transparency", label: "Policies" },
      { to: "/resources/documentation", label: "Documentation" },
      { to: "/directory#verify", label: "Verify Certificate" },
    ],
  },
  {
    title: "Organization",
    links: [
      { to: "/about", label: "About IUCB" },
      { to: "/directory", label: "Accredited Directory" },
      { to: "/contact", label: "Contact" },
      { to: "/resources/documentation", label: "Resources" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container-x py-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img 
              src="/logos/FINAL_LOGO_DESIGN.jpeg" 
              alt="IUCB Logo" 
              className="h-11 w-11 object-contain flex-shrink-0 rounded-md"
            />
            <div>
              <div className="text-lg font-semibold">IUCB</div>
              <div className="text-[10px] uppercase tracking-widest opacity-75">
                International Union for Certification & Benchmarking
              </div>
            </div>
          </Link>
          <p className="mt-5 text-sm text-white/75 max-w-sm leading-relaxed">
            The global authority for accreditation of certification bodies, auditors, and training
            providers — recognized in 80+ countries.
          </p>
        </div>


        {cols.map((c) => (
          <div key={c.title} className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">
              {c.title}
            </div>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to as any} className="text-sm text-white/80 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-2">
          <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">
            Contact
          </div>
          <ul className="space-y-2.5 text-sm text-white/80">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-gold" />
              <a
                href="mailto:info@iucb.org"
                className="hover:text-white transition-colors"
              >
                info@iucb.org
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-gold" />
              <a
                href="mailto:accreditations@iucb.org"
                className="hover:text-white transition-colors"
              >
                accreditations@iucb.org
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-gold" />
              <a
                href="mailto:connect@iucb.org"
                className="hover:text-white transition-colors"
              >
                connect@iucb.org
              </a>
            </li>
          </ul>
          <Link
            to={"/directory#verify" as any}
            className="inline-flex mt-5 px-4 py-2.5 text-xs font-semibold rounded-md bg-gold text-gold-foreground hover:brightness-105 transition shadow-sm"
          >
            Verify Credentials
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <div>
            © 2026 International Union for Certification & Benchmarking. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to={"/resources/transparency" as any} className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to={"/resources/governance" as any} className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <button
              onClick={() =>
                typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="flex items-center gap-1 hover:text-white"
            >
              Back to top <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
