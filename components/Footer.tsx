import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-20">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                NSN Database
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your trusted source for comprehensive NSN data access.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-muted-foreground text-sm">
          <p>&copy; 2026 NSN Database. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
