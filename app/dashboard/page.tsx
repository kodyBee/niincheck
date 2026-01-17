"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { ResultsTable } from "@/components/ResultsTable";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, LogOut, User, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface NSNResult {
  nsn: string;
  name: string;
  description: string;
  turnInPart: string;
  classIX: boolean;
  fsc: string;
  niin: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState<NSNResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Check if we're returning from a successful checkout
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId && !verifyingSubscription) {
      setVerifyingSubscription(true);
      
      // Verify the session and update subscription
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setShowSuccessMessage(true);
            // Clean up URL
            window.history.replaceState({}, '', '/dashboard');
            // Hide message after 5 seconds
            setTimeout(() => setShowSuccessMessage(false), 5000);
          }
        })
        .catch(err => {
          console.error('Error verifying session:', err);
        })
        .finally(() => {
          setVerifyingSubscription(false);
        });
    }
  }, [verifyingSubscription]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Check if user is subscribed
    if (!session?.user?.isSubscribed) {
      toast.error("Subscription Required", {
        description: "You need an active subscription to search the NSN database.",
        duration: 5000,
        position: "top-center",
        action: {
          label: "View Plans",
          onClick: () => router.push("/pricing"),
        },
      });
      return;
    }
    
    setSearchLoading(true);
    
    try {
      // Call API route that uses server-side Supabase client
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Search error:', data.error);
        toast.error("Search Error", {
          description: data.error || "An error occurred while searching.",
          duration: 5000,
        });
        setResults([]);
      } else {
        setResults(data.results || []);
        if (data.results && data.results.length === 0) {
          console.log('No results found for query:', query);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error("Unexpected Error", {
        description: "An unexpected error occurred. Please try again.",
        duration: 5000,
      });
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userInitials = session?.user?.email?.slice(0, 2).toUpperCase() || "UN";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Success Message */}
      {showSuccessMessage && (
        <Alert className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right border-green-500 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900">Success!</AlertTitle>
          <AlertDescription className="text-green-800">
            Subscription activated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Overlay */}
      {verifyingSubscription && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="font-medium">Activating your subscription...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              NSN Database
            </span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  {!session?.user?.isSubscribed && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      !
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">Account</p>
                      {!session?.user?.isSubscribed && (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!session?.user?.isSubscribed && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="cursor-pointer">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Subscribe Now
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Search NSN Database
            </h1>
            <p className="text-xl text-muted-foreground">
              Search through millions of National Stock Numbers
            </p>
          </div>

          <SearchBar 
            onSearch={handleSearch} 
            isSubscribed={session?.user?.isSubscribed}
          />

          {searchQuery && (
            <div>
              <h3 className="text-2xl font-semibold mb-4">
                Results for <span className="text-primary">"{searchQuery}"</span>
              </h3>
            </div>
          )}

          <ResultsTable results={results} isLoading={searchLoading} />
        </div>
      </main>
    </div>
  );
}
