import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Database className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            NSN Database
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
