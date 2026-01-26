"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Mail, User, Shield, CreditCard, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userInitials = session?.user?.email?.slice(0, 2).toUpperCase() || "UN";
  const isSubscribed = session?.user?.isSubscribed;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/20" />
      </div>

      <div className="container max-w-2xl py-12 md:py-24">
        <Button variant="ghost" asChild className="mb-8 hover:bg-muted/50 -ml-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="border-border/50 shadow-2xl shadow-primary/5 overflow-hidden">
          <CardHeader className="bg-muted/30 pb-10 pt-10 border-b border-border/50">
             <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl mb-4">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold mb-1">
                  {session?.user?.name || "User Account"}
                </CardTitle>
                <CardDescription className="text-base">
                  Manage your account settings and subscription
                </CardDescription>
             </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4" /> Account Details
              </h3>
              <div className="grid gap-4 p-4 rounded-xl border bg-card/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account ID</p>
                      <p className="text-xs text-muted-foreground font-mono">{session?.user?.id || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Subscription
              </h3>
              <div className={`p-4 rounded-xl border ${isSubscribed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      {isSubscribed ? (
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">
                          {isSubscribed ? "Active Pro Subscription" : "Free Tier"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isSubscribed 
                            ? "You have full access to the NSN Database." 
                            : "Upgrade to access search and details."}
                        </p>
                      </div>
                   </div>
                   {!isSubscribed && (
                     <Button size="sm" asChild>
                       <Link href="/pricing">Upgrade</Link>
                     </Button>
                   )}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="bg-muted/30 p-6 flex justify-end">
            <Button variant="destructive" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
