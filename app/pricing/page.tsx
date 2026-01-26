"use client";

import { useState, useEffect } from "react";
import { PricingCard } from "@/components/PricingCard";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Database, AlertCircle } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  const handleSubscribe = async (priceId: string) => {
    setLoading(priceId);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Checkout error:", data.error);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setLoading(null);
    }
  };

  const pricingPlan = {
    name: "Pro",
    price: "9.99",
    period: "month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_pro",
    features: [
      "Unlimited NSN searches",
      "Advanced search filters",
      "Complete database access",
      "Export to CSV & Excel",
      "Email support",
      "Regular database updates",
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-[-1] bg-background">
         <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
         <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              NSN<span className="text-primary">log</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="shadow-lg shadow-primary/20">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 md:py-20 flex-1">
        <div className="max-w-6xl mx-auto space-y-12">
          {isLoggedIn && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <AlertTitle className="text-yellow-900 dark:text-yellow-200">Subscription Required</AlertTitle>
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                You need an active subscription to access the NSN database. Choose a plan below to get started.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              One plan with everything you need for NSN database access
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <PricingCard
              name={pricingPlan.name}
              price={pricingPlan.price}
              period={pricingPlan.period}
              features={pricingPlan.features}
              highlighted={true}
              priceId={pricingPlan.priceId}
              onSubscribe={handleSubscribe}
            />
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-center tracking-tight">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Can I change my plan later?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can upgrade or downgrade your plan at any time from your account settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is there a free trial?</AccordionTrigger>
                <AccordionContent>
                  We offer a 14-day free trial for all plans. No credit card required.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards, debit cards, and bank transfers via Stripe.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}
