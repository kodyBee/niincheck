"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, Folder, ChevronRight, CheckCircle2, AlertCircle, Database, LogOut, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Inventory {
  id: string;
  name: string;
  created_at: string;
  items: { count: number }[];
}

export default function InventoryPage() {
  const { data: session, status } = useSession();
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        if (data.inventories) setInventories(data.inventories);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
       {/* Reusing Header - In a real app this should be a component */}
       <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              NSN<span className="text-primary">log</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/inventory" className="cursor-pointer">
                    <List className="mr-2 h-4 w-4" />
                    My Inventory
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Inventories</h1>
            <p className="text-muted-foreground mt-1">Manage your saved item lists.</p>
          </div>

          <div className="grid gap-4">
            {loading ? (
                <div className="flex justify-center p-12">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : inventories.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No inventories yet</h3>
                        <p className="text-muted-foreground">Start searching and add items to create a list.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/dashboard">Go to Search</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                inventories.map((inv) => (
                <Link key={inv.id} href={`/inventory/${inv.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors border-l-4 border-l-primary/0 hover:border-l-primary cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Folder className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">{inv.name}</CardTitle>
                                <CardDescription>Created {new Date(inv.created_at).toLocaleDateString()}</CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-sm">{inv.items[0]?.count || 0} items</span>
                            <ChevronRight className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    </Card>
                </Link>
                ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
