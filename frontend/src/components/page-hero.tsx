import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />
      <div className="container-x relative py-20 md:py-28">
        {eyebrow && (
          <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-4">
            {eyebrow}
          </div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] max-w-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base md:text-lg text-white/80 leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
