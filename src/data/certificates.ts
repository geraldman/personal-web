import { CertificateData } from "@/types";

export const certificates: CertificateData[] = [
  {
    id: "cert-slot-1",
    title: "Certified Junior Web Developer",
    issuer: "Issued by BNSP",
    status: "web",
    summary: "Achieved the Certificate of Competence as a Junior Web Developer (Pengembang Web Pratama) issued by the Badan Nasional Sertifikasi Profesi (BNSP), the Indonesian Professional Certification Authority. This nationally recognized certification validates competency in the field of Software Development and Programming, demonstrating professional readiness as a Junior Web Developer",
    date: "2025",
    previewImage: "/certificates/bnsp.png",
    credentialUrl: "https://drive.google.com/file/d/1R54kxOagLo00tCi3zdGysTv78TkxNq_V/view?usp=sharing"
  },

  {
    id: "cert-slot-2",
    title: "Introduction to Cybersecurity",
    issuer: "Issued by Cisco",
    status: "security",
    summary: "Successfully completed the Introduction to Cybersecurity course offered by Cisco Networking Academy. This course covers the fundamentals of cybersecurity, including cyber threats, network security, and best practices for protecting digital assets and personal data.",
    date: "2025",
    previewImage: "/certificates/cisco-intro-to-cs.jpg",
    credentialUrl: "https://www.credly.com/badges/8ffa5d62-9171-4d48-9bfa-5f828c1c2a7f/linked_in_profile"
  },
];
