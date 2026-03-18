import type { Metadata } from "next";
import { Poppins, Hind_Siliguri } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Radiance | Advanced EdTech Platform",
    template: "%s | Radiance"
  },
  description: "The most advanced EdTech platform for SSC and HSC students in Bangladesh. Quality education, interactive exams, and expert instructors.",
  keywords: ["SSC", "HSC", "Education", "Online Course", "Exam", "Bangladesh", "Learning"],
  authors: [{ name: "Radiance Team" }],
  creator: "Radiance",
  publisher: "Radiance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://radiance.com",
    siteName: "Radiance",
    title: "Radiance | Advanced EdTech Platform",
    description: "The most advanced EdTech platform for SSC and HSC students in Bangladesh.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Radiance Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Radiance | Advanced EdTech Platform",
    description: "The most advanced EdTech platform for SSC and HSC students in Bangladesh.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${hindSiliguri.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
