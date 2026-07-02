import { Link } from "@tanstack/react-router";
import { ShieldCheck, Mail, ArrowUp, Linkedin, Twitter, Globe } from "lucide-react";

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
      { to: "/governance", label: "Governance" },
      { to: "/governance", label: "Policies" },
      { to: "/documentation", label: "Documentation" },
      { to: "/verify", label: "Verify Certificate" },
    ],
  },
  {
    title: "Organization",
    links: [
      { to: "/about", label: "About IUCB" },
      { to: "/directory", label: "Accredited Directory" },
      { to: "/contact", label: "Contact" },
      { to: "/documentation", label: "Resources" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container-x py-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gold text-gold-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
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
          <div className="mt-6 flex items-center gap-3">
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-md bg-white/10 hover:bg-white/20"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-md bg-white/10 hover:bg-white/20"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="h-9 w-9 grid place-items-center rounded-md bg-white/10 hover:bg-white/20"
            >
              <Globe className="h-4 w-4" />
            </a>
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title} className="lg:col-span-2">
            <div className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">
              {c.title}
            </div>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to as never} className="text-sm text-white/80 hover:text-white">
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
              <Mail className="h-3.5 w-3.5" /> info@iucb.org
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> accreditations@iucb.org
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> connect@iucb.org
            </li>
          </ul>
          <Link
            to="/verify"
            className="inline-flex mt-5 px-3 py-2 text-xs font-semibold rounded-md bg-gold text-gold-foreground"
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
            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white">
              Terms of Service
            </a>
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
