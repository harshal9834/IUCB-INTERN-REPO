import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Send, BadgeCheck, Loader2 } from "lucide-react";
import { PageHero } from "../components/page-hero";
import publicApplicationsApi from "../services/api/public-applications.api";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact IUCB" },
      {
        name: "description",
        content:
          "Get in touch with the IUCB accreditation team for applications, partnerships, or verification queries.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const org = String(formData.get("org") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    try {
      await publicApplicationsApi.submitContact({
        name,
        email,
        org: org || undefined,
        subject,
        message,
      });
      setSent(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to send message. Please try again or email us directly.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to the IUCB <span className="text-gold">Team</span>
          </>
        }
        description="Whether you're applying for accreditation, verifying a credential, or exploring a partnership — our team responds within 2–3 business days."
      />

      <section className="py-16 md:py-20 bg-white">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border p-8 bg-card shadow-sm">
              {sent ? (
                <div className="text-center py-12">
                  <div className="h-14 w-14 mx-auto rounded-full bg-gold text-gold-foreground grid place-items-center">
                    <BadgeCheck className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-navy">Message received</h3>
                  <p className="mt-4 text-muted-foreground text-sm max-w-md mx-auto">
                    Your message has been sent directly to the IUCB Administration team. A representative will respond within 2–3 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-5">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-600 font-medium">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input label="Full Name" name="name" required />
                    <Input label="Email Address" name="email" type="email" required />
                  </div>
                  <Input label="Organization" name="org" />
                  <Input label="Subject" name="subject" required />
                  <div>
                    <label className="block text-sm font-semibold text-navy mb-2">Message</label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-white text-navy focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-secondary transition w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        Sending Message <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        Send Message <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-5">
            <ContactCard
              icon={Mail}
              title="General Inquiries"
              lines={["info@iucb.org", "Response within 24h"]}
            />
            <ContactCard
              icon={Mail}
              title="Accreditations"
              lines={["accreditations@iucb.org", "Application support & process"]}
            />
            <ContactCard
              icon={Mail}
              title="Partnerships"
              lines={["connect@iucb.org", "Recognition agreements & MRAs"]}
            />
            <ContactCard
              icon={MapPin}
              title="Headquarters"
              lines={["Tornimäe 5, 10145", "Tallinn, Estonia"]}
            />
            <ContactCard
              icon={Phone}
              title="Phone"
              lines={["+372 600 4500", "Mon–Fri · 09:00–18:00 EET"]}
            />
          </aside>
        </div>
      </section>
    </>
  );
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-lg border border-border bg-white text-navy focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      />
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-xl border border-border p-5 flex gap-4 bg-card">
      <div className="h-10 w-10 rounded-md bg-light-blue text-primary grid place-items-center flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-semibold text-navy">{title}</div>
        {lines.map((l, i) => (
          <div
            key={i}
            className={i === 0 ? "mt-1 text-sm text-navy" : "text-xs text-muted-foreground"}
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
