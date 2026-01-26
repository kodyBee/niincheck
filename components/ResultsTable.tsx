"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, DollarSign, Weight, Info, Package, AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { InventoryButton } from "./InventoryButton";

interface NSNResult {
  nsn: string;
  name: string;
  description: string;
  turnInPart: string;
  classIX: boolean;
  aac?: string;
  fsc: string;
  niin: string;
  characteristics?: string;
  publicationDate?: string;
  unitPrice?: string | null;
  unitOfIssue?: string | null;
  weight?: string | null;
  cube?: string | null;
  weightPubDate?: string | null;
  requirementsStatement?: string | null;
  clearTextReply?: string | null;
  alternateNames?: string[];
}

interface ResultsTableProps {
  results: NSNResult[];
  isLoading?: boolean;
  onRemove?: (niin: string) => void;
}

const formatPrice = (price: string | null | undefined) => {
  if (!price) return "N/A";
  // Remove leading zeros but keep decimal places if they exist
  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) return price;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericPrice);
};

export function ResultsTable({ results, isLoading, onRemove }: ResultsTableProps) {
  const [selectedNSN, setSelectedNSN] = useState<NSNResult | null>(null);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-16 w-full rounded-xl bg-muted/50" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground max-w-sm">
            Try adjusting your search terms or filters. You can search by NSN, NIIN, or keywords.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[180px] font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help decoration-dotted underline decoration-muted-foreground/30 underline-offset-4">NSN / NIIN</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">National Stock Number (13 digits) / National Item Identification Number (9 digits). Unique identifier for supply items.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="min-w-[200px] font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help decoration-dotted underline decoration-muted-foreground/30 underline-offset-4">Item Details</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Nomenclature and description of the item.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help decoration-dotted underline decoration-muted-foreground/30 underline-offset-4">FSC</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Federal Supply Class. The first 4 digits of the NSN, categorizing what kind of item it is.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help decoration-dotted underline decoration-muted-foreground/30 underline-offset-4">Class IX</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Class IX includes repair parts and components required for maintenance support of all equipment. In general, Class IX items have an AAC code of D, V, or Z. There are exceptions, so don't be afraid to double check with supply.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-right font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-end gap-1 cursor-help">
                           <span className="decoration-dotted underline decoration-muted-foreground/30 underline-offset-4">Unit Price</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">The cost of a single unit of issue.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                  <TableHead className="text-center font-semibold">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help decoration-dotted underline decoration-muted-foreground/30 underline-offset-4">Actions</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">View details or perform actions on this item.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {results.map((result, index) => (
                <TableRow 
                  key={index} 
                  className="group cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setSelectedNSN(result)}
                >
                  <TableCell className="font-mono text-sm">
                    <div className="font-bold text-primary">{result.nsn}</div>
                    <div className="text-xs text-muted-foreground mt-1">{result.niin}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-base mb-1">{result.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                      {result.description || "No description available"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{result.fsc}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {result.classIX ? (
                      <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20 dark:text-emerald-400">Yes</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-mono font-medium">
                      {formatPrice(result.unitPrice)}
                    </div>
                    {result.unitOfIssue && (
                      <div className="text-xs text-muted-foreground uppercase">
                        PER {result.unitOfIssue}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {onRemove ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove(result.niin);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <InventoryButton niin={result.niin} data={result} />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary transition-colors"
                        onClick={() => setSelectedNSN(result)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TooltipProvider>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedNSN} onOpenChange={() => setSelectedNSN(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 gap-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="font-mono">{selectedNSN?.fsc}</Badge>
              {selectedNSN?.classIX && (
                <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">Class IX</Badge>
              )}
            </div>
            <DialogTitle className="font-mono text-3xl font-bold tracking-tight text-primary">
              {selectedNSN?.nsn}
            </DialogTitle>
            <DialogDescription className="text-lg text-foreground mt-2">
              {selectedNSN?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedNSN && (
            <div className="flex-1 overflow-y-auto p-6 pt-2">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Pricing & Logistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Unit Price</div>
                        <div className="text-2xl font-mono font-bold">{formatPrice(selectedNSN.unitPrice)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Unit of Issue</div>
                        <div className="font-medium">{selectedNSN.unitOfIssue || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">AAC</div>
                        <div className="font-medium">{selectedNSN.aac || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border bg-card p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Weight className="h-4 w-4" /> Physical Data
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Weight</div>
                        <div className="font-medium">{selectedNSN.weight || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Cube</div>
                        <div className="font-medium">{selectedNSN.cube || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                   <div className="rounded-xl border bg-card p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Info className="h-4 w-4" /> Description
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {selectedNSN.description || "No detailed description available."}
                    </p>
                  </div>

                  {(selectedNSN.characteristics || selectedNSN.requirementsStatement) && (
                     <div className="rounded-xl border bg-card p-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4" /> Specs
                      </h3>
                      <div className="space-y-4">
                        {selectedNSN.characteristics && (
                          <div>
                            <div className="text-xs font-semibold mb-1">Characteristics</div>
                            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">{selectedNSN.characteristics}</div>
                          </div>
                        )}
                        {selectedNSN.requirementsStatement && (
                          <div>
                            <div className="text-xs font-semibold mb-1">Requirements</div>
                            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">{selectedNSN.requirementsStatement}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedNSN.alternateNames && selectedNSN.alternateNames.length > 0 && (
                     <div className="rounded-xl border bg-card p-4">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                         Alternate Names
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedNSN.alternateNames.map((name, idx) => (
                          <Badge key={idx} variant="secondary" className="font-normal">{name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
