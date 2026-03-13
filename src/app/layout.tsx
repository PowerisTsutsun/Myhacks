import type { Metadata } from "next";
import "./globals.css";
import { CyberBackground } from "@/components/decorative/CyberBackground";
import { Suspense } from "react";
import { VerifyEmailBanner } from "@/components/ui/VerifyEmailBanner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://laserhack.org";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "LaserHacks",
    template: "%s | LaserHacks",
  },
  description:
    "LaserHacks is Irvine Valley College's annual student hackathon — beginner-friendly, collaborative, and open to all skill levels.",
  keywords: ["hackathon", "IVC", "Irvine Valley College", "STEM", "coding", "beginner", "LaserHacks"],
  authors: [{ name: "ASIVC" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "LaserHacks",
    title: "LaserHacks — IVC's Beginner-Friendly Hackathon",
    description:
      "LaserHacks is Irvine Valley College's annual student hackathon — beginner-friendly, collaborative, and open to all skill levels.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LaserHacks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LaserHacks — IVC's Beginner-Friendly Hackathon",
    description:
      "LaserHacks is Irvine Valley College's annual student hackathon.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CyberBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
        <Suspense>
          <VerifyEmailBanner />
        </Suspense>
      </body>
    </html>
  );
}
