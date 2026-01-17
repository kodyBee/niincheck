import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, RefreshCw, ArrowRight, CheckCircle2, Database, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              NSN Database
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container">
        <section className="flex flex-col items-center text-center py-20 md:py-32">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Trusted by defense professionals
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
            Access Comprehensive{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              NSN Data
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Get instant access to our premium National Stock Number database with powerful search capabilities and detailed information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="text-lg px-8">
              <Link href="/pricing">
                View Pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/dashboard">Try Demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 w-full max-w-3xl">
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">10M+</div>
              <div className="text-sm text-muted-foreground">NSN Records</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to manage NSN data
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for defense professionals and procurement specialists
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast Search</CardTitle>
                <CardDescription>
                  Search through millions of NSN records instantly with advanced filtering and real-time results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Full-text search", "Advanced filters", "Instant results"].map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-grade encryption and security measures to protect your sensitive data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["256-bit encryption", "SOC 2 compliant", "Regular audits"].map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <RefreshCw className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Always Up-to-Date</CardTitle>
                <CardDescription>
                  Continuous updates ensure you always have access to the latest NSN information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["Daily updates", "Real-time sync", "Version history"].map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-3xl md:text-4xl mb-4">
                Ready to get started?
              </CardTitle>
              <CardDescription className="text-lg text-primary-foreground/90">
                Join thousands of professionals already using NSN Database
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8">
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 NSN Database. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
