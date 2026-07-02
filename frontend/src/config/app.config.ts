// Application Configuration
export const appConfig = {
  name: "IUCB",
  title: "IUCB — The Global Authority for Accreditation & Certification",
  description:
    "IUCB accredits Certification Bodies, Auditors, and Training Providers against ISO, Cybersecurity & Privacy standards across 80+ countries.",
  author: "IUCB",
};

export const seoConfig = {
  og: {
    title: appConfig.title,
    description: appConfig.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: appConfig.title,
    description: appConfig.description,
  },
};
