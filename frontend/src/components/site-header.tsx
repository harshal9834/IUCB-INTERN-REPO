import { Link } from "@tanstack/react-router";
import { ShieldCheck, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";

type NavItem = { to: string; label: string; hasMenu?: "programs" | "resources" };
const nav: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Accreditation", hasMenu: "programs" },
  { to: "/directory", label: "Directory" },
  { to: "/documentation", label: "Resources", hasMenu: "resources" },
];

type MegaCol = { title: string; links: { to: string; label: string }[] };

const programsMega: MegaCol[] = [
  {
    title: "Accreditation Programs",
    links: [
      { to: "/services", label: "Auditor Accreditation" },
      { to: "/services", label: "Certification Body Accreditation" },
      { to: "/services", label: "Training Provider Accreditation" },
    ],
  },
];

const resourcesMega: MegaCol[] = [
  {
    title: "Governance",
    links: [
      { to: "/governance", label: "Board & Council" },
      { to: "/governance", label: "Technical Committee" },
      { to: "/governance", label: "Impartiality Committee" },
    ],
  },
  {
    title: "Trust Center",
    links: [
      { to: "/governance", label: "International Recognition" },
      { to: "/governance", label: "Standards Followed" },
      { to: "/governance", label: "Quality Assurance" },
    ],
  },
  {
    title: "Documentation",
    links: [
      { to: "/documentation", label: "Manuals & Forms" },
      { to: "/documentation", label: "Templates" },
      { to: "/documentation", label: "Publications" },
    ],
  },
  {
    title: "Transparency",
    links: [
      { to: "/governance", label: "Appeals Process" },
      { to: "/governance", label: "Complaints Handling" },
      { to: "/governance", label: "Code of Ethics" },
    ],
  },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50">
      {/* Zone B — Branding row */}
      <div className="bg-white border-b border-border">
        <div className="container-x flex h-[68px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-full bg-primary grid place-items-center ring-2 ring-gold/70 ring-offset-2">
              <ShieldCheck className="h-5 w-5 text-gold" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold tracking-tight text-primary">IUCB</div>
              <div className="text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
                International Union of Certification Bodies
              </div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/documentation"
              className="h-9 px-5 inline-flex items-center text-xs font-semibold rounded-full border border-gold/40 text-primary hover:border-gold hover:bg-gold/5 transition"
            >
              Advisory
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-primary"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Zone C — Global navigation bar */}
      <div className="bg-primary text-white border-t border-white/10 relative">
        <div className="container-x">
          <nav className="hidden lg:flex items-center gap-0">
            {nav.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasMenu && setMenu(item.label)}
                onMouseLeave={() => setMenu(null)}
              >
                <Link
                  to={item.to as never}
                  className="group relative flex items-center gap-1 px-5 py-3.5 text-[15px] font-semibold text-white/90 hover:text-white transition-colors"
                  activeProps={{
                    className:
                      "flex items-center gap-1 px-5 py-3.5 text-[15px] font-semibold text-white",
                  }}
                >
                  {item.label}
                  {item.hasMenu && <ChevronDown className="h-3 w-3 opacity-80" />}
                  <span className="pointer-events-none absolute left-4 right-4 bottom-0 h-[3px] bg-gold scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                </Link>
                {item.hasMenu && menu === item.label && (
                  <div
                    className="fixed left-0 right-0 z-50"
                    style={{ top: "auto" }}
                    onMouseEnter={() => setMenu(item.label)}
                    onMouseLeave={() => setMenu(null)}
                  >
                    <div className="absolute left-0 top-full w-screen">
                      <div className="bg-white border-b-4 border-gold shadow-2xl">
                        <div className="container-x py-10 grid grid-cols-4 gap-10">
                          {(item.hasMenu === "programs" ? programsMega : resourcesMega).map(
                            (col) => (
                              <div key={col.title}>
                                <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-primary mb-4 pb-2 border-b border-light-blue">
                                  {col.title}
                                </div>
                                <ul className="space-y-2.5">
                                  {col.links.map((l) => (
                                    <li key={l.label}>
                                      <Link
                                        to={l.to as never}
                                        className="group inline-flex items-center text-[14px] font-medium text-navy-deep hover:text-secondary transition-all hover:translate-x-[3px]"
                                      >
                                        {l.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2 py-2">
              <Link
                to="/services"
                className="inline-flex items-center h-9 px-5 rounded-full bg-gold text-gold-foreground text-[13px] font-bold hover:brightness-105 transition shadow-sm"
              >
                Get Accredited
              </Link>
            </div>
          </nav>
        </div>
        {/* Subtle gold separator between header and page content */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-primary text-white">
          <div className="container-x py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to as never}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-white/90 hover:text-gold"
              >
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 mt-3">
              <Link
                to="/verify"
                onClick={() => setOpen(false)}
                className="flex-1 text-center px-4 py-2 text-sm rounded-md border border-white/30"
              >
                Verify
              </Link>
              <Link
                to="/services"
                onClick={() => setOpen(false)}
                className="flex-1 text-center px-4 py-2 text-sm font-semibold rounded-md bg-gold text-gold-foreground"
              >
                Apply
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
