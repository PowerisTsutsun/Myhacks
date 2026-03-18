import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin | MyHacks",
    template: "%s | Admin | MyHacks",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
