"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export function HeroActions() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center opacity-0">
        {/* Placeholder to prevent layout shift if possible, or just hidden until loaded */}
        <Button variant="outline" size="lg" className="text-lg h-12">
            Loading...
        </Button>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <Button size="lg" asChild className="text-lg h-12 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
          <Link href="/dashboard">
            Go to Dashboard
            <LayoutDashboard className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <Button variant="outline" size="lg" asChild className="text-lg h-12">
        <Link href="/pricing">
          View Pricing
        </Link>
      </Button>
      <Button size="lg" asChild className="text-lg h-12 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
        <Link href="/signup">
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
