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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              NSN Database
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
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
      <main className="container py-12 md:py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          {isLoggedIn && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertTitle className="text-yellow-900">Subscription Required</AlertTitle>
              <AlertDescription className="text-yellow-800">
                You need an active subscription to access the NSN database. Choose a plan below to get started.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
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
            <h2 className="text-3xl font-bold text-center">
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
