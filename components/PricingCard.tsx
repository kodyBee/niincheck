"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  priceId: string;
  onSubscribe: (priceId: string) => void;
}

export function PricingCard({ name, price, period, features, highlighted, priceId, onSubscribe }: PricingCardProps) {
  return (
    <Card className={highlighted ? "border-primary shadow-lg scale-105" : ""}>
      <CardHeader>
        {highlighted && (
          <Badge className="w-fit mb-2">Most Popular</Badge>
        )}
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>
          <span className="text-4xl font-bold text-foreground">${price}</span>
          <span className="text-muted-foreground">/{period}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onSubscribe(priceId)}
          className="w-full"
          size="lg"
          variant={highlighted ? "default" : "outline"}
        >
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
}
