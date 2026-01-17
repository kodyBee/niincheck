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
import { Inbox } from "lucide-react";

interface NSNResult {
  nsn: string;
  name: string;
  description: string;
  turnInPart: string;
  classIX: boolean;
  fsc: string;
  niin: string;
}

interface ResultsTableProps {
  results: NSNResult[];
  isLoading?: boolean;
}

export function ResultsTable({ results, isLoading }: ResultsTableProps) {
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
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">NSN</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Turn in Part</TableHead>
                <TableHead className="text-center">Class IX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-primary font-medium">
                    {result.nsn}
                  </TableCell>
                  <TableCell className="font-medium">{result.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {result.description}
                  </TableCell>
                  <TableCell>{result.turnInPart}</TableCell>
                  <TableCell className="text-center">
                    {result.classIX ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
