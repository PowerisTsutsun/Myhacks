import type { Metadata } from "next";
import "./globals.css";
import { CyberBackground } from "@/components/decorative/CyberBackground";
import { Suspense } from "react";
import { VerifyEmailBanner } from "@/components/ui/VerifyEmailBanner";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "MyHacks",
    template: "%s | MyHacks",
  },
  description:
    "MyHacks is a beginner-friendly hackathon — collaborative and open to all skill levels.",
  keywords: ["hackathon", "STEM", "coding", "beginner", "MyHacks"],
  authors: [{ name: "MyHacks Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "MyHacks",
    title: "MyHacks — A Beginner-Friendly Hackathon",
    description:
      "MyHacks is a beginner-friendly hackathon — collaborative and open to all skill levels.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MyHacks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyHacks — A Beginner-Friendly Hackathon",
    description:
      "MyHacks is a beginner-friendly hackathon.",
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
