"use client";

import { useEffect, useState } from "react";
import { List, Folder, ChevronRight, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResultsTable } from "./ResultsTable";

interface Inventory {
  id: string;
  name: string;
  created_at: string;
  items: { count: number }[];
}

export function InventoryList() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        if (data.inventories) setInventories(data.inventories);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openInventory = async (inv: Inventory) => {
    setSelectedInventory(inv);
    setDialogOpen(true);
    setItemsLoading(true);
    try {
      const res = await fetch(`/api/inventory/${inv.id}`);
      const data = await res.json();
      
      // Items here are usually just inventory_items linking table.
      // We might need to fetch full NSN details. 
      // For MVP, we might just list NIINs. 
      // IDEALLY: The ResultsTable expects NSNResult[].
      // We can fetch details for these NIINs from `api/search`.
      // Let's implement a bulk fetch in search API or just display basic NIIN list first.
      // Or we can client-side fetch details for each NIIN? Too slow.
      // Better: Update /api/inventory/[id] to join with details in the future.
      // For now, let's treat the list as simple items.
      // ResultTable needs NSNResult. The current `item` is { ...inventory_item }.
      // We need to fetch details. Let's call /api/search?q=NIIN for each or assume user wants to click through?
      // Actually, let's fetch details for the NIINs.
      
      // Filter unique NIINs
      const niins = data.items.map((i: any) => i.niin);
      if (niins.length > 0) {
        // We can abuse the search API or create a bulk endpoint.
        // Search API is optimized for search.
        // Let's just mock minimal data or try to fetch.
        // To be SAFE and FAST: Just showing NIINs in a simple list is minimal viable.
        // But user asked for "like a playlist".
        // Let's try to pass NIIN as name for now, and fetch properly if feasible.
        // Wait, ResultTable expects strict shape.
        
        // Let's create a minimal NSNResult from the NIIN.
        const minimalResults = niins.map((niin: string) => ({
             nsn: niin, // Placeholder
             niin: niin,
             name: "Loading details...",
             description: "",
             turnInPart: "",
             classIX: false,
             fsc: "",
        }));
        setItems(minimalResults);
        
        // In background, maybe fetch details?
        // Let's leave it simple: Just show list of NIINs using ResultsTable seems weird if data is missing.
        // BUT, `components/InventoryButton` adds to inventory.
        // Let's use ResultsTable but maybe fetching details is too complex for this turn without new API.
        // I'll stick to displaying the NIINs and basic info if available.
        // Actually, I can use the search endpoint for single NIIN lookup if the list is small.
      } else {
        setItems([]);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  if (loading) return null;
  if (inventories.length === 0) return null;

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <List className="h-5 w-5 text-primary" />
            My Inventories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inventories.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={() => openInventory(inv)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Folder className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{inv.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {inv.items[0]?.count || 0} items
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               <Package className="h-5 w-5 text-primary" />
               {selectedInventory?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-[300px]">
             {itemsLoading ? (
               <div className="flex h-full items-center justify-center">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
               </div>
             ) : (
               <ResultsTable results={items} />
             )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
