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
import { Inbox, DollarSign, Weight, Info } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
}

export function ResultsTable({ results, isLoading }: ResultsTableProps) {
  const [selectedNSN, setSelectedNSN] = useState<NSNResult | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Try adjusting your search terms or filters to find what you&apos;re looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">NSN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>FSC</TableHead>
                  <TableHead className="text-center">Class IX</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-primary font-medium">
                      {result.nsn}
                    </TableCell>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate">
                      {result.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{result.fsc}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {result.classIX ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {result.unitPrice ? (
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{result.unitPrice}</span>
                          {result.unitOfIssue && (
                            <span className="text-xs text-muted-foreground">/{result.unitOfIssue}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNSN(result)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedNSN} onOpenChange={() => setSelectedNSN(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-2xl">
              {selectedNSN?.nsn}
            </DialogTitle>
            <DialogDescription>
              Complete NSN Details and Specifications
            </DialogDescription>
          </DialogHeader>

          {selectedNSN && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Item Name</p>
                    <p className="font-medium">{selectedNSN.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Common Name</p>
                    <p className="font-medium">{selectedNSN.description || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">FSC</p>
                    <Badge variant="outline">{selectedNSN.fsc || 'N/A'}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">AAC</p>
                    <Badge variant={selectedNSN.classIX ? "default" : "secondary"}>
                      {selectedNSN.aac || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Class IX</p>
                    <Badge variant={selectedNSN.classIX ? "default" : "secondary"}>
                      {selectedNSN.classIX ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {selectedNSN.publicationDate && (
                    <div>
                      <p className="text-muted-foreground">Publication Date</p>
                      <p className="font-medium">{selectedNSN.publicationDate}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Information */}
              {(selectedNSN.unitPrice || selectedNSN.unitOfIssue) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedNSN.unitPrice && (
                      <div>
                        <p className="text-muted-foreground">Unit Price</p>
                        <p className="font-medium text-lg">${selectedNSN.unitPrice}</p>
                      </div>
                    )}
                    {selectedNSN.unitOfIssue && (
                      <div>
                        <p className="text-muted-foreground">Unit of Issue</p>
                        <p className="font-medium">{selectedNSN.unitOfIssue}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Physical Properties */}
              {(selectedNSN.weight || selectedNSN.cube) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Weight className="h-5 w-5" />
                    Physical Properties
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedNSN.weight && (
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p className="font-medium">{selectedNSN.weight}</p>
                      </div>
                    )}
                    {selectedNSN.cube && (
                      <div>
                        <p className="text-muted-foreground">Cube</p>
                        <p className="font-medium">{selectedNSN.cube}</p>
                      </div>
                    )}
                    {selectedNSN.weightPubDate && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Weight Data Publication Date</p>
                        <p className="font-medium text-sm">{selectedNSN.weightPubDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Characteristics */}
              {selectedNSN.characteristics && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Characteristics</h3>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedNSN.characteristics}</p>
                </div>
              )}

              {/* Requirements Statement */}
              {selectedNSN.requirementsStatement && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Requirements Statement</h3>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedNSN.requirementsStatement}</p>
                </div>
              )}

              {/* Clear Text Reply */}
              {selectedNSN.clearTextReply && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Clear Text Reply</h3>
                  <p className="text-sm bg-muted p-3 rounded-md">{selectedNSN.clearTextReply}</p>
                </div>
              )}

              {/* Alternate Names */}
              {selectedNSN.alternateNames && selectedNSN.alternateNames.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Alternate Names</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNSN.alternateNames.map((name, idx) => (
                      <Badge key={idx} variant="secondary">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
