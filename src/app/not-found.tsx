import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-laser-400 font-mono text-sm mb-2">404</p>
        <h1 className="text-4xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-white/50 mb-8">
          This page doesn&apos;t exist. Maybe you&apos;re looking for something else?
        </p>
        <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
