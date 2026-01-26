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
import { Card, CardContent } from "@/components/ui/card";
import { Database, LogOut, User, CheckCircle2, Loader2, AlertCircle, Settings, CreditCard, List } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { SearchHistory } from "@/components/SearchHistory";
import { InventoryList } from "@/components/InventoryList";

interface NSNResult {
  nsn: string;
  name: string;
  description: string;
  turnInPart: string;
  classIX: boolean;
  fsc: string;
  niin: string;
  unitPrice?: string;
  unitOfIssue?: string;
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

  const handleSearch = async (query: string, filters: any = {}) => {
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
      // Build query string with filters
      const params = new URLSearchParams({ q: query });
      if (filters.fsc) params.append('fsc', filters.fsc);
      if (filters.classIX) params.append('classIX', filters.classIX);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      // Call API route that uses server-side Supabase client
      const response = await fetch(`/api/search?${params.toString()}`);
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
          toast.info("No Results", {
            description: `No results found for "${query}" with the applied filters.`,
            duration: 3000,
          });
        } else {
          toast.success("Search Complete", {
            description: `Found ${data.results.length} result(s)${data.total > data.results.length ? ` (${data.total} total)` : ''}.`,
            duration: 2000,
          });
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

    // Save history in background
    if (query.trim()) {
       fetch("/api/history", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ query: query.trim() }),
       }).catch(err => console.error("Failed to save history", err));
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userInitials = session?.user?.email?.slice(0, 2).toUpperCase() || "UN";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20" />
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="text-emerald-900 dark:text-emerald-100">Success!</AlertTitle>
          <AlertDescription className="text-emerald-800 dark:text-emerald-200">
            Subscription activated successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Loading Overlay */}
      {verifyingSubscription && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <Card className="border-border/50 shadow-xl">
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              NSN<span className="text-primary">log</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
             {/* Add additional nav items here if needed */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
                  </Avatar>
                  {!session?.user?.isSubscribed && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs animate-pulse"
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
                      {!session?.user?.isSubscribed ? (
                         <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Free Plan</Badge>
                      ) : (
                         <Badge variant="default" className="text-[10px] h-5 px-1.5 bg-emerald-500 hover:bg-emerald-600">Pro</Badge>
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!session?.user?.isSubscribed && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing" className="cursor-pointer text-primary focus:text-primary">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                  <DropdownMenuItem asChild>
                     <Link href="/inventory" className="cursor-pointer">
                      <List className="mr-2 h-4 w-4" />
                      My Inventory
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </header>

      {/* Main Content */}
      <main className="container py-8 md:py-12 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Search Database
                </h1>
                <p className="text-muted-foreground mt-1">
                  Access over 10 million active NSN records
                </p>
             </div>
             {!session?.user?.isSubscribed && (
                <Button asChild size="sm" variant="outline" className="hidden md:flex">
                  <Link href="/pricing">View Plans</Link>
                </Button>
             )}
          </div>

          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-2xl border shadow-sm">
             <SearchBar 
              onSearch={handleSearch} 
              isSubscribed={session?.user?.isSubscribed}
            />
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            <SearchHistory onSearch={(q) => handleSearch(q)} />
          </div>

          <div className="space-y-4">
             {searchQuery && (
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Results for <span className="text-primary">&quot;{searchQuery}&quot;</span>
                </h3>
                <span className="text-sm text-muted-foreground">
                   {results.length > 0 ? `${results.length} found` : "No results"}
                </span>
              </div>
            )}
             <ResultsTable results={results} isLoading={searchLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
