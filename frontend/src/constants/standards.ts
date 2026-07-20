export interface Standard {
  name: string;
  edition: string;
  category: string;
  governingDocument: string;
}

export const OFFICIAL_STANDARDS: Standard[] = [
  {
    name: "ISO/IEC 17021-1",
    edition: "Current edition (CB competence baseline)",
    category: "Certification Body Foundation",
    governingDocument: "IUCB Accreditation Framework (IUCB-STD-001)"
  },
  {
    name: "ISO/IEC 27001",
    edition: "2022 Edition",
    category: "Information Security (ISMS)",
    governingDocument: "ISO 27001 Transition Guide (IUCB-STD-003)"
  },
  {
    name: "ISO/IEC 27701",
    edition: "2025 Edition (Standalone)",
    category: "Privacy Information Management (PIMS)",
    governingDocument: "ISO 27701 Privacy Extension Guidelines (IUCB-STD-004)"
  },
  {
    name: "ISO 9001",
    edition: "2015 Edition (with 2024 Climate Amendment)",
    category: "Quality Management System (QMS)",
    governingDocument: "ISO 9001 Quality Management Guide (IUCB-STD-005)"
  },
  {
    name: "SOC 2",
    edition: "Current AICPA Criteria",
    category: "Service Organization Controls",
    governingDocument: "SOC 2 Readiness Framework (IUCB-STD-006)"
  }
];

export const getStandardByName = (name: string): Standard | undefined => {
  return OFFICIAL_STANDARDS.find(s => s.name === name);
};
