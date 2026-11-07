"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function ResourceNotFoundDialog({
  isOpen,
  resourceName = "Resource",
  returnPath,
  onClose,
}) {
  const router = useRouter();

  const handleReturn = () => {
    if (onClose) {
      onClose();
    } else if (returnPath) {
      router.push(returnPath);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReturn()}>
      <DialogContent className="sm:max-w-md p-6 bg-card text-foreground border-border sm:rounded-lg">
        <DialogHeader className="flex flex-col items-center text-center gap-3">
          <div className="size-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="size-6" />
          </div>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {resourceName} Not Found
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground max-w-xs">
            The requested {resourceName.toLowerCase()} could not be found. It may have been removed or the link is invalid.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleReturn}
            size="sm"
            className="shadow-2xs"
          >
            Back to {resourceName}s
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
