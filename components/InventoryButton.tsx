"use client";

import { useState, useEffect } from "react";
import { Plus, Check, Loader2, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Inventory {
  id: string;
  name: string;
}

interface InventoryButtonProps {
  niin: string;
  data: any; // Full NSN Object
}

export function InventoryButton({ niin, data }: InventoryButtonProps) {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newInventoryName, setNewInventoryName] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch inventories when dropdown is opened (or eager fetch if frequent)
  // For simplicity, we'll fetch on mount or when trigger clicked.
  // Actually, standard dropdown doesn't strictly support async loading easily without state.
  // We'll fetch on first open.
  const [hasFetched, setHasFetched] = useState(false);

  const fetchInventories = async () => {
    if (hasFetched) return;
    try {
      setLoading(true);
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventories(data.inventories || []);
        setHasFetched(true);
      }
    } catch (err) {
      console.error("Failed to fetch inventories", err);
    } finally {
      setLoading(false);
    }
  };

  const addToInventory = async (inventoryId: string, inventoryName: string) => {
    try {
      const res = await fetch(`/api/inventory/${inventoryId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niin, data }),
      });

      if (res.ok) {
        toast.success(`Added to ${inventoryName}`);
      } else {
        const data = await res.json();
        if (res.status === 409) {
             toast.info(`Already in ${inventoryName}`);
        } else {
             toast.error(data.error || "Failed to add item");
        }
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const createAndAdd = async () => {
    if (!newInventoryName.trim()) return;
    setCreating(true);
    try {
      // 1. Create Inventory
      const createRes = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newInventoryName }),
      });

      if (!createRes.ok) throw new Error("Failed to create inventory");

      const { inventory } = await createRes.json();
      setInventories([inventory, ...inventories]);
      setNewInventoryName("");
      setCreateOpen(false);

      // 2. Add Item
      await addToInventory(inventory.id, inventory.name);
      
    } catch (err) {
      toast.error("Failed to create inventory");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={createOpen} onOpenChange={setCreateOpen}>
      <DropdownMenu onOpenChange={(open) => open && fetchInventories()}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary transition-colors">
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add to inventory</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Add to Inventory</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {loading ? (
             <div className="flex justify-center p-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <DropdownMenuGroup className="max-h-48 overflow-y-auto">
              {inventories.length === 0 ? (
                <div className="p-2 text-xs text-muted-foreground text-center">
                  No inventories found
                </div>
              ) : (
                inventories.map((inv) => (
                  <DropdownMenuItem key={inv.id} onClick={() => addToInventory(inv.id, inv.name)}>
                    <ListPlus className="mr-2 h-4 w-4 opacity-50" />
                    <span className="truncate">{inv.name}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuGroup>
          )}
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Plus className="mr-2 h-4 w-4" />
              Create New...
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Inventory</DialogTitle>
          <DialogDescription>
            Create a new list to organize your NIINs.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input 
            placeholder="Inventory Name (e.g., 'Deploymeny Kit A')" 
            value={newInventoryName}
            onChange={(e) => setNewInventoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createAndAdd()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={createAndAdd} disabled={creating || !newInventoryName.trim()}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create & Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
