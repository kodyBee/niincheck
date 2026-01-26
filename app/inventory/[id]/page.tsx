"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Database, LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsTable } from "@/components/ResultsTable";
import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function InventoryDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inventoryName, setInventoryName] = useState("");

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (id) {
        // Fetch inventory details (for name) - assumes endpoint returns it or we fetch list
        // Actually, let's just fetch items. We might need a proper "get inventory" endpoint for metadata
        // For now, we'll just fetch items.
        // Update: I should probably update the API to return metadata too.
        // But let's check existing API: `GET /api/inventory/[id]` returns `{ items: ... }`.
        
        // I'll fetch the list of inventories to get the name for now (lazy way) or update endpoint.
        // Let's implement the fetch.
        
        fetch(`/api/inventory/${id}`)
        .then((res) => {
            if (!res.ok) throw new Error("Failed");
            return res.json();
        })
        .then((data) => {
            // Map the items to NSNResult format
            // If `data` column exists (snapshot), use it!
            const mappedItems = data.items.map((item: any) => {
                if (item.data) {
                    return item.data; // Use snapshot!
                }
                // Fallback to minimal data
                return {
                    nsn: item.niin,
                    niin: item.niin,
                    name: "Unknown Item (No Snapshot)",
                    description: "",
                    classIX: false,
                    fsc: "",
                };
            });
            setItems(mappedItems);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));

        // Separate fetch for name since the ID route only returns items currently
        fetch("/api/inventory")
            .then(res => res.json())
            .then(data => {
                const inv = data.inventories?.find((i: any) => i.id === id);
                if (inv) setInventoryName(inv.name);
            });
    }
  }, [id]);

  const handleDeleteInventory = async () => {
      if (!confirm("Are you sure you want to delete this inventory?")) return;
      
      try {
          const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
          if (res.ok) {
              toast.success("Inventory deleted");
              router.push("/inventory");
          } else {
              toast.error("Failed to delete");
          }
      } catch (err) {
          toast.error("Error deleting");
      }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };
  
  const handleRemoveItem = async (niin: string) => {
    try {
      // Optimistic update
      const previousItems = [...items];
      setItems(items.filter(i => i.niin !== niin));

      const res = await fetch(`/api/inventory/${id}/items?niin=${niin}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
      // Revert optimism if needed, but usually fine to just toast error.
      // Ideally we would fetch items again or revert state.
    }
  };

  const userInitials = session?.user?.email?.slice(0, 2).toUpperCase() || "UN";

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       {/* Reusing Header */}
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
                    <Link href="/inventory" className="cursor-pointer">My Inventory</Link>
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
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inventory">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{inventoryName || "Inventory"}</h1>
                        <p className="text-muted-foreground">{items.length} items</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDeleteInventory}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Inventory
                </Button>
            </div>

            <ResultsTable results={items} onRemove={handleRemoveItem} />
        </div>
      </main>
    </div>
  );
}
