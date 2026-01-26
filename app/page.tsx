import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Shield, RefreshCw, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSearch } from "@/components/HeroSearch";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/20" />
      </div>

      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-12 md:py-24 lg:py-32 overflow-hidden">
          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full border bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Zap className="mr-2 h-3.5 w-3.5 text-primary" />
                <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  The Modern Standard for Logistics
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                Master the <br />
                <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Supply Chain
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                Instantly search millions of National Stock Number records.
                Keep commonly used NSNs in your inventory for quick access. 
              </p>

              

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

              {/* Verified Stats */}
              <div className="grid grid-cols-3 gap-8 md:gap-16 mt-20 pt-10 border-t border-border/50 animate-in fade-in duration-1000 delay-500 w-full">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">10M+</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">Records Indexed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">99.9%</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm font-medium text-muted-foreground mt-1">Data Updates</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-secondary/30 relative">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
          <div className="container relative">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Engineered for Performance
              </h2>
              <p className="text-lg text-muted-foreground">
                We&apos;ve rebuilt the NSN search experience from the ground up to be faster, deeper, and more intuitive.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Search,
                  title: "Instant Search",
                  description: "Query millions of records in milliseconds with our optimized indexing engine.",
                  features: ["Fuzzy matching", "Part number lookup", "FSC filtering"]
                },
                {
                  icon: Shield,
                  title: "Military Grade",
                  description: "Security is verified and compliant with modern defense standards.",
                  features: ["SOC 2 Ready", "End-to-end encryption", "Role-based access"]
                },
                {
                  icon: RefreshCw,
                  title: "Real-time Sync",
                  description: "Data is continuously synchronized with federal logistics information services.",
                  features: ["Daily FLIS updates", "Price tracking", "Supersession history"]
                }
              ].map((feature, i) => (
                <Card key={i} className="group relative overflow-hidden bg-background/60 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.features.map((item) => (
                        <li key={item} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container relative z-10">
            <div className="rounded-3xl bg-gradient-to-r from-primary to-violet-600 p-1">
              <div className="rounded-[22px] bg-background/95 backdrop-blur-xl p-12 lg:p-20 text-center">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                  Ready to optimize your workflow?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                  Join verified defense contractors and logistics officers who trust NSNlog for their daily operations.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14" asChild>
                    <Link href="/pricing">View Plans</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
